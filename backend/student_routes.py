from flask import Blueprint, jsonify, request
from db import get_cursor
from auth_utils import token_required
from werkzeug.utils import secure_filename
import os

student_bp = Blueprint("student", __name__)

@student_bp.route("/student/profile")
@token_required(required_roles=["student"])
def student_profile():
    user_id = request.user["user_id"]
    cursor = get_cursor()

    cursor.execute("""
        SELECT 
            u.name,
            u.email,
            u.id AS university_id,
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

    if not student:
        return jsonify({"message": "Profile not found"}), 404

    return jsonify(student)


UPLOAD_FOLDER = "uploads/profiles"

@student_bp.route("/student/upload-photo", methods=["POST"])
@token_required(required_roles=["student"])
def upload_photo():
    if "photo" not in request.files:
        return jsonify({"message": "No file uploaded"}), 400

    file = request.files["photo"]
    filename = secure_filename(file.filename)

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    cursor = get_cursor()
    cursor.execute(
        "UPDATE students SET profile_image=%s WHERE id=%s",
        (filename, request.user["user_id"])
    )

    return jsonify({
        "message": "Profile photo updated",
        "filename": filename
    })

