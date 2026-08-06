"""Seed data generators for the TuskerGuard backend (relative to 'now' so the demo always looks fresh)."""

import random
from datetime import datetime, timedelta, timezone

ZONES = [
    {"id": "z1", "name": "BRT Tiger Reserve Corridor", "district": "Chamrajnagar, Karnataka", "risk": "low", "riskScore": 22, "lat": 11.9, "lng": 77.1, "radius": 0.14, "officerIds": ["o1", "o4"], "elephantCount": 4, "description": "Forest corridor near BJ College road; historically low cropland incursion."},
    {"id": "z2", "name": "Muthanga\u2013Wayanad Fringe", "district": "Wayanad, Kerala", "risk": "high", "riskScore": 86, "lat": 11.66, "lng": 76.22, "radius": 0.12, "officerIds": ["o2", "o3"], "elephantCount": 9, "description": "Dense settlement interface with seasonal maize fields; frequent raiding corridor."},
    {"id": "z3", "name": "Hassan\u2013Sakleshpur Corridor", "district": "Hassan, Karnataka", "risk": "medium", "riskScore": 58, "lat": 12.9, "lng": 75.79, "radius": 0.13, "officerIds": ["o5", "o1"], "elephantCount": 6, "description": "Coffee-estate border section with railway line; movement spikes at dusk."},
    {"id": "z4", "name": "Valparai\u2013Anamalai Belt", "district": "Coimbatore, Tamil Nadu", "risk": "low", "riskScore": 31, "lat": 10.38, "lng": 76.95, "radius": 0.14, "officerIds": ["o6"], "elephantCount": 3, "description": "Tea plantation belt; herd movement mostly contained to shola patches."},
    {"id": "z5", "name": "Mudumalai Fringe Villages", "district": "Nilgiris, Tamil Nadu", "risk": "high", "riskScore": 74, "lat": 11.58, "lng": 76.56, "radius": 0.13, "officerIds": ["o2", "o5"], "elephantCount": 7, "description": "Village boundary abutting Mudumalai TR; crop raiding reports during harvest."},
]

OFFICERS = [
    {"id": "o1", "name": "R. Karthik", "role": "Forest Range Officer", "zoneId": "z1", "phone": "+91 94480 22181", "status": "available"},
    {"id": "o2", "name": "S. Meena", "role": "Wildlife Veterinary Surgeon", "zoneId": "z2", "phone": "+91 94480 27339", "status": "on-patrol"},
    {"id": "o3", "name": "A. Joseph", "role": "Deputy Range Officer", "zoneId": "z3", "phone": "+91 94840 11852", "status": "available"},
    {"id": "o4", "name": "P. Lakshmi", "role": "Field Officer", "zoneId": "z1", "phone": "+91 96000 77314", "status": "on-patrol"},
    {"id": "o5", "name": "V. Anand", "role": "Rapid Response Patrol Head", "zoneId": "z5", "phone": "+91 90080 44627", "status": "available"},
    {"id": "o6", "name": "K. Divya", "role": "Forest Guard", "zoneId": "z4", "phone": "+91 90190 35846", "status": "off-duty"},
]

DEVICES = [
    {"id": "esp-01", "name": "Edge Node 01 \u00b7 BRT Gate", "zoneId": "z1", "ip": "192.168.1.101", "wifiRssi": -52, "battery": 92, "sensorOk": True, "status": "online", "firmware": "gk-v1.4.2", "temperature": 34.1, "buzzerActive": False},
    {"id": "esp-02", "name": "Edge Node 02 \u00b7 Muthanga Field", "zoneId": "z2", "ip": "192.168.1.102", "wifiRssi": -44, "battery": 78, "sensorOk": True, "status": "online", "firmware": "gk-v1.4.2", "temperature": 36.8, "buzzerActive": False},
    {"id": "esp-03", "name": "Edge Node 03 \u00b7 Muthanga Maize Belt", "zoneId": "z2", "ip": "192.168.1.103", "wifiRssi": -67, "battery": 64, "sensorOk": True, "status": "online", "firmware": "gk-v1.4.2", "temperature": 37.2, "buzzerActive": False},
    {"id": "esp-04", "name": "Edge Node 04 \u00b7 Sakleshpur Rail Track", "zoneId": "z3", "ip": "192.168.1.104", "wifiRssi": -84, "battery": 41, "sensorOk": True, "status": "warning", "firmware": "gk-v1.4.0", "temperature": 33.5, "buzzerActive": False},
    {"id": "esp-05", "name": "Edge Node 05 \u00b7 Valparai Estate", "zoneId": "z4", "ip": "192.168.1.105", "wifiRssi": -58, "battery": 87, "sensorOk": True, "status": "online", "firmware": "gk-v1.4.2", "temperature": 29.9, "buzzerActive": False},
    {"id": "esp-06", "name": "Edge Node 06 \u00b7 Mudumalai Village 3", "zoneId": "z5", "ip": "192.168.1.106", "wifiRssi": -49, "battery": 71, "sensorOk": True, "status": "online", "firmware": "gk-v1.4.2", "temperature": 30.4, "buzzerActive": False},
    {"id": "esp-07", "name": "Edge Node 07 \u00b7 Mudumalai Village 5", "zoneId": "z5", "ip": "192.168.1.107", "wifiRssi": -73, "battery": 23, "sensorOk": False, "status": "offline", "firmware": "gk-v1.3.8", "temperature": 0.0, "buzzerActive": False},
    {"id": "esp-08", "name": "Edge Node 08 \u00b7 BRT South Fence", "zoneId": "z1", "ip": "192.168.1.108", "wifiRssi": -61, "battery": 55, "sensorOk": True, "status": "online", "firmware": "gk-v1.4.2", "temperature": 32.2, "buzzerActive": False},
    {"id": "esp-09", "name": "Edge Node 09 \u00b7 Wayanad Approach", "zoneId": "z2", "ip": "192.168.1.109", "wifiRssi": -55, "battery": 66, "sensorOk": True, "status": "online", "firmware": "gk-v1.4.1", "temperature": 35.0, "buzzerActive": False},
    {"id": "esp-10", "name": "Edge Node 10 \u00b7 Hassan Fringe", "zoneId": "z3", "ip": "192.168.1.110", "wifiRssi": -72, "battery": 48, "sensorOk": True, "status": "warning", "firmware": "gk-v1.4.0", "temperature": 34.5, "buzzerActive": False},
]

