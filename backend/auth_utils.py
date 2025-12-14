# ================== AUTH UTILITIES ==================
import jwt
from functools import wraps
from flask import request, jsonify
from config import JWT_SECRET
from datetime import datetime, timedelta


# ---------- CREATE TOKEN ----------
def generate_token(user):
    payload = {
        "id": user["id"],
        "role": user["role"],
        "exp": datetime.utcnow() + timedelta(minutes=60)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


# ---------- VERIFY TOKEN ----------
def token_required(required_roles=None):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            token = request.headers.get("Authorization")

            if not token:
                return jsonify({"message": "Token missing"}), 401

            try:
                token = token.replace("Bearer ", "")
                data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            except jwt.ExpiredSignatureError:
                return jsonify({"message": "Token expired"}), 401
            except Exception:
                return jsonify({"message": "Invalid token"}), 401

            # Role check
            if required_roles and data["role"] not in required_roles:
                return jsonify({"message": "Access denied"}), 403

            request.user = data
            return f(*args, **kwargs)

        return wrapper
    return decorator
