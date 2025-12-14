from flask import jsonify
from db import get_cursor, db
from auth_utils import token_required


def register_driver_routes(app):

    @app.route("/scan/<int:student_id>")
    @token_required(required_roles=["driver"])
    def scan_qr(student_id):
        cursor = get_cursor()

        cursor.execute("""
            SELECT id FROM attendance
            WHERE student_id=%s AND date=CURDATE()
        """, (student_id,))

        if cursor.fetchone():
            return jsonify({"message": "Already marked"})

        cursor.execute("""
            INSERT INTO attendance (student_id, route_id, date, status)
            VALUES (%s,1,CURDATE(),'present')
        """, (student_id,))
        db.commit()

        return jsonify({"message": "Attendance marked"})
