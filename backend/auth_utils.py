import jwt
import datetime
from functools import wraps
from flask import request, jsonify

# ⚠️ KEEP THIS SAME EVERYWHERE (VERY IMPORTANT)
SECRET_KEY = "SUPER_SECRET_KEY_CHANGE_THIS"

# ================= GENERATE JWT TOKEN =================
def generate_token(user):
    payload = {
        "user_id": user["id"],
        "role": user["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=6)
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    # PyJWT may return bytes in old versions
    if isinstance(token, bytes):
        token = token.decode("utf-8")

    return token


# ================= TOKEN REQUIRED DECORATOR =================
def token_required(required_roles=None):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):

            auth_header = request.headers.get("Authorization")

            # ❌ Missing or wrong format
            if not auth_header or not auth_header.startswith("Bearer "):
                return jsonify({"message": "Token missing"}), 401

            try:
                token = auth_header.split(" ")[1]
                decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                request.user = decoded

            except jwt.ExpiredSignatureError:
                return jsonify({"message": "Session expired"}), 401

            except jwt.InvalidTokenError:
                return jsonify({"message": "Invalid token"}), 401

            # ❌ Role restriction
            if required_roles and decoded["role"] not in required_roles:
                return jsonify({"message": "Access denied"}), 403

            return f(*args, **kwargs)

        return wrapper
    return decorator
