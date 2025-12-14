from flask import Blueprint, request, jsonify
from db import get_cursor
from auth_utils import generate_token

auth_bp = Blueprint("auth", __name__)

# ================= LOGIN =================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    # 🔴 No JSON sent
    if not data:
        return jsonify({
            "status": "fail",
            "message": "No data received"
        }), 400

    email = data.get("email")
    password = data.get("password")

    # 🔴 Missing fields
    if not email or not password:
        return jsonify({
            "status": "fail",
            "message": "Email and password required"
        }), 400

    # ✅ DB CONNECTION
    cursor, db = get_cursor()

    try:
        cursor.execute(
            """
            SELECT id, name, email, password, role
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        user = cursor.fetchone()

    finally:
        # ✅ ALWAYS close DB
        cursor.close()
        db.close()

    # 🔴 Invalid credentials
    if not user or user["password"] != password:
        return jsonify({
            "status": "fail",
            "message": "Invalid credentials"
        }), 401

    # ✅ Generate JWT
    token = generate_token(user)

    return jsonify({
        "status": "success",
        "token": token,
        "role": user["role"],
        "name": user["name"],
        "user_id": user["id"]
    })
