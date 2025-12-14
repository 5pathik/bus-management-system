from flask import Blueprint, request, jsonify
from db import get_db
from auth_utils import generate_token

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, name, email, role
        FROM users
        WHERE email=%s AND password=%s
    """, (data["email"], data["password"]))

    user = cursor.fetchone()

    if not user:
        return jsonify({"status": "fail"}), 401

    token = generate_token(user)

    return jsonify({
        "status": "success",
        "token": token,
        "user": user
    })
