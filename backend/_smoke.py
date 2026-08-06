import json
import urllib.request

BASE = "http://localhost:8000"


def req(path, method="GET", body=None, token=None):
    data = json.dumps(body).encode() if body else None
    r = urllib.request.Request(BASE + path, data=data, method=method, headers={"Content-Type": "application/json"})
    if token:
        r.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(r, timeout=10) as resp:
            return resp.status, json.loads(resp.read() or b"null")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"null")


print("LOGIN-ADMIN:", req("/api/auth/login", "POST", {"email": "admin@tusker.gov.in", "password": "admin123"})[0])
s, login = req("/api/auth/login", "POST", {"email": "admin@tusker.gov.in", "password": "admin123"})
tok = login["token"]
print("USER:", login["user"]["name"], "admin:", login["user"]["isAdmin"])

print("REGISTER:", req("/api/auth/register", "POST", {"name": "Test User", "email": "test@example.com", "password": "test123", "phone": "+91 99999 00000", "village": "Karamadai", "latitude": 11.23, "longitude": 76.95})[0])
print("ME:", req("/api/me", token=tok)[0])
print("STATS:", req("/api/admin/stats", token=tok))
print("STATS-NO-TOKEN:", req("/api/admin/stats")[0])

print("DETECT:", req("/api/detect", "POST", {"animal": "elephant", "confidence": 0.95, "camera": "CAM01", "village": "Karamadai", "latitude": 11.23, "longitude": 76.95}))
print("DETECT-LOW:", req("/detect", "POST", {"animal": "elephant", "confidence": 0.5, "camera": "CAM01", "village": "Karamadai", "latitude": 11.23, "longitude": 76.95})[0])

print("MANUAL:", req("/api/alerts/manual", "POST", {"village": "Muthanga", "camera": "CAM02", "latitude": 11.66, "longitude": 76.22}, tok)[0])
print("CAMERAS:", len(req("/api/cameras")[1]))
print("CAM-ADD:", req("/api/cameras", "POST", {"name": "CAM09", "latitude": 11.4, "longitude": 76.9, "village": "X"}, tok)[0])
print("CAM-DEL:", req("/api/cameras/7", "DELETE", token=tok)[0])
print("FEED-TODAY:", len(req("/api/alerts/feed?range=today")[1]))
print("FEED-MONTH-KARAMADAI:", len(req("/api/alerts/feed?range=month&village=Karamadai")[1]))
aid = req("/api/alerts/feed?range=today")[1][0]["alert_id"]
print("RESOLVE:", req(f"/api/alerts/{aid}/resolve", "POST", token=tok))
print("CONTACTS:", len(req("/api/emergency/contacts")[1]))
csv_resp = urllib.request.urlopen(BASE + "/api/alerts/export.csv", timeout=10)
print("CSV:", csv_resp.status, csv_resp.read().decode()[:60].replace("\n", " "))