ANIMAL_CLASSES = ["Elephant herd", "Adult elephant", "Juvenile elephant", "Elephant herd"]
BEHAVIOURS = ["Moving", "Standing", "Grazing", "Running", "Returning to Forest"]
DIRECTIONS = ["Field \u2192 Forest", "Near village gate", "Parallel to railway", "Corridor transit", "Canal bund approach", "Estate boundary", "Settlement approach", "Orchard edge"]

ALERT_TEMPLATES = {
    "critical": [
        ("Herd crossing into crop field", "Herd detected near community boundary. Buzzer activated on {device}."),
        ("Night crop raid in progress", "Elephants inside field perimeter. Rapid response dispatched."),
    ],
    "warning": [
        ("Movement at settlement boundary", "Solo bull elephant approaching {zone}. Patrol dispatched."),
        ("Crossing near infrastructure", "Herd moving along the track. Officer notified."),
    ],
    "info": [
        ("Routine night movement", "Herd used corridor without entering farmland."),
        ("Distant movement logged", "Movement along boundary only; no villagers at risk."),
    ],
}

SEVERITY_ORDER = {"critical": 0, "warning": 1, "info": 2}


def now():
    return datetime.now(timezone.utc)


def ago(minutes=0, hours=0, days=0):
    return (now() - timedelta(minutes=minutes, hours=hours, days=days)).isoformat()


def seed_detections():
    rng = random.Random(42)
    dets = []
    counter = 1042
    weights = [("z2", 6), ("z5", 5), ("z3", 4), ("z1", 2), ("z4", 1)]
    for day in range(7):
        for _ in range(rng.randint(3, 7)):
            zone_id = rng.choices([w[0] for w in weights], weights=[w[1] for w in weights])[0]
            count = rng.choices([1, 2, 3, 4, 5, 6], weights=[40, 18, 14, 12, 9, 7])[0]
            adults = max(1, count - rng.choice([0, 0, 1]))
            calves = max(0, count - adults)
            counter -= 1
            dets.append({
                "id": f"det-{counter}",
                "deviceId": rng.choice([d["id"] for d in DEVICES if d["zoneId"] == zone_id and d["status"] != "offline"]),
                "zoneId": zone_id,
                "animalClass": "Elephant herd" if count > 1 else "Adult elephant",
                "confidence": round(rng.uniform(0.78, 0.97), 2),
                "count": count,
                "adults": adults,
                "calves": calves,
                "behavior": rng.choice(BEHAVIOURS),
                "direction": rng.choice(DIRECTIONS),
                "timestamp": ago(hours=rng.randint(0, 23), minutes=rng.randint(0, 59), days=day),
                "imageUrl": None,
                "markedSafe": rng.random() < 0.15,
            })
    dets.sort(key=lambda d: d["timestamp"], reverse=True)
    return dets


def seed_alerts():
    rng = random.Random(7)
    alerts = []
    counter = 4240
    for _ in range(10):
        severity = rng.choices(["critical", "warning", "info"], weights=[25, 45, 30])[0]
        title, message_tpl = rng.choice(ALERT_TEMPLATES[severity])
        zone_id = rng.choice(["z2", "z5", "z3", "z1", "z4"])
        device = rng.choice([d["id"] for d in DEVICES if d["zoneId"] == zone_id])
        status = rng.choices(["active", "acknowledged", "resolved"], weights=[20, 30, 50])[0]
        counter -= 1
        alerts.append({
            "id": f"AL-0{counter}",
            "zoneId": zone_id,
            "severity": severity,
            "status": status,
            "title": title,
            "message": message_tpl.format(device=device, zone=zone_id.upper()),
            "timestamp": ago(minutes=rng.randint(3, 240), hours=rng.randint(0, 15)),
            "officerId": rng.choice([o["id"] for o in OFFICERS]) if status != "active" else None,
            "deviceId": device,
        })
    alerts.sort(key=lambda a: a["timestamp"], reverse=True)
    return alerts


