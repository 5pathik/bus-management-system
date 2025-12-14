from flask import Blueprint, jsonify, request
from auth_utils import token_required

driver_bp = Blueprint("driver", __name__)

# ================= DRIVER INFO =================
@driver_bp.route("/driver/info", methods=["GET"])
@token_required(required_roles=["driver"])
def driver_info():
    """
    Returns logged-in driver basic info
    (static demo data for presentation)
    """
    return jsonify({
        "name": "Ramesh Kumar"
    })


# ================= TODAY ROUTE =================
@driver_bp.route("/driver/today-route", methods=["GET"])
@token_required(required_roles=["driver"])
def today_route():
    """
    Returns today's assigned route
    (static demo data)
    """
    return jsonify({
        "route": "Haldwani → GEHU Campus",
        "shift": "Morning",
        "status": "On Time"
    })


# ================= SCAN BUS PASS =================
@driver_bp.route("/driver/scan-bus-pass", methods=["POST"])
@token_required(required_roles=["driver"])
def scan_bus_pass():
    """
    Verifies student bus pass QR
    Expected format: BUSPASS:<student_id>
    """
    data = request.get_json(silent=True)
    qr_text = data.get("qr") if data else None

    # ❌ No QR data
    if not qr_text:
        return jsonify({
            "message": "❌ Invalid QR data"
        }), 400

    # ❌ Wrong format
    if not qr_text.startswith("BUSPASS:"):
        return jsonify({
            "message": "❌ Invalid bus pass"
        }), 400

    student_id = qr_text.split(":", 1)[1]

    # ✅ Demo success (DB-free for presentation)
    return jsonify({
        "message": f"✅ Attendance marked for Student ID {student_id}"
    })
