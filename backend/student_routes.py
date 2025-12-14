# backend/student_routes.py
from flask import Blueprint, jsonify, request
from db import get_cursor
from auth_utils import token_required

student_bp = Blueprint("student", __name__)

@student_bp.route("/student/profile")
@token_required(required_roles=["student"])
def student_profile():
    cursor = get_cursor()
    user_id = request.user["user_id"]

    cursor.execute("""
        SELECT name, email, course, semester
        FROM users
        WHERE id = %s
    """, (user_id,))

    return jsonify(cursor.fetchone())


@student_bp.route("/student/bus-pass")
@token_required(required_roles=["student"])
def student_bus_pass():
    cursor = get_cursor()
    user_id = request.user["user_id"]

    cursor.execute("""
        SELECT r.route_name, bp.valid_till
        FROM bus_pass bp
        JOIN routes r ON bp.route_id = r.id
        WHERE bp.student_id = %s
    """, (user_id,))

    return jsonify(cursor.fetchone())
