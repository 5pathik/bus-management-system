import jwt, datetime
from functools import wraps
from flask import request, jsonify

SECRET = "SUPER_SECRET_KEY"

def generate_token(user):
    payload = {
        "user_id": user["id"],
        "role": user["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=6)
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def token_required(required_roles=None):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            auth = request.headers.get("Authorization")

            if not auth or not auth.startswith("Bearer "):
                return jsonify({"message": "Token missing"}), 401

            token = auth.split(" ")[1]

            try:
                decoded = jwt.decode(token, SECRET, algorithms=["HS256"])
                request.user = decoded
            except:
                return jsonify({"message": "Session expired"}), 401

            if required_roles and decoded["role"] not in required_roles:
                return jsonify({"message": "Access denied"}), 403

            return f(*args, **kwargs)
        return wrapper
    return decorator
