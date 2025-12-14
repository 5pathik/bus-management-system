# backend/driver_routes.py
from flask import Blueprint, jsonify
from db import get_cursor
from auth_utils import token_required

driver_bp = Blueprint("driver", __name__)

@driver_bp.route("/driver/dashboard")
@token_required(required_roles=["driver"])
def driver_dashboard():
    return jsonify({
        "message": "Driver dashboard access granted"
    })
