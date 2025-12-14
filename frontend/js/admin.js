const API = "http://127.0.0.1:5000";

/* ================= AUTH CHECK ================= */
(function authCheck() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    localStorage.clear();
    window.location.href = "../pages/index.html";
  }
})();

/* ================= AUTH HEADERS ================= */
function authHeaders() {
  return {
    "Authorization": "Bearer " + localStorage.getItem("token")
  };
}

/* ================= USER DROPDOWN ================= */
function toggleDropdown() {
  const dd = document.getElementById("userDropdown");
  if (dd) dd.classList.toggle("show");
}

window.addEventListener("click", (e) => {
  if (!e.target.closest(".user-menu")) {
    document.getElementById("userDropdown")?.classList.remove("show");
  }
});

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  window.location.href = "../pages/index.html";
}

/* ================= LOAD ADMIN NAME ================= */
function loadAdminName() {
  const name = localStorage.getItem("userName") || "Admin";
  const el = document.getElementById("adminName");
  if (el) el.innerText = name;
}

/* ================= LOAD DASHBOARD STATS ================= */
async function loadAdminStats() {
  try {
    const res = await fetch(`${API}/admin/stats`, {
      headers: authHeaders()
    });

    if (res.status === 401) {
      throw new Error("Session expired");
    }

    if (!res.ok) {
      throw new Error("Stats fetch failed");
    }

    const data = await res.json();
    console.log("✅ ADMIN STATS:", data);

    document.getElementById("students").innerText = data.students ?? 0;
    document.getElementById("drivers").innerText = data.drivers ?? 0;
    document.getElementById("routes").innerText = data.routes ?? 0;
    document.getElementById("buses").innerText = data.buses ?? 0;

  } catch (err) {
    console.error("❌ ADMIN ERROR:", err);
    alert("Session expired. Please login again.");
    logout();
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
document.addEventListener("DOMContentLoaded", () => {
  loadAdminName();
  loadAdminStats();
});
