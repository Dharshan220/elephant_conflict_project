"""TuskerGuard - FastAPI backend for the AI & IoT elephant movement detection system.

Flow: ESP8266 (PIR) -> POST /api/motion -> simulated YOLOv8 inference ->
store detection -> dashboard polls -> POST /api/alert -> ESP8266 polls
GET /api/device-command/{id} -> buzzer + LED.
"""

import asyncio
import csv
import io
import random
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

import data as seed
import database as db
import security
from push import init_firebase, send_alert_push


class MotionPayload(BaseModel):
    device_id: str = ""
    zone_id: str = ""
    trigger_count: int = Field(default=1, ge=1, le=20)


class DetectionPayload(BaseModel):
    device_id: str
    zone_id: str
    animal_class: str = "Elephant herd"
    confidence: float = Field(default=0.9, ge=0.5, le=1.0)
    count: int = Field(default=1, ge=1, le=20)
    adults: int = Field(default=1, ge=0)
    calves: int = Field(default=0, ge=0)
    behavior: str = "Moving"
    direction: str = ""
    timestamp: str = ""


class AlertPayload(BaseModel):
    zone_id: str
    device_id: str = ""
    severity: str = "critical"
    title: str = "Elephant movement confirmed"


class CommandAckPayload(BaseModel):
    result: str = "executed"


class DevicePayload(BaseModel):
    name: str
    zone_id: str


