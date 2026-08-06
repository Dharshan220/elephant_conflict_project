"""Firebase Cloud Messaging push notifications (optional, dependency-free by default).

When `firebase-admin` is installed and `FCM_CREDENTIALS` points to a service
account JSON key, real push notifications are sent to every registered device
token. Otherwise the module logs a mock message and returns False, so
development works without Firebase.
"""

import logging
import os
from pathlib import Path

log = logging.getLogger("tuskerguard.push")

_messaging = None

FCM_CREDENTIALS = os.environ.get("TUSKER_FCM_CREDENTIALS", "firebase/tuskerguard-credentials.json")

TITLE = "⚠ Elephant Alert"
BODY = "Elephant detected near {village} Village. Avoid the area and stay indoors."


def _load_msgs():
    """Import the firebase_admin messaging module if available."""
    try:
        from firebase_admin import messaging as _m  # noqa: PLC0415

        return _m
    except Exception:
        return None


# ---------------------------------------------------------------- main API

def send_alert_push(alert: dict) -> bool:
    """Send push notifications for an {alert} to all registered FCM tokens."""
    if _messaging is None:
        log.info("MOCK push -> %s `%s` near %s", TITLE, alert.get("animal", "elephant"), alert.get("village", "?"))
        return False

    from database import all_fcm_tokens  # noqa: PLC0415

    tokens = all_fcm_tokens()
    if not tokens:
        log.info("FCM: no registered device tokens")
        return False

    body = BODY.format(village=alert.get("village", "the village"))
    sent = 0
    for token in tokens:
        try:
            _messaging.send(
                _messaging.Message(
                    token=token,
                    notification=_messaging.Notification(title=TITLE, body=body),
                    data={
                        "click_action": "OPEN_LIVE_ALERTS",
                        "url": "/live",
                        "alert_id": alert.get("alert_id", ""),
                    },
                )
            )
            sent += 1
        except Exception as exc:  # noqa: BLE001 - a bad token must not break broadcasts
            log.warning("FCM send failed for a token: %s", exc)
    return sent > 0


def init_firebase() -> bool:
    """Initialise the Firebase Admin SDK if credentials exist. Returns True when ready."""
    global _messaging
    if _messaging is not None:
        return _messaging is not False
    try:
        import firebase_admin  # noqa: PLC0415
        from firebase_admin import credentials as _creds  # noqa: PLC0415
    except Exception:
        _messaging = False
        return False
    cred_path = Path(FCM_CREDENTIALS)
    if not cred_path.exists():
        log.info("FCM disabled: %s not found, running in mock push mode", cred_path.name)
        _messaging = False
        return False
    firebase_admin.initialize_app(_creds.Certificate(str(cred_path)))
    from firebase_admin import messaging as _msg  # noqa: PLC0415

    _messaging = _msg
    log.info("FCM initialised from %s", cred_path.name)
    return True