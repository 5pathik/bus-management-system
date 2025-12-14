from flask import Flask, send_from_directory
from flask_cors import CORS
import os

# ================= APP INIT =================
app = Flask(__name__)
CORS(app)

# ================= BASE PATH =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ================= UPLOADS =================
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "profiles")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ================= IMPORT BLUEPRINTS =================
# (imports AFTER app creation – correct)
from auth import auth_bp
from student_routes import student_bp
from admin_routes import admin_bp
from driver_routes import driver_bp

# ================= REGISTER BLUEPRINTS =================
app.register_blueprint(auth_bp)
app.register_blueprint(student_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(driver_bp)

# ================= SERVE PROFILE IMAGES =================
@app.route("/uploads/profiles/<filename>")
def profile_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ================= HEALTH CHECK =================
@app.route("/")
def home():
    return {
        "status": "success",
        "message": "University Bus Management Backend Running"
    }

# ================= RUN SERVER =================
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