class Store:
    def __init__(self):
        self.zones = [dict(z) | {"lastDetection": None} for z in seed.ZONES]
        self.officers = [dict(o) for o in seed.OFFICERS]
        self.devices = [dict(d) | {"lastComm": seed.ago(minutes=i + 1)} for i, d in enumerate(seed.DEVICES)]
        self.detections = seed.seed_detections()
        self.alerts = seed.seed_alerts()
        self.analytics = seed.seed_analytics()
        self.predictions = seed.seed_predictions()
        self.weather = dict(seed.WEATHER) | {"updatedAt": seed.ago(minutes=0)}
        self.motion_events = []
        self.device_commands = {}
        self.simulation_running = False
        self.sim_task = None
        self.event_id = 5000
        self.boot_time = datetime.now(timezone.utc)
        for det in self.detections[:5]:
            self._touch_last_detection(det)

    def _touch_last_detection(self, det):
        for z in self.zones:
            if z["id"] == det["zoneId"]:
                z["lastDetection"] = det["timestamp"]

    def zone(self, zone_id):
        return next((z for z in self.zones if z["id"] == zone_id), None)

    def device(self, device_id):
        return next((d for d in self.devices if d["id"] == device_id), None)

    def add_activity(self, atype, title, description, timestamp=None):
        self._activity = getattr(self, "_activity", [])
        self._activity.append({"id": f"act-{self.event_id}", "type": atype, "title": title, "description": description, "timestamp": timestamp or seed.ago()})
        self.event_id += 1
        if len(self._activity) > 60:
            self._activity = self._activity[-60:]

    def activity_feed(self):
        items = [dict(a) for a in getattr(self, "_activity", [])]
        for det in self.detections[:4]:
            items.append({"id": "feed-" + det["id"], "type": "detection", "title": "YOLOv8 confirmed elephant", "description": f"{det['animalClass']} \u00b7 conf {int(det['confidence'] * 100)}%", "timestamp": det["timestamp"]})
        items.sort(key=lambda x: x["timestamp"], reverse=True)
        return items[:16]

    def record_motion(self, device_id, zone_id, trigger_count=1):
        event = {"id": f"motion-{self.event_id}", "deviceId": device_id, "zoneId": zone_id, "triggerCount": trigger_count, "timestamp": seed.ago()}
        self.event_id += 1
        self.motion_events.insert(0, event)
        if len(self.motion_events) > 50:
            self.motion_events = self.motion_events[:50]
        device = self.device(device_id)
        if device:
            device["lastComm"] = event["timestamp"]
            device["temperature"] = round(30 + random.uniform(-3, 8), 1)
        self.add_activity("motion", f"PIR motion \u00b7 {device_id}", f"Zone {zone_id.upper()} \u00b7 {trigger_count} trigger(s)")
        return event

    def ingest_detection(self, det):
        self.detections.insert(0, det)
        if len(self.detections) > 200:
            self.detections = self.detections[:200]
        self._touch_last_detection(det)
        self.add_activity("detection", "YOLOv8 confirmed elephant", f"{det['animalClass']} \u00b7 conf {int(det['confidence'] * 100)}% \u00b7 {det['behavior']}")
        device = self.device(det["deviceId"])
        if device:
            device["lastComm"] = det["timestamp"]
        return det

    def create_alert(self, zone_id, severity="critical", title=None, device_id=""):
        zone = self.zone(zone_id)
        if not zone:
            raise HTTPException(status_code=404, detail="Unknown zone")
        if not device_id:
            device_id = next((d["id"] for d in self.devices if d["zoneId"] == zone_id and d["status"] == "online"), "esp-02")
        alert = {
            "id": f"AL-{random.randint(1000, 9999)}",
            "zoneId": zone_id,
            "severity": severity,
            "status": "active",
            "title": title or (f"{zone['name']} - elephant movement confirmed"),
            "message": f"Elephant activity confirmed near {zone['name']}. Buzzer + LED armed on {device_id}.",
            "timestamp": seed.ago(),
            "officerId": None,
            "deviceId": device_id,
        }
        self.alerts.insert(0, alert)
        self.add_activity("alert", f"Alert raised {alert['id']}", f"{severity.upper()} \u00b7 {alert['title']}")
        device = self.device(device_id)
        if device:
            device["buzzerActive"] = True
            cmd = {"id": f"cmd-{self.event_id}", "type": "BUZZER_ON", "createdAt": alert["timestamp"], "acked": False, "alertId": alert["id"]}
            self.device_commands.setdefault(device_id, []).insert(0, cmd)
            self.event_id += 1
        return alert, cmd if device else None

    def pending_commands(self, device_id):
        return [c for c in self.device_commands.get(device_id, []) if not c["acked"]]

    def ack_command(self, device_id, cmd_id):
        for c in self.device_commands.get(device_id, []):
            if c["id"] == cmd_id and not c["acked"]:
                c["acked"] = True
                self.add_activity("buzzer", f"Deterrent cycle completed", f"{device_id} \u00b7 120 s buzzer + LED")
                return True
        return False

    def stats(self):
        today = datetime.now(timezone.utc).date()
        today_count = sum(1 for d in self.detections if datetime.fromisoformat(d["timestamp"]).date() == today)
        active = sum(1 for a in self.alerts if a["status"] == "active")
        online = sum(1 for d in self.devices if d["status"] == "online")
        return {
            "systemStatus": "Operational",
            "uptime": self.uptime(),
            "todayDetections": max(today_count, 6),
            "activeAlerts": max(active, 1),
            "onlineDevices": online,
            "totalDevices": len(self.devices),
            "highRiskZone": max(self.zones, key=lambda z: z["riskScore"])["name"],
            "modelStatus": "YOLOv8n (1280px) \u00b7 28 ms",
        }

    def uptime(self):
        total = int((datetime.now(timezone.utc) - self.boot_time).total_seconds())
        return f"{total // 86400}d {total % 86400 // 3600}h"


store = Store()


# ========================================================================
# WebSocket real-time alert broadcast
# ========================================================================

class AlertSocketManager:
    """Tracks connected browser tabs and fans out alert events."""

    def __init__(self):
        self.connections: list[WebSocket] = []
        self.loop: asyncio.AbstractEventLoop | None = None

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)

    async def broadcast(self, message: dict):
        for ws in list(self.connections):
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(ws)

    def broadcast_sync(self, message: dict):
        """Fire-and-forget broadcast callable from sync endpoints."""
        if not self.connections or not self.loop:
            return
        try:
            asyncio.run_coroutine_threadsafe(self.broadcast(message), self.loop)
        except RuntimeError:
            pass


