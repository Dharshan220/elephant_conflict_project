"""Firebase ID-token verification without the firebase-admin SDK.

Uses Firebase's public signing certificates (Google metadata endpoint) to
verify the RS256 signature of an ID token issued by Firebase Auth. Works with
nothing but the public web config (project id) - no service account needed.

Verification rules (as documented by Google):
  - algorithm must be RS256
  - aud  == the Firebase project id
  - iss  == https://securetoken.google.com/<project-id>
  - token must not be expired (exp)
"""

import base64
import json
import os
import time
import urllib.request

from fastapi import HTTPException

GOOGLE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"

ISSUER = "https://securetoken.google.com"
PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID", "elephant-67342")
LEEWAY_SECONDS = 60

_certs: dict[str, str] = {}
_certs_fetched_at: float = 0.0
_CERT_TTL_SECONDS = 300  # Google's Cache-Control suggests ~5 minutes


def _decode_segment(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _fetch_certs() -> dict[str, str]:
    """Fetch and cache Google's Firebase signing certificates (kid -> PEM)."""
    global _certs, _certs_fetched_at
    now = time.time()
    if _certs and now - _certs_fetched_at < _CERT_TTL_SECONDS:
        return _certs
    try:
        req = urllib.request.Request(GOOGLE_CERTS_URL, headers={"User-Agent": "tuskerguard-backend"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode("utf-8")
        parsed = json.loads(body)
        _certs = {
            kid: f"-----BEGIN CERTIFICATE-----\n{cert}\n-----END CERTIFICATE-----"
            for kid, cert in parsed.items()
        }
        _certs_fetched_at = now
    except Exception as exc:  # network failure -> reuse stale cache if any
        if not _certs:
            raise HTTPException(status_code=503, detail=f"Firebase certificate fetch failed: {exc}")
    return _certs


def verify_id_token(token: str) -> dict:
    """Verify a Firebase Auth ID token and return its claims."""
    if not token:
        raise HTTPException(status_code=401, detail="Missing Firebase ID token")

    try:
        header_b64, payload_b64, sig_b64 = token.split(".")
        header = json.loads(_decode_segment(header_b64))
        payload = json.loads(_decode_segment(payload_b64))
        signature = _decode_segment(sig_b64)
    except Exception:
        raise HTTPException(status_code=401, detail="Malformed Firebase token")

    if header.get("alg") != "RS256":
        raise HTTPException(status_code=401, detail="Unsupported token algorithm")

    now = int(time.time())
    if payload.get("aud") != PROJECT_ID:
        raise HTTPException(status_code=401, detail="Token audience mismatch")
    if payload.get("iss") != f"{ISSUER}/{PROJECT_ID}":
        raise HTTPException(status_code=401, detail="Token issuer mismatch")
    if int(payload.get("exp", 0)) < now - LEEWAY_SECONDS:
        raise HTTPException(status_code=401, detail="Firebase token expired")

    kid = header.get("kid")
    certs = _fetch_certs()
    if not kid or kid not in certs:
        raise HTTPException(status_code=401, detail="Unknown Firebase signing key")

    from cryptography import x509
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import padding as asym_padding

    cert = x509.load_pem_x509_certificate(certs[kid].encode())
    signing_input = f"{header_b64}.{payload_b64}".encode()
    try:
        cert.public_key().verify(
            signature, signing_input, asym_padding.PKCS1v15(), hashes.SHA256()
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Firebase token signature invalid")

    if not payload.get("email"):
        raise HTTPException(status_code=400, detail="Firebase account has no email address")
    payload["uid"] = str(payload.get("sub", ""))
    return payload
