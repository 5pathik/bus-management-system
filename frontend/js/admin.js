const API = "http://127.0.0.1:5000";

/* ================= AUTH CHECK ================= */
(function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    window.location.href = "../pages/index.html";
  }
})();

/* ================= AUTH HEADERS ================= */
function authHeaders() {
  return {
    "Authorization": "Bearer " + localStorage.getItem("token")
  };
}

/* ================= LOAD DASHBOARD STATS ================= */
async function loadAdminStats() {
  try {
    const res = await fetch(`${API}/admin/stats`, {
      headers: authHeaders()
    });

    if (!res.ok) throw new Error("Unauthorized");

    const data = await res.json();
    console.log("✅ ADMIN STATS:", data);

    document.getElementById("students").innerText = data.students ?? 0;
    document.getElementById("drivers").innerText = data.drivers ?? 0;
    document.getElementById("routes").innerText = data.routes ?? 0;
    document.getElementById("buses").innerText = data.buses ?? 0;

  } catch (err) {
    console.error("❌ Admin stats load failed:", err);
    alert("Session expired. Please login again.");
    localStorage.clear();
    window.location.href = "../pages/index.html";
  }
}

/* ================= NAVIGATION ================= */
function openAttendanceReport() {
  window.location.href = "../modules/attendance-report.html";
}

function openStudentsByRoute() {
  window.location.href = "../modules/students-by-route.html";
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", loadAdminStats);