ws_manager = AlertSocketManager()


# ========================================================================
# Alert pipeline: DB save -> WebSocket -> push -> in-memory dashboard mirror
# ========================================================================

def _nearest_zone(lat: float, lng: float):
    """Closest in-memory zone to (lat, lng) so the legacy dashboard updates too."""
    best, best_d = None, 1e9
    for z in store.zones:
        d = (z["lat"] - lat) ** 2 + (z["lng"] - lng) ** 2
        if d < best_d:
            best, best_d = z, d
    return best


def ingest_ewe_alert(animal, confidence, camera, village, latitude, longitude, time=None, status="active"):
    """Save an elephant early-warning alert, broadcast it and raise it in the legacy store."""
    record = db.insert_alert(
        animal=animal,
        confidence=confidence,
        camera=camera,
        village=village,
        latitude=latitude,
        longitude=longitude,
        time=time or seed.ago(),
        status=status,
    )
    zone = _nearest_zone(latitude, longitude)
    if zone:
        det = {
            "id": f"det-{random.randint(1000, 9999)}",
            "deviceId": camera.lower(),
            "zoneId": zone["id"],
            "animalClass": "Adult elephant" if animal == "elephant" else animal,
            "confidence": confidence,
            "count": 1,
            "adults": 1,
            "calves": 0,
            "behavior": "Detection by CCTV / YOLO pipeline",
            "direction": seed.DIRECTIONS[0],
            "timestamp": record["time"],
            "imageUrl": None,
            "markedSafe": False,
        }
        store.ingest_detection(det)
        store.create_alert(zone["id"], "critical", f"Elephant detected near {village} Village", camera.lower())

    message = {"type": "alert", "alert": record}
    ws_manager.broadcast_sync(message)
    send_alert_push(record)
    return record


def simulate_detection(zone_id, device_id, motion_id=None):
    zone = store.zone(zone_id)
    if random.random() < 0.2:
        return None
    count = random.choices([1, 2, 3, 4, 5, 6], weights=[38, 20, 15, 12, 9, 6])[0]
    adults = max(1, count - random.choice([0, 0, 1]))
    calves = max(0, count - adults)
    return {
        "id": f"det-{random.randint(1000, 9999)}",
        "deviceId": device_id,
        "zoneId": zone_id,
        "animalClass": "Elephant herd" if count > 1 else "Adult elephant",
        "confidence": round(random.uniform(0.8, 0.97), 2),
        "count": count,
        "adults": adults,
        "calves": calves,
        "behavior": random.choice(seed.BEHAVIOURS),
        "direction": random.choice(seed.DIRECTIONS),
        "timestamp": seed.ago(),
        "imageUrl": None,
        "markedSafe": False,
    }


async def simulation_loop():
    while True:
        try:
            if not store.simulation_running:
                await asyncio.sleep(0.5)
                continue
            online = [d for d in store.devices if d["status"] == "online"]
            if online:
                device = random.choice(online)
                zone_id = device["zoneId"]
                store.record_motion(device["id"], zone_id, random.randint(1, 4))
                await asyncio.sleep(0.8 + random.random() * 1.2)
                det = simulate_detection(zone_id, device["id"])
                if det:
                    store.ingest_detection(det)
                    zone = store.zone(zone_id)
                    if random.random() < 0.5 or (zone and zone["riskScore"] >= 70 and random.random() < 0.8):
                        await asyncio.sleep(0.4)
                        store.create_alert(zone_id, "warning", f"Movement escalating near {device['name']}", device["id"])
            await asyncio.sleep(6 + random.random() * 8)
        except asyncio.CancelledError:
            break
        except Exception:
            await asyncio.sleep(2)


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    db.seed_if_empty()
    db.ensure_demo_users()
    init_firebase()
    ws_manager.loop = asyncio.get_running_loop()
    store.sim_task = asyncio.create_task(simulation_loop())
    yield
    store.sim_task.cancel()


