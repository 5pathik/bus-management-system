from flask import Blueprint, jsonify
from db import get_cursor
from auth_utils import token_required

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/admin/stats")
@token_required(required_roles=["admin"])
def stats():
    cursor = get_cursor()
    cursor.execute("SELECT COUNT(*) c FROM users WHERE role='student'")
    students = cursor.fetchone()["c"]

    cursor.execute("SELECT COUNT(*) c FROM users WHERE role='driver'")
    drivers = cursor.fetchone()["c"]

    return jsonify({
        "students": students,
        "drivers": drivers,
        "routes": 6,
        "buses": 12
    })
