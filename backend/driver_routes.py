from flask import Blueprint, jsonify
from auth_utils import token_required

driver_bp = Blueprint("driver", __name__)

@driver_bp.route("/driver/dashboard")
@token_required(required_roles=["driver"])
def driver_home():
    return jsonify({
        "route": "Haldwani → Campus",
        "shift": "Morning",
        "status": "On Time"
    })
