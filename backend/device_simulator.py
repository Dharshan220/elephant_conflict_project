"""Standalone ESP8266 edge-node simulator.

Mimics the exact behaviour of the Arduino firmware:
1. PIR motion -> POST /api/motion  (with device_id + zone_id)
2. Poll GET  /api/device-command/{device_id} for buzzer commands
3. On BUZZER_ON -> print buzzer/LED activation -> POST ack

Usage:
    python device_simulator.py [--device esp-02] [--zone z2] [--interval 8]

Requires only the Python standard library (urllib).
"""

import argparse
import json
import time
import urllib.request
import urllib.error
import random

API_BASE = "http://localhost:8000"


def post(path, body):
    req = urllib.request.Request(
        API_BASE + path,
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=5) as res:
        return json.loads(res.read().decode())


def get(path):
    with urllib.request.urlopen(API_BASE + path, timeout=5) as res:
        return json.loads(res.read().decode())


def ack(path):
    return post(path, {"result": "executed"})


def main():
    parser = argparse.ArgumentParser(description="Simulate an ESP8266 edge node")
    parser.add_argument("--device", default="esp-02", help="device id registered on the backend")
    parser.add_argument("--zone", default="z2", help="zone the device protects")
    parser.add_argument("--interval", type=int, default=8, help="seconds between PIR checks")
    args = parser.parse_args()

    print(f"[ESP8266:{args.device}] NVS booted · PIR(D1) BUZZER(D6) LED(D7) · poll={args.interval}s")
    while True:
        try:
            trigger = random.random() < 0.55
            if trigger:
                burst = random.randint(1, 4)
                res = post("/api/motion", {"device_id": args.device, "zone_id": args.zone, "trigger_count": burst})
                print(f"[PIR] trigger x{burst} -> 202 {res['message']}")

            commands = get(f"/api/device-command/{args.device}").get("commands", [])
            for cmd in commands:
                print(f"[CMD] BUZZER_ON alert={cmd['alertId']} -> activating buzzer(D6) + LED-strobe(D7) for 30s")
                time.sleep(0.4)
                ack(f"/api/device-command/{args.device}/{cmd['id']}/ack")
                print("[CMD] buzzer cycle done -> acked")
        except urllib.error.HTTPError as e:
            print(f"[WARN] API {e.code}: {e.read().decode()[:80]}")
        except Exception as e:
            print(f"[WARN] {e}")
        time.sleep(args.interval)


if __name__ == "__main__":
    main()