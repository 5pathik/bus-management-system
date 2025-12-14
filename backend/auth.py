# backend/auth.py
from flask import request, jsonify
from db import get_cursor
from auth_utils import generate_token

def register_auth_routes(app):

    @app.route("/login", methods=["POST"])
    def login():
        data = request.json
        email = data.get("email")
        password = data.get("password")

        cursor = get_cursor()
        cursor.execute(
            "SELECT id, name, role FROM users WHERE email=%s AND password=%s",
            (email, password)
        )
        user = cursor.fetchone()

        if not user:
            return jsonify({"message": "Invalid credentials"}), 401

        token = generate_token(
            user_id=user["id"],
            role=user["role"],
            name=user["name"]
        )

        return jsonify({
            "status": "success",
            "token": token,
            "user": user
        })
