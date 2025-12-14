# backend/auth_utils.py
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify

SECRET_KEY = "SUPER_SECRET_KEY"

def generate_token(user_id, role, name):
    payload = {
        "user_id": user_id,
        "role": role,
        "name": name,
        "exp": datetime.utcnow() + timedelta(hours=8)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def token_required(required_roles=None):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            token = request.headers.get("Authorization")

            if not token:
                return jsonify({"message": "Token missing"}), 401

            try:
                data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            except jwt.ExpiredSignatureError:
                return jsonify({"message": "Token expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"message": "Invalid token"}), 401

            if required_roles and data.get("role") not in required_roles:
                return jsonify({"message": "Access denied"}), 403

            request.user = data
            return f(*args, **kwargs)

        return wrapper
    return decorator