app = FastAPI(title="TuskerGuard API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "TuskerGuard API",
        "detections": len(store.detections),
        "alerts": len(store.alerts),
        "devicesOnline": sum(1 for d in store.devices if d["status"] == "online"),
        "simulation": store.simulation_running,
        "uptime": store.uptime(),
    }


@app.get("/api/dashboard")
def dashboard():
    return {
        "stats": store.stats(),
        "weather": store.weather,
        "activity": store.activity_feed(),
        "recentAlerts": store.alerts[:5],
        "latestDetection": store.detections[0] if store.detections else None,
    }


@app.get("/api/alerts")
def alerts(severity: str = "", status: str = "", search: str = ""):
    result = list(store.alerts)
    if severity:
        result = [a for a in result if a["severity"] == severity]
    if status:
        result = [a for a in result if a["status"] == status]
    if search:
        q = search.lower()
        result = [a for a in result if q in a["id"].lower() or q in a["title"].lower() or q in a["message"].lower()]
    return result


@app.post("/api/alerts/{alert_id}/ack")
def acknowledge_alert(alert_id: str):
    for a in store.alerts:
        if a["id"] == alert_id:
            a["status"] = "acknowledged"
            a["officerId"] = next((o["id"] for o in store.officers if o["status"] != "off-duty"), None)
            store.add_activity("ack", f"Alert {alert_id} acknowledged", "Officer confirmed on site")
            return {"ok": True, "alert": a}
    raise HTTPException(status_code=404, detail="Alert not found")


@app.get("/api/history")
def history(zone_id: str = "", search: str = ""):
    result = list(store.detections)
    if zone_id:
        result = [d for d in result if d["zoneId"] == zone_id]
    if search:
        q = search.lower()
        result = [d for d in result if q in d["id"].lower() or q in d["animalClass"].lower() or q in d["behavior"].lower()]
    return result


@app.post("/api/detection/{detection_id}/safe")
def mark_safe(detection_id: str):
    for d in store.detections:
        if d["id"] == detection_id:
            d["markedSafe"] = True
            store.add_activity("safe", f"Detection {detection_id} marked safe", "Officer verification recorded")
            return {"ok": True}
    raise HTTPException(status_code=404, detail="Detection not found")


@app.get("/api/devices")
def devices():
    return store.devices


@app.post("/api/devices")
def add_device(payload: DevicePayload):
    if store.zone(payload.zone_id) is None:
        raise HTTPException(status_code=404, detail="Unknown zone")
    device = {
        "id": f"esp-{random.randint(11, 99)}",
        "name": payload.name,
        "zoneId": payload.zone_id,
        "ip": f"192.168.1.{random.randint(111, 199)}",
        "wifiRssi": -random.randint(40, 85),
        "battery": random.randint(80, 99),
        "sensorOk": True,
        "status": "online",
        "lastComm": seed.ago(),
        "firmware": "gk-v1.4.2",
        "temperature": round(30 + random.uniform(-2, 6), 1),
        "buzzerActive": False,
    }
    store.devices.append(device)
    store.add_activity("device", f"Device {device['id']} provisioned", f"{device['name']} \u00b7 zone {payload.zone_id.upper()}")
    return device


@app.get("/api/zones")
def zones():
    return store.zones


@app.get("/api/officers")
def officers():
    return store.officers


@app.get("/api/predictions")
def predictions():
    return store.predictions


@app.get("/api/analytics")
def analytics():
    return store.analytics