def seed_activity(detections, alerts):
    items = []
    for i, det in enumerate(detections[:6]):
        items.append({"id": f"act-det-{i}", "type": "detection", "title": "YOLOv8 confirmed elephant", "description": f"{det['animalClass']} detected \u00b7 conf {int(det['confidence'] * 100)}%", "timestamp": det["timestamp"]})
    for i, al in enumerate(alerts[:5]):
        items.append({"id": f"act-al-{i}", "type": "alert", "title": f"Alert raised {al['id']}", "description": f"{al['severity'].upper()} \u00b7 {al['title']}", "timestamp": al["timestamp"]})
        if al["status"] == "acknowledged":
            items.append({"id": f"act-ack-{i}", "type": "ack", "title": f"Alert {al['id']} acknowledged", "description": "Officer confirmed on site", "timestamp": al["timestamp"]})
    items.append({"id": "act-p1", "type": "patrol", "title": "Rapid response dispatched", "description": "S. Meena + RRT squad en route to Muthanga", "timestamp": ago(minutes=6)})
    items.append({"id": "act-b1", "type": "buzzer", "title": "Deterrent cycle completed", "description": "esp-03 buzzer cycled 120 s", "timestamp": ago(minutes=30)})
    items.sort(key=lambda x: x["timestamp"], reverse=True)
    return items[:14]


def seed_analytics():
    return {
        "daily": [12, 18, 9, 21, 15, 27, 19],
        "weekly": [84, 96, 61, 118, 132, 74, 105, 128],
        "monthly": [302, 341, 288, 367, 421, 389],
        "zoneComparison": [{"zone": "BRT Corridor", "count": 48}, {"zone": "Muthanga", "count": 142}, {"zone": "Hassan", "count": 89}, {"zone": "Valparai", "count": 34}, {"zone": "Mudumalai", "count": 117}],
        "behavior": [{"label": "Moving", "value": 46}, {"label": "Standing", "value": 22}, {"label": "Grazing", "value": 18}, {"label": "Running", "value": 6}, {"label": "Returning to Forest", "value": 8}],
        "severity": [{"label": "Critical", "value": 14}, {"label": "Warning", "value": 43}, {"label": "Info", "value": 39}],
        "hourly": [8, 5, 3, 2, 1, 2, 3, 5, 9, 12, 11, 14, 16, 12, 15, 18, 21, 26, 31, 28, 24, 18, 12, 9],
        "confidenceAvg": 88.7,
        "total30d": 430,
        "alertsResolvedPct": 78,
        "activeOfficers": 4,
    }


def seed_predictions():
    rng = random.Random(int(datetime.now(timezone.utc).date().toordinal()))
    hourly = []
    base = [62, 71, 44, 22, 18, 24, 21, 30, 46, 78, 89, 83]
    for i, hour in enumerate([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]):
        today = max(5, min(97, base[i] + rng.randint(-4, 5)))
        hourly.append({"hour": hour, "today": today, "tomorrow": max(5, min(97, today + rng.randint(-6, 6)))})
    slots = ["00\u201304", "04\u201308", "08\u201312", "12\u201316", "16\u201320", "20\u201324"]
    heatmap = []
    level_pattern = {"z1": [1, 0, 0, 0, 1, 2], "z2": [3, 1, 0, 1, 2, 3], "z3": [2, 1, 0, 0, 2, 2], "z4": [1, 0, 0, 0, 1, 1], "z5": [3, 1, 0, 1, 2, 3]}
    for zone in ZONES:
        for i, slot in enumerate(slots):
            level = level_pattern.get(zone["id"], [0] * 6)[i]
            heatmap.append({"zoneId": zone["id"], "slot": slot, "level": level})
    return {
        "zones": [{"zoneId": z["id"], "zoneName": z["name"], "riskScore": z["riskScore"], "risk": z["risk"], "elephantProbability": min(97, z["riskScore"] + 8), "trend": {"z2": 12, "z5": 6, "z3": -4}.get(z["id"], -2)} for z in ZONES],
        "hourly": hourly,
        "heatmap": heatmap,
        "model": {"model": "YOLOv8n (1280px)", "accuracy": 94.2, "mae": 0.31, "datasetSize": 12840, "lastTrained": "2025-11-28", "inferenceMs": 28},
    }


WEATHER = {
    "temp": 24,
    "humidity": 71,
    "windSpeed": 12,
    "condition": "Partly Cloudy",
    "rainfall": "Light in Nilgiris",
}


def new_id(prefix):
    return f"{prefix}-{random.randint(10000, 99999)}"
