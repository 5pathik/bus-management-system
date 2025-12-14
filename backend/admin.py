from flask import jsonify
from db import get_cursor
from auth_utils import token_required


def register_admin_routes(app):

    @app.route("/admin/attendance-report")
    @token_required(required_roles=["admin"])
    def attendance_report():
        cursor = get_cursor()
        cursor.execute("""
            SELECT r.route_name, a.date, COUNT(a.student_id) AS total_present
            FROM attendance a
            JOIN routes r ON a.route_id = r.id
            GROUP BY r.route_name, a.date
        """)
        return jsonify(cursor.fetchall())
