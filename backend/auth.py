from flask import jsonify, request
from db import get_cursor
from auth_utils import generate_token


def register_auth_routes(app):

    @app.route("/login", methods=["POST"])
    def login():
        data = request.json
        cursor = get_cursor()

        cursor.execute(
            "SELECT id, name, role FROM users WHERE email=%s AND password=%s",
            (data["email"], data["password"])
        )
        user = cursor.fetchone()

        if not user:
            return jsonify({"message": "Invalid credentials"}), 401

        token = generate_token(user)

        return jsonify({
            "status": "success",
            "token": token,
            "user": user
        })
