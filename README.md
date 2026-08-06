# TuskerGuard — AI & IoT Elephant Movement Detection

**AI + IoT powered intelligent system for real-time elephant movement detection and prevention of human–elephant conflict** (Smart India Hackathon project).

Dark, professional government-monitoring dashboard tracking elephant movement across 5 Western-Ghats zones using an ESP8266 PIR sensor grid, a YOLOv8 detection engine and a FastAPI gateway.

## Architecture

```
ESP8266 (PIR sensor)
      │  POST /api/motion          (HTTP, never direct-to-dashboard)
      ▼
FastAPI backend  ──▶  simulated YOLOv8 inference (AI detection)
      │  stores detection / alert
      ▼
React dashboard (polling, updates in real time)
      ▲
      │  GET /api/device-command/{id}   ──▶  buzzer + LED (deterrent)
ESP8266 polls commands and activates hardware
```

**Rule enforced:** the website NEVER communicates directly with ESP8266 hardware — all traffic flows through FastAPI APIs.

## Project structure

```
├── frontend/          React 18 + Vite + TypeScript + Tailwind + Framer Motion
│                      React Router · Axios · React Leaflet · Chart.js · Lucide
├── backend/           FastAPI gateway + in-memory store + auto-simulator
├── hardware/          ESP8266 (NodeMCU) Arduino sketch (PIR + buzzer + LED)
└── README.md
```

## Quick start

### 1. Backend (FastAPI, port 8000)

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate          # Windows · on Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8000      # reload flag for dev: --reload
```

Optional: enable the demo auto-simulator (random PIR events → detections → alerts every few seconds):

```
GET http://localhost:8000/api/simulate?on=true
```

### 2. Frontend (Vite, port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The dashboard runs in **Demo Mode** (mock data) if the backend is unreachable, and switches to **LIVE** automatically when the API is up.

### 3. Simulate an ESP8266 node (no hardware needed)

```bash
cd backend
.\.venv\Scripts\python.exe device_simulator.py --device esp-02 --zone z2
```

Watch it POST motion events, poll commands and print buzzer activations when alerts fire.

### 4. Real hardware (optional)

Flash `hardware/tuskerguard_esp8266/tuskerguard_esp8266.ino` (Arduino IDE, NodeMCU board). Set the Wi-Fi credentials and `API_HOST` to your laptop's LAN IP. Wiring: PIR → D1, buzzer → D6, LED → D7. Needs `ESP8266WiFi`, `ESP8266HTTPClient`, `ArduinoJson` libraries.

## REST API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Service status, counters, simulator state |
| GET | `/api/dashboard` | Stats, weather, activity feed, recent alerts, latest detection |
| GET | `/api/alerts` | Alert list (filters: `severity`, `status`, `search`) |
| POST | `/api/alerts/{id}/ack` | Acknowledge an alert (assigns officer) |
| GET | `/api/history` | Detection history (filters: `zone_id`, `search`) |
| POST | `/api/detection/{id}/safe` | Mark detection as verified-safe |
| GET | `/api/devices` · POST `/api/devices` | List / provision ESP8266 nodes |
| GET | `/api/zones` · `/api/officers` | Zone grid & officer roster |
| GET | `/api/predictions` | Zone risk, hourly forecast, heatmap, model meta |
| GET | `/api/analytics` | Chart datasets (daily/weekly/monthly, behaviour, severity…) |
| POST | `/api/motion` | ESP8266 PIR event → queues YOLO inference |
| POST | `/api/detection` | External YOLO ingestion |
| POST | `/api/alert` | Raise alert → queues buzzer command |
| GET | `/api/device-command/{device_id}` | ESP8266 polls for commands (`BUZZER_ON`) |
| POST | `/api/device-command/{id}/{cmd}/ack` | ESP8266 confirms command executed |
| GET | `/api/report` | AI-generated daily incident summary + recommendations |
| GET | `/api/simulate?on=true` | Toggle the background simulator |

## Dashboard features

- **Dashboard** — animated stat counters, high-risk zone, weather, detection trend chart, live activity stream, recent alerts, quick actions (report / dispatch / test alert)
- **Live Detection** — simulated camera feed with YOLO bounding box, confidence, count (adults/calves), behaviour, direction, alert & mark-safe actions
- **Zone Map** — OpenStreetMap with 5 clickable risk-coded zones (popups: risk, last detection, officer, elephant count)
- **Alerts** — searchable / filterable / sortable table with acknowledge workflow
- **History** — table + timeline views, CSV export
- **Analytics** — daily/weekly/monthly trends, zone comparison, behaviour & severity charts, hourly radar
- **Devices** — ESP8266 cards (WiFi RSSI, battery, temperature, status, last comm)
- **AI Prediction** — zone risk cards, today-vs-tomorrow forecast graph, risk × time heatmap, model health
- **AI Assistant** — chatbot answering live questions, auto-generating incident reports
- **Settings** — alert sound (real beep), dark/light theme, SMS/email, zone names, device configuration

## Notes

- All backend data is in-memory and seeded relative to *now*, so the demo always looks live.
- Frontend silently falls back to realistic mock data when the API is offline (Demo Mode).

## Early Warning System (new modules)

A full-stack elephant early warning layer on top of the core API — real-time alerts, user accounts, SMS/push-style notifications and an admin console.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| System Admin | `admin@tusker.gov.in` | `admin123` |
| Farmer / User | `farmer@tusker.gov.in` | `farmer123` |

### Landing pages & routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page (hero, SDG 15/11/13, live alert preview) |
| `/login` · `/register` | Public | Auth (register includes village + GPS coordinates) |
| `/app` | Logged in | Portal dashboard: SAFE / ELEPHANT DETECTED status, stats, emergency contacts |
| `/app/live` | Logged in | Live alert stream over WebSocket + browser notifications |
| `/app/map` | Logged in | Leaflet map: forest polygon, cameras, user & elephant markers |
| `/app/history` | Logged in | Alert history (Today / Week / Month + village search + CSV export) |
| `/app/admin` | Admin only | Camera CRUD, manual alert, resolve alerts, system stats |

### Live alert flow

1. `POST /detect` (or `/api/detect`) with `confidence > 0.80` raises an alert.
2. Backend saves it to SQLite and broadcasts it over `ws://localhost:8000/ws/alerts`.
3. Browser plays a beep, shows a toast + native notification, and the elephant marker appears on the map.
4. Push notifications (FCM) go out if `TUSKER_FCM_CREDENTIALS` is set; otherwise the push layer runs in mock mode (logged only).