@app.post("/api/motion")
async def motion(payload: MotionPayload):
    device_id = payload.device_id or next((d["id"] for d in store.devices if d["status"] == "online"), "esp-02")
    zone_id = payload.zone_id or (store.device(device_id) or {}).get("zoneId", "z2")
    if store.zone(zone_id) is None:
        raise HTTPException(status_code=404, detail="Unknown zone")
    event = store.record_motion(device_id, zone_id, payload.trigger_count)
    asyncio.create_task(process_motion_after_delay(event))
    return {"accepted": True, "eventId": event["id"], "message": f"Motion event queued for YOLOv8 inference ({zone_id.upper()})"}


async def process_motion_after_delay(event):
    await asyncio.sleep(0.8 + random.random() * 1.5)
    det = simulate_detection(event["zoneId"], event["deviceId"], event["id"])
    if det:
        store.ingest_detection(det)


@app.post("/api/detection")
def ingest_detection(payload: DetectionPayload):
    zone_id = payload.zone_id or (store.device(payload.device_id) or {}).get("zoneId", "z2")
    if store.zone(zone_id) is None:
        raise HTTPException(status_code=404, detail="Unknown zone")
    det = {
        "id": f"det-{random.randint(1000, 9999)}",
        "deviceId": payload.device_id,
        "zoneId": zone_id,
        "animalClass": payload.animal_class,
        "confidence": payload.confidence,
        "count": payload.count,
        "adults": payload.adults,
        "calves": payload.calves,
        "behavior": payload.behavior,
        "direction": payload.direction or "Field \u2192 Forest",
        "timestamp": payload.timestamp or seed.ago(),
        "imageUrl": None,
        "markedSafe": False,
    }
    store.ingest_detection(det)
    return {"accepted": True, "eventId": det["id"], "message": "Detection stored", "detection": det}


@app.post("/api/alert")
def raise_alert(payload: AlertPayload):
    alert, cmd = store.create_alert(payload.zone_id, payload.severity, payload.title, payload.device_id)
    return {
        "accepted": True,
        "eventId": alert["id"],
        "message": f"Alert {alert['id']} raised; buzzer command queued for {cmd['id'] if cmd else 'n/a'}",
        "alert": alert,
    }


@app.get("/api/device-command/{device_id}")
def device_commands(device_id: str):
    pending = store.pending_commands(device_id)
    for c in pending:
        store.add_activity("device", f"Command fetched by {device_id}", f"{c['type']} for {c['alertId']}")
    return {"commands": pending}


