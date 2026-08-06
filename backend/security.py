"""Password hashing + JWT signing (stdlib only, zero external deps).

- Passwords: PBKDF2-HMAC-SHA256 with a per-user random salt.
- Tokens: compact HS256 JWT (base64url header/payload + HMAC-SHA256 signature).

Swap in `python-jose`/`passlib` if you later move to PostgreSQL in production;
the function signatures here are intentionally identical to what those libs expose.
"""

import base64
import hashlib
import hmac
import json
import os
import secrets
import time

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

SECRET_KEY = os.environ.get("TUSKER_JWT_SECRET", "dev-secret-change-me-in-production")
TOKEN_TTL_SECONDS = 7 * 24 * 3600  # 7 days

_bearer = HTTPBearer(auto_error=False)


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _unb64url(data: str) -> bytes:
    return base64.urlsafe_b64decode(data + "=" * (-len(data) % 4))


# ---------------------------------------------------------------- passwords

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 120_000)
    return f"$pbkdf2${salt}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _empty, _marker, salt, digest = stored.split("$")
        if _marker != "pbkdf2":
            return False
        check = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 120_000)
        return hmac.compare_digest(check.hex(), digest)
    except (ValueError, AttributeError):
        return False


# ---------------------------------------------------------------- jwt

def create_token(user_id: int, email: str, is_admin: bool, role: str = "user") -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": str(user_id),
        "email": email,
        "admin": bool(is_admin),
        "role": role,
        "iat": int(time.time()),
        "exp": int(time.time()) + TOKEN_TTL_SECONDS,
    }
    signing_input = _b64url(json.dumps(header, separators=(",", ":")).encode()) + "." + _b64url(
        json.dumps(payload, separators=(",", ":")).encode()
    )
    signature = hmac.new(SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256).digest()
    return signing_input + "." + _b64url(signature)


def decode_token(token: str) -> dict | None:
    try:
        signing_input, sig = token.rsplit(".", 1)
        expected = hmac.new(SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _unb64url(sig)):
            return None
        payload = json.loads(_unb64url(signing_input.split(".")[1]))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except (ValueError, json.JSONDecodeError, KeyError):
        return None


# ---------------------------------------------------------------- fastapi deps

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    from database import get_user_by_id

    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = get_user_by_id(int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    user.pop("password_hash", None)
    return user


def get_admin_user(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin" and not user.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


def get_officer_user(user: dict = Depends(get_current_user)) -> dict:
    """Admin or forest range officer — can raise/resolve alerts but not manage cameras."""
    role = user.get("role")
    if role not in ("admin", "officer") and not user.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Officer or admin access required")
    return user
