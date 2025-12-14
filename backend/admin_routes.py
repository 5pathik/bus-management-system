from flask import Blueprint, jsonify
from db import get_cursor
from auth_utils import token_required

admin_bp = Blueprint("admin", __name__)

# ================= ADMIN STATS =================
@admin_bp.route("/admin/stats", methods=["GET"])
@token_required(required_roles=["admin"])
def admin_stats():
    cursor, db = get_cursor()

    try:
        # Count students
        cursor.execute(
            "SELECT COUNT(*) AS total FROM users WHERE role = 'student'"
        )
        students = cursor.fetchone()["total"]

        # Count drivers
        cursor.execute(
            "SELECT COUNT(*) AS total FROM users WHERE role = 'driver'"
        )
        drivers = cursor.fetchone()["total"]

        # Static demo values (safe for presentation)
        routes = 6
        buses = 12

        return jsonify({
            "students": students,
            "drivers": drivers,
            "routes": routes,
            "buses": buses
        })

    finally:
        cursor.close()
        db.close()