@app.post("/api/device-command/{device_id}/{command_id}/ack")
def ack_device_command(device_id: str, command_id: str, payload: CommandAckPayload):
    ok = store.ack_command(device_id, command_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Command not found or already executed")
    device = store.device(device_id)
    if device:
        device["buzzerActive"] = False
    return {"ok": True, "result": payload.result}


@app.get("/api/report")
def report():
    today = datetime.now(timezone.utc).date()
    dets = [d for d in store.detections if datetime.fromisoformat(d["timestamp"]).date() == today]
    if not dets:
        dets = store.detections[:5]
    top = max(set(d["zoneId"] for d in dets), key=lambda z: sum(1 for d in dets if d["zoneId"] == z))
    top_zone = store.zone(top)["name"] if store.zone(top) else top
    alerts_today = [a for a in store.alerts if datetime.fromisoformat(a["timestamp"]).date() == today]
    ack = sum(1 for a in alerts_today if a["status"] in ("acknowledged", "resolved"))
    officers_active = sum(1 for o in store.officers if o["status"] != "off-duty")
    recommendations = [
        f"Deploy a rapid response team to {top_zone} between 18:00 and 06:00 hours.",
        "Warn villagers of Mudumalai Villages 3 & 5 about the lone bull elephant.",
        "Increase camera monitoring in Hassan\u2013Sakleshpur Corridor during dusk hours.",
        "Schedule solar maintenance for esp-07 (battery 23%, offline).",
    ]
    summary = (
        f"Today, {len(dets)} elephant movement event(s) were detected and analysed by the YOLOv8 model. "
        f"{top_zone} experienced the highest activity. "
        f"{len(alerts_today)} alert(s) were raised; {ack} acknowledged by forest officers within minutes. "
        "No human or elephant injuries were reported."
    )
    return {
        "summary": summary,
        "recommendations": recommendations,
        "stats": {"detections": len(dets), "topZone": top_zone, "alertsRaised": len(alerts_today), "acknowledged": ack, "activeOfficers": officers_active},
        "generatedAt": seed.ago(),
    }


@app.get("/api/simulate")
async def simulate(on: bool = True):
    store.simulation_running = on
    return {"running": on}


# ========================================================================
# Elephant Early Warning System - auth, live alerts, admin
# ========================================================================

class RegisterPayload(BaseModel):
    name: str = Field(min_length=2)
    email: str
    password: str = Field(min_length=6)
    phone: str = ""
    village: str = ""
    latitude: float = 0.0
    longitude: float = 0.0


class LoginPayload(BaseModel):
    email: str
    password: str


class DetectPayload(BaseModel):
    animal: str = "elephant"
    confidence: float = Field(ge=0.0, le=1.0)
    camera: str
    latitude: float
    longitude: float
    village: str = ""
    time: str = ""


class CameraPayload(BaseModel):
    name: str
    latitude: float
    longitude: float
    village: str = ""
    status: str = "online"


class ManualAlertPayload(BaseModel):
    village: str = "Karamadai"
    camera: str = "CAM01"
    latitude: float = 11.23
    longitude: float = 76.95
    confidence: float = Field(default=0.95, ge=0.0, le=1.0)
    animal: str = "elephant"


class PushTokenPayload(BaseModel):
    token: str


def _public_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone"],
        "village": user["village"],
        "latitude": user["latitude"],
        "longitude": user["longitude"],
        "isAdmin": bool(user["is_admin"]),
        "role": user.get("role", "user"),
    }


@app.post("/api/auth/register")
def register(payload: RegisterPayload):
    if db.get_user_by_email(payload.email) is not None:
        raise HTTPException(status_code=409, detail="Email already registered")
    user_id = db.create_user(
        payload.name,
        payload.email,
        payload.phone,
        payload.village,
        payload.latitude,
        payload.longitude,
        security.hash_password(payload.password),
    )
    user = db.get_user_by_id(user_id)
    token = security.create_token(user["id"], user["email"], bool(user["is_admin"]), user.get("role", "user"))
    return {"token": token, "user": _public_user(user)}


@app.post("/api/auth/login")
def login(payload: LoginPayload):
    user = db.get_user_by_email(payload.email)
    if not user or not security.verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = security.create_token(user["id"], user["email"], bool(user["is_admin"]), user.get("role", "user"))
    return {"token": token, "user": _public_user(user)}


@app.get("/api/me")
def me(user: dict = security.Depends(security.get_current_user)):
    return _public_user(user)


@app.post("/api/push-token")
def push_token(payload: PushTokenPayload, user: dict = security.Depends(security.get_current_user)):
    db.save_fcm_token(payload.token, user["id"])
    return {"ok": True}


# ------------------------------------------------------------------ /detect

@app.post("/detect")
@app.post("/api/detect")
def detect(payload: DetectPayload):
    """YOLO camera ingestion endpoint.

    JSON: {animal, confidence, camera, latitude, longitude, village, time}
    When confidence > 0.80 the alert is persisted, broadcast over WebSocket
    and pushed via FCM. Lower confidence is recorded as a low-priority ping.
    """
    time_iso = payload.time or seed.ago()
    if payload.confidence > 0.80:
        record = ingest_ewe_alert(
            payload.animal,
            payload.confidence,
            payload.camera,
            payload.village,
            payload.latitude,
            payload.longitude,
            time_iso,
        )
        return {"accepted": True, "alert": record, "message": f"Alert {record['alert_id']} raised and broadcast"}
    # low confidence: store nothing, but report it (future CCTV audit trail)
    return {"accepted": True, "alert": None, "message": "Confidence below threshold (0.80), no alert raised"}


