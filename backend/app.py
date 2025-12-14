from flask import Flask, jsonify
from flask_cors import CORS

from auth import register_auth_routes
from admin import register_admin_routes
from student import register_student_routes
from driver import register_driver_routes

app = Flask(__name__)
CORS(app)

register_auth_routes(app)
register_admin_routes(app)
register_student_routes(app)
register_driver_routes(app)

from flask import Flask
from student_routes import student_bp

app = Flask(__name__)

app.register_blueprint(student_bp)

if __name__ == "__main__":
    app.run(debug=True)
