# app.py
from flask import Flask, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

from auth import auth_bp
from student_routes import student_bp
from admin_routes import admin_bp
from driver_routes import driver_bp

app.register_blueprint(auth_bp)
app.register_blueprint(student_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(driver_bp)

# 🔹 Serve profile images
@app.route("/uploads/profiles/<filename>")
def profile_image(filename):
    return send_from_directory("uploads/profiles", filename)

@app.route("/")
def home():
    return {"status": "Backend running"}

if __name__ == "__main__":
    app.run(debug=True)