### Backend quick start

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000   # auto-seeds DB + demo accounts on first run
```

Environment (optional): `TUSKER_JWT_SECRET`, `TUSKER_DB_PATH`, `TUSKER_FCM_CREDENTIALS` (see `backend/.env.example`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Environment: `VITE_API_URL`, `VITE_WS_URL` (see `frontend/.env.example`).

### New API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` · `/api/auth/login` | Create account / get JWT |
| GET | `/api/me` | Current user profile (auth) |
| POST | `/api/push-token` | Register device for FCM push (auth) |
| WS | `/ws/alerts` | Live alert stream |
| POST | `/detect` · `/api/detect` | YOLO-style ingestion (0.80 threshold) |
| GET | `/api/alerts/feed` | Recent alerts (range + village filters) |
| GET | `/api/alerts/export.csv` | Alert history export |
| POST | `/api/alerts/manual` | Officer/admin manual alert |
| POST | `/api/alerts/{id}/resolve` | Officer/admin resolve alert |
| GET/POST/PUT/DELETE | `/api/cameras` | Camera registry (writes = admin) |
| GET | `/api/admin/stats` | Admin system stats (admin) |
| GET | `/api/emergency/contacts` | Emergency helpline contacts |

## Deploy on Render (free tier)

A `render.yaml` blueprint in the repo root deploys both services.

1. Push the repo to GitHub.
2. On render.com: **New + → Blueprint → connect the repo**.
3. Render builds `tuskerguard-api` (Python web service) and `tuskerguard-ui` (static site) automatically.
4. After the API deploys, copy its URL (e.g. `https://tuskerguard-api.onrender.com`) and set it on the UI service:
   - `VITE_API_URL = https://<api-service>.onrender.com`
   - `VITE_WS_URL  = wss://<api-service>.onrender.com`
   Then trigger **Deploy** on the UI service.

Notes:

- `TUSKER_JWT_SECRET` is auto-generated once at first deploy; keep it secret.
- FCM push stays in mock mode unless `TUSKER_FCM_CREDENTIALS` points at a Firebase Admin service-account JSON.
- SQLite is stored on the service disk: data resets on redeploy, and the backend re-seeds demo data automatically at startup. For persistent storage, switch `database.py:get_conn` to Render PostgreSQL (not just an env var).
- Free services sleep after 15 min idle — first request after wake-up may take ~1 min.
- CORS already allows all origins, so the frontend domain needs no allow-list change.

