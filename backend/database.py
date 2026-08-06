"""Persistence layer for the Elephant Early Warning System.

Tables: users, cameras, alerts, fcm_tokens.

Two backends, identical function signatures:
- SQLite (default, zero config): file at `database/tuskerguard.db`
- PostgreSQL (Supabase / Render Postgres): enabled by setting `TUSKER_DB_URL`
  to a libpq connection string, e.g.
  postgresql://postgres:PASSWORD@zlcrynxxyxqdbvsqzmkl.supabase.co:6543/postgres
"""

import sqlite3
import os
import random
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path

DB_PATH = os.environ.get(
    "TUSKER_DB_PATH",
    str(Path(__file__).resolve().parent.parent / "database" / "tuskerguard.db"),
)
DB_URL = os.environ.get("TUSKER_DB_URL", "") or ""

VILLAGES = ["Karamadai", "Muthanga", "Mudumalai", "Valparai", "Sakleshpur", "BRT Gate", "Wayanad Fringe"]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def is_postgres() -> bool:
    return bool(DB_URL)


def get_conn():
    """Context-manager connection (auto-commit/rollback). Rows are dict-like."""
    if DB_URL:
        import psycopg

        return psycopg.connect(DB_URL)
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _sql(q: str) -> str:
    """Translate sqlite placeholders (?) to psycopg (%s)."""
    return q.replace("?", "%s") if DB_URL else q


def _insert_id(conn, q: str, params=()):
    """Run an INSERT and return the new row id (portable across backends)."""
    cur = conn.execute(_sql(q + (" RETURNING id" if DB_URL else "")), params)
    if DB_URL:
        return cur.fetchone()[0]
    return cur.lastrowid


