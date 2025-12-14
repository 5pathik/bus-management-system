from flask import Blueprint, jsonify
from db import get_db
from auth_utils import token_required

student_bp = Blueprint("student", __name__)

# ===== STUDENT PROFILE =====
@student_bp.route("/api/student/profile")
@token_required(role="student")
def student_profile(user):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT name, email, dob, father_name,
               university_id, course, semester, campus
        FROM users
        WHERE id=%s
    """, (user["id"],))

    return jsonify(cursor.fetchone())


# ===== ANNOUNCEMENT =====
@student_bp.route("/api/student/announcement")
def announcement():
    return jsonify({
        "text": "⚠️ Morning bus delayed by 10 minutes. Only one shift operating today."
    })


# ===== BUS ALERTS =====
@student_bp.route("/api/student/alerts")
@token_required(role="student")
def alerts(user):
    return jsonify([
        {"message": "Morning bus delayed by 10 minutes"},
        {"message": "Route changed due to traffic"}
    ])


# ===== SEAT STATUS =====
@student_bp.route("/api/student/seat-status")
@token_required(role="student")
def seat_status(user):
    return jsonify({
        "available": 12,
        "total": 40
    })
