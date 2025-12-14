# backend/app.py
from flask import Flask
from flask_cors import CORS

from auth import register_auth_routes
from student_routes import student_bp
from admin_routes import admin_bp
from driver_routes import driver_bp

app = Flask(__name__)
CORS(app)

# Register routes
register_auth_routes(app)
app.register_blueprint(student_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(driver_bp)

@app.route("/")
def home():
    return {"status": "Backend running"}

if __name__ == "__main__":
    app.run(debug=True)