def init_db() -> None:
    with get_conn() as conn:
        if DB_URL:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id BIGSERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    phone TEXT NOT NULL DEFAULT '',
                    village TEXT NOT NULL DEFAULT '',
                    latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
                    longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
                    password_hash TEXT NOT NULL,
                    is_admin INTEGER NOT NULL DEFAULT 0,
                    role TEXT NOT NULL DEFAULT 'user',
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS cameras (
                    id BIGSERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    latitude DOUBLE PRECISION NOT NULL,
                    longitude DOUBLE PRECISION NOT NULL,
                    village TEXT NOT NULL DEFAULT '',
                    status TEXT NOT NULL DEFAULT 'online',
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS alerts (
                    id BIGSERIAL PRIMARY KEY,
                    alert_id TEXT NOT NULL UNIQUE,
                    animal TEXT NOT NULL DEFAULT 'elephant',
                    confidence DOUBLE PRECISION NOT NULL,
                    camera TEXT NOT NULL,
                    village TEXT NOT NULL DEFAULT '',
                    latitude DOUBLE PRECISION NOT NULL,
                    longitude DOUBLE PRECISION NOT NULL,
                    time TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'active',
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS fcm_tokens (
                    id BIGSERIAL PRIMARY KEY,
                    token TEXT NOT NULL UNIQUE,
                    user_id INTEGER,
                    created_at TEXT NOT NULL
                );
                """
            )
        else:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    phone TEXT NOT NULL DEFAULT '',
                    village TEXT NOT NULL DEFAULT '',
                    latitude REAL NOT NULL DEFAULT 0,
                    longitude REAL NOT NULL DEFAULT 0,
                    password_hash TEXT NOT NULL,
                    is_admin INTEGER NOT NULL DEFAULT 0,
                    role TEXT NOT NULL DEFAULT 'user',
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS cameras (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    latitude REAL NOT NULL,
                    longitude REAL NOT NULL,
                    village TEXT NOT NULL DEFAULT '',
                    status TEXT NOT NULL DEFAULT 'online',
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    alert_id TEXT NOT NULL UNIQUE,
                    animal TEXT NOT NULL DEFAULT 'elephant',
                    confidence REAL NOT NULL,
                    camera TEXT NOT NULL,
                    village TEXT NOT NULL DEFAULT '',
                    latitude REAL NOT NULL,
                    longitude REAL NOT NULL,
                    time TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'active',
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS fcm_tokens (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    token TEXT NOT NULL UNIQUE,
                    user_id INTEGER,
                    created_at TEXT NOT NULL
                );
                """
            )
            _migrate(conn)


def _migrate(conn: sqlite3.Connection) -> None:
    """Additive migrations for SQLite databases created before a schema bump."""
    cols = {r["name"] for r in conn.execute("PRAGMA table_info(users)").fetchall()}
    if "role" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'")


def new_alert_id() -> str:
    """Human-friendly unique alert id (AL-YYYYMMDD-XXXX)."""
    for _ in range(20):
        suffix = "".join(random.choices("0123456789ABCDEFGHJKMNPQRSTVWXYZ", k=4))
        aid = f"AL-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{suffix}"
        if get_alert_by_id(aid) is None:
            return aid
    return f"AL-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{random.randint(1000, 9999)}"


# ---------------------------------------------------------------- users

def create_user(name, email, phone, village, latitude, longitude, password_hash, is_admin=False, role=None):
    if role is None:
        role = "admin" if is_admin else "user"
    with get_conn() as conn:
        return _insert_id(
            conn,
            "INSERT INTO users (name, email, phone, village, latitude, longitude, password_hash, is_admin, role, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (name, email, phone, village, float(latitude), float(longitude), password_hash, 1 if is_admin else 0, role, now_iso()),
        )


def get_user_by_email(email):
    with get_conn() as conn:
        row = conn.execute(_sql("SELECT * FROM users WHERE email = ?"), (email,)).fetchone()
        return dict(row) if row else None


def get_user_by_id(user_id):
    with get_conn() as conn:
        row = conn.execute(_sql("SELECT * FROM users WHERE id = ?"), (user_id,)).fetchone()
        return dict(row) if row else None


def count_users():
    with get_conn() as conn:
        return conn.execute("SELECT COUNT(*) AS c FROM users").fetchone()["c"]


# ---------------------------------------------------------------- cameras

def list_cameras():
    with get_conn() as conn:
        return [dict(r) for r in conn.execute("SELECT * FROM cameras ORDER BY id").fetchall()]


def get_camera(camera_id):
    with get_conn() as conn:
        row = conn.execute(_sql("SELECT * FROM cameras WHERE id = ?"), (camera_id,)).fetchone()
        return dict(row) if row else None


def create_camera(name, latitude, longitude, village):
    with get_conn() as conn:
        cid = _insert_id(
            conn,
            "INSERT INTO cameras (name, latitude, longitude, village, status, created_at) VALUES (?, ?, ?, ?, 'online', ?)",
            (name, float(latitude), float(longitude), village, now_iso()),
        )
    return get_camera(cid)


def update_camera(camera_id, name, latitude, longitude, village, status):
    with get_conn() as conn:
        conn.execute(
            _sql(
                "UPDATE cameras SET name = ?, latitude = ?, longitude = ?, village = ?, status = ? WHERE id = ?"
            ),
            (name, float(latitude), float(longitude), village, status, camera_id),
        )
    return get_camera(camera_id)


def delete_camera(camera_id):
    with get_conn() as conn:
        conn.execute(_sql("DELETE FROM cameras WHERE id = ?"), (camera_id,))


# ---------------------------------------------------------------- alerts

def insert_alert(animal, confidence, camera, village, latitude, longitude, time, status="active"):
    alert_id = new_alert_id()
    with get_conn() as conn:
        conn.execute(
            _sql(
                "INSERT INTO alerts (alert_id, animal, confidence, camera, village, latitude, longitude, time, status, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            ),
            (alert_id, animal, float(confidence), camera, village, float(latitude), float(longitude), time, status, now_iso()),
        )
    return get_alert_by_id(alert_id)


def get_alert_by_id(alert_id):
    with get_conn() as conn:
        row = conn.execute(_sql("SELECT * FROM alerts WHERE alert_id = ?"), (alert_id,)).fetchone()
        return dict(row) if row else None


def list_alerts(range_filter="", village=""):
    """range_filter: '' | today | week | month. village: case-insensitive match."""
    now = datetime.now(timezone.utc)
    with get_conn() as conn:
        rows = [dict(r) for r in conn.execute("SELECT * FROM alerts ORDER BY time DESC").fetchall()]

    def to_dt(iso: str):
        try:
            return datetime.fromisoformat(iso)
        except (TypeError, ValueError):
            return now

    if range_filter == "today":
        rows = [a for a in rows if to_dt(a["time"]).date() == now.date()]
    elif range_filter == "week":
        cutoff = now - timedelta(days=7)
        rows = [a for a in rows if to_dt(a["time"]) >= cutoff]
    elif range_filter == "month":
        cutoff = now - timedelta(days=30)
        rows = [a for a in rows if to_dt(a["time"]) >= cutoff]
    if village:
        q = village.lower()
        rows = [a for a in rows if q in (a["village"] or "").lower()]
    return rows


def active_alert_count():
    with get_conn() as conn:
        return conn.execute("SELECT COUNT(*) AS c FROM alerts WHERE status = 'active'").fetchone()["c"]


def total_alert_count():
    with get_conn() as conn:
        return conn.execute("SELECT COUNT(*) AS c FROM alerts").fetchone()["c"]


def latest_alert():
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM alerts ORDER BY time DESC LIMIT 1").fetchone()
        return dict(row) if row else None


def resolve_alert(alert_id):
    with get_conn() as conn:
        conn.execute(_sql("UPDATE alerts SET status = 'resolved' WHERE alert_id = ?"), (alert_id,))
    return get_alert_by_id(alert_id)


# ---------------------------------------------------------------- fcm tokens

def save_fcm_token(token, user_id=None):
    with get_conn() as conn:
        if DB_URL:
            conn.execute(
                "INSERT INTO fcm_tokens (token, user_id, created_at) VALUES (%s, %s, %s) ON CONFLICT (token) DO NOTHING",
                (token, user_id, now_iso()),
            )
        else:
            conn.execute(
                "INSERT OR IGNORE INTO fcm_tokens (token, user_id, created_at) VALUES (?, ?, ?)",
                (token, user_id, now_iso()),
            )


def all_fcm_tokens():
    with get_conn() as conn:
        return [r["token"] for r in conn.execute("SELECT token FROM fcm_tokens").fetchall()]


# ---------------------------------------------------------------- seed

def seed_if_empty():
    """First-run demo data: cameras and a month of alerts."""
    if list_cameras():
        return
    init_db()
    base_cameras = [
        ("CAM01", 11.23, 76.95, "Karamadai"),
        ("CAM02", 11.66, 76.22, "Muthanga"),
        ("CAM03", 11.58, 76.56, "Mudumalai"),
        ("CAM04", 10.38, 76.95, "Valparai"),
        ("CAM05", 12.9, 75.79, "Sakleshpur"),
        ("CAM06", 11.9, 77.1, "BRT Gate"),
    ]
    for name, lat, lng, village in base_cameras:
        create_camera(name, lat, lng, village)

    # ~24 alerts spread over the last 30 days so history filters have data
    now = datetime.now(timezone.utc)
    for i in range(24):
        cam = base_cameras[i % len(base_cameras)]
        ts = now - timedelta(days=random.randint(0, 29), hours=random.randint(0, 23), minutes=random.randint(0, 59))
        insert_alert(
            animal="elephant",
            confidence=round(random.uniform(0.81, 0.99), 2),
            camera=cam[0],
            village=cam[3],
            latitude=cam[1],
            longitude=cam[2],
            time=ts.isoformat(),
            status="resolved" if i % 3 else "active",
        )


def ensure_demo_users():
    """Idempotent demo accounts, run on every startup (works even if data exists)."""
    init_db()

    def _hash(pw: str) -> str:
        salt = secrets.token_hex(16)
        digest = hashlib.pbkdf2_hmac("sha256", pw.encode(), bytes.fromhex(salt), 120_000)
        return f"$pbkdf2${salt}${digest.hex()}"

    demo = [
        ("System Admin", "admin@tusker.gov.in", "+91 90000 00001", "Coimbatore", 11.0, 76.96, "admin123", "admin"),
        ("Range Officer", "rfo@tusker.gov.in", "+91 90000 00003", "Mudumalai", 11.58, 76.56, "rfo123", "officer"),
        ("Ravi Kumar", "farmer@tusker.gov.in", "+91 90000 00002", "Karamadai", 11.23, 76.95, "farmer123", "user"),
    ]
    for name, email, phone, village, lat, lng, pw, role in demo:
        if get_user_by_email(email) is None:
            create_user(
                name, email, phone, village, lat, lng, _hash(pw), is_admin=(role == "admin"), role=role
            )
