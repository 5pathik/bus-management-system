from flask import jsonify
from db import get_cursor
from auth_utils import token_required


def register_student_routes(app):

    @app.route("/bus-pass/<int:student_id>")
    @token_required(required_roles=["student"])
    def bus_pass(student_id):
        cursor = get_cursor()
        cursor.execute("""
            SELECT u.name, r.route_name, bp.valid_till
            FROM bus_pass bp
            JOIN users u ON bp.student_id = u.id
            JOIN routes r ON bp.route_id = r.id
            WHERE u.id=%s
        """, (student_id,))
        return jsonify(cursor.fetchone())
