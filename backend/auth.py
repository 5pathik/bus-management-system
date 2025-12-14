from flask import Blueprint, request, jsonify
from db import get_cursor
from auth_utils import generate_token

auth_bp = Blueprint("auth", __name__)

# ================= LOGIN =================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    print("🔐 LOGIN ATTEMPT")
    print("Email:", email)
    print("Password:", password)

    cursor = get_cursor()
    cursor.execute("""
        SELECT id, name, email, password, role
        FROM users
        WHERE email=%s
    """, (email,))

    user = cursor.fetchone()
    print("DB USER:", user)

    if not user:
        return jsonify({"status": "fail", "message": "Invalid login"}), 401

    if user["password"] != password:
        print("❌ PASSWORD MISMATCH")
        return jsonify({"status": "fail", "message": "Invalid login"}), 401

    token = generate_token(user)

    print("✅ LOGIN SUCCESS")

    return jsonify({
        "status": "success",
        "token": token,
        "role": user["role"],
        "name": user["name"]
    })
