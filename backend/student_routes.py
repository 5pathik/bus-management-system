from flask import Blueprint, jsonify, request, send_file
from werkzeug.utils import secure_filename
from db import get_cursor
from auth_utils import token_required
import qrcode
from io import BytesIO
import os
import uuid

student_bp = Blueprint("student", __name__)

# ================= UPLOAD FOLDER =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "profiles")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ================= STUDENT PROFILE =================
@student_bp.route("/student/profile", methods=["GET"])
@token_required(required_roles=["student"])
def student_profile():
    user_id = request.user["user_id"]
    cursor, db = get_cursor()

    try:
        cursor.execute("""
            SELECT 
                u.id AS university_id,
                u.name,
                u.email,
                s.dob,
                s.father_name,
                s.course,
                s.semester,
                s.campus,
                s.profile_image
            FROM users u
            LEFT JOIN students s ON u.id = s.id
            WHERE u.id = %s
        """, (user_id,))

        student = cursor.fetchone()

    finally:
        cursor.close()
        db.close()

    if not student:
        return jsonify({"message": "Profile not found"}), 404

    # ✅ Attach full image URL
    student["profile_image"] = (
        f"http://127.0.0.1:5000/uploads/profiles/{student['profile_image']}"
        if student.get("profile_image")
        else ""
    )

    return jsonify(student)


# ================= UPLOAD PROFILE PHOTO =================
@student_bp.route("/student/upload-photo", methods=["POST"])
@token_required(required_roles=["student"])
def upload_photo():
    if "photo" not in request.files:
        return jsonify({"message": "No file uploaded"}), 400

    file = request.files["photo"]
    if file.filename == "":
        return jsonify({"message": "Invalid file"}), 400

    # ✅ Unique filename (prevents overwrite)
    ext = os.path.splitext(file.filename)[1]
    filename = secure_filename(f"{uuid.uuid4().hex}{ext}")
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    cursor, db = get_cursor()
    try:
        cursor.execute(
            "UPDATE students SET profile_image=%s WHERE id=%s",
            (filename, request.user["user_id"])
        )
        db.commit()
    finally:
        cursor.close()
        db.close()

    return jsonify({
        "message": "Photo uploaded successfully",
        "filename": filename
    })


# ================= BUS PASS DETAILS =================
@student_bp.route("/student/bus-pass", methods=["GET"])
@token_required(required_roles=["student"])
def get_bus_pass():
    user_id = request.user["user_id"]
    cursor, db = get_cursor()

    try:
        cursor.execute("""
            SELECT 
                u.name,
                r.route_name,
                DATE_FORMAT(bp.valid_till, '%%d-%%m-%%Y') AS valid_till
            FROM bus_pass bp
            JOIN users u ON bp.student_id = u.id
            JOIN routes r ON bp.route_id = r.id
            WHERE bp.student_id = %s
              AND bp.valid_till >= CURDATE()
        """, (user_id,))

        pass_data = cursor.fetchone()
    finally:
        cursor.close()
        db.close()

    if not pass_data:
        return jsonify({"message": "No active bus pass"}), 404

    return jsonify(pass_data)


# ================= BUS PASS QR =================
@student_bp.route("/student/bus-pass/qr", methods=["GET"])
@token_required(required_roles=["student"])
def bus_pass_qr():
    user_id = request.user["user_id"]

    qr_text = f"BUSPASS:{user_id}"
    img = qrcode.make(qr_text)

    buf = BytesIO()
    img.save(buf)
    buf.seek(0)

    return send_file(buf, mimetype="image/png")


# ================= ANNOUNCEMENT =================
@student_bp.route("/student/announcement", methods=["GET"])
def announcement():
    return jsonify({
        "text": "Welcome to University Bus Management System"
    })


# ================= BUS ALERTS =================
@student_bp.route("/student/alerts", methods=["GET"])
@token_required(required_roles=["student"])
def bus_alerts():
    return jsonify([
        {"message": "Morning bus delayed by 10 minutes"},
        {"message": "Route 5 bus timing updated"}
    ])


# ================= SEAT STATUS =================
@student_bp.route("/student/seat-status", methods=["GET"])
@token_required(required_roles=["student"])
def seat_status():
    return jsonify({
        "available": 12
    })
