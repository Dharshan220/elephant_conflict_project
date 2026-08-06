import database as db
import security

u = db.get_user_by_email("admin@tusker.gov.in")
print("verify:", security.verify_password("admin123", u["password_hash"]))
print("verify-wrong:", security.verify_password("nope", u["password_hash"]))
t = security.create_token(1, "a@b.c", True)
print("token ok:", security.decode_token(t) is not None)
