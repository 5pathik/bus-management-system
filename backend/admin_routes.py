# backend/admin_routes.py
from flask import Blueprint, jsonify
from db import get_cursor
from auth_utils import token_required

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/admin/dashboard")
@token_required(required_roles=["admin"])
def admin_dashboard():
    cursor = get_cursor()

    cursor.execute("SELECT COUNT(*) AS total_students FROM users WHERE role='student'")
    students = cursor.fetchone()["total_students"]

    cursor.execute("SELECT COUNT(*) AS total_drivers FROM users WHERE role='driver'")
    drivers = cursor.fetchone()["total_drivers"]

    cursor.execute("SELECT COUNT(*) AS total_buses FROM buses")
    buses = cursor.fetchone()["total_buses"]

    return jsonify({
        "students": students,
        "drivers": drivers,
        "buses": buses
    })