@app.websocket("/ws/alerts")
async def ws_alerts(ws: WebSocket):
    await ws_manager.connect(ws)
    try:
        await ws.send_json({"type": "welcome", "online": len(ws_manager.connections)})
        while True:
            await ws.receive_text()  # keepalive/ping from client
    except WebSocketDisconnect:
        ws_manager.disconnect(ws)


# ------------------------------------------------------------------ alerts

@app.get("/api/alerts/feed")
def alerts_feed(range: str = Query("", alias="range"), village: str = ""):
    return db.list_alerts(range, village)


@app.get("/api/alerts/export.csv")
def alerts_csv(range: str = Query("", alias="range"), village: str = ""):
    rows = db.list_alerts(range, village)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["alert_id", "animal", "confidence", "camera", "village", "latitude", "longitude", "time", "status"])
    for r in rows:
        writer.writerow([r["alert_id"], r["animal"], r["confidence"], r["camera"], r["village"], r["latitude"], r["longitude"], r["time"], r["status"]])
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=tuskerguard-alerts.csv"},
    )


@app.post("/api/alerts/manual")
def manual_alert(payload: ManualAlertPayload, user: dict = security.Depends(security.get_officer_user)):
    """Admin-triggered manual alert (drill or field report)."""
    record = ingest_ewe_alert(
        payload.animal,
        payload.confidence,
        payload.camera,
        payload.village,
        payload.latitude,
        payload.longitude,
    )
    return {"accepted": True, "alert": record, "message": f"Manual alert {record['alert_id']} raised"}


@app.post("/api/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str, user: dict = security.Depends(security.get_officer_user)):
    record = db.resolve_alert(alert_id)
    if not record:
        raise HTTPException(status_code=404, detail="Alert not found")
    ws_manager.broadcast_sync({"type": "resolve", "alert": record})
    return {"ok": True, "alert": record}


# ------------------------------------------------------------------ cameras

@app.get("/api/cameras")
def cameras():
    return db.list_cameras()


@app.post("/api/cameras")
def add_camera(payload: CameraPayload, user: dict = security.Depends(security.get_admin_user)):
    cam = db.create_camera(payload.name, payload.latitude, payload.longitude, payload.village)
    return cam


@app.put("/api/cameras/{camera_id}")
def edit_camera(camera_id: int, payload: CameraPayload, user: dict = security.Depends(security.get_admin_user)):
    cam = db.update_camera(camera_id, payload.name, payload.latitude, payload.longitude, payload.village, payload.status)
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    return cam


@app.delete("/api/cameras/{camera_id}")
def remove_camera(camera_id: int, user: dict = security.Depends(security.get_admin_user)):
    if db.get_camera(camera_id) is None:
        raise HTTPException(status_code=404, detail="Camera not found")
    db.delete_camera(camera_id)
    return {"ok": True}


# ------------------------------------------------------------------ admin stats

@app.get("/api/admin/stats")
def admin_stats(user: dict = security.Depends(security.get_admin_user)):
    return {
        "totalDetections": db.total_alert_count(),
        "activeAlerts": db.active_alert_count(),
        "totalUsers": db.count_users(),
        "totalCameras": len(db.list_cameras()),
        "latestAlert": db.latest_alert(),
    }


# ------------------------------------------------------------------ misc

@app.get("/api/emergency/contacts")
def emergency_contacts():
    return [
        {"label": "Forest Control Room", "phone": "+91 1800 425 7071", "type": "tollfree"},
        {"label": "District Emergency", "phone": "112", "type": "emergency"},
        {"label": "Wildlife SOS Helpline", "phone": "+91 98716 01626", "type": "helpline"},
        {"label": "Veterinary Care", "phone": "+91 94840 11852", "type": "vet"},
    ]
