import jwt
from functools import wraps
from flask import request, jsonify

SECRET_KEY = "bus_secret_key_123"

def generate_token(user):
    payload = {
        "id": user["id"],
        "role": user["role"]
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def token_required(role=None):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            token = request.headers.get("Authorization")
            if not token:
                return jsonify({"message": "Token missing"}), 401

            try:
                token = token.split(" ")[1]
                data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            except:
                return jsonify({"message": "Invalid token"}), 401

            if role and data["role"] != role:
                return jsonify({"message": "Access denied"}), 403

            return f(data, *args, **kwargs)
        return wrapper
    return decorator
