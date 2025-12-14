const API = "http://127.0.0.1:5000";

/* ================= AUTH CHECK ================= */
(function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "student") {
    window.location.href = "../pages/index.html";
  }
})();

/* ================= HEADERS ================= */
function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("token")
  };
}

/* ================= USER DROPDOWN ================= */
function toggleDropdown() {
  document.getElementById("userDropdown").classList.toggle("show");
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

/* ================= NAV ================= */
function goHome() {
  window.location.href = "student-dashboard.html";
}
function goToRoutes() {
  window.location.href = "../modules/routes.html";
}
function goToBusPass() {
  window.location.href = "../modules/bus-pass.html";
}
function goToNotifications() {
  window.location.href = "../modules/notifications.html";
}

/* ================= PROFILE ================= */
async function loadProfile() {
  try {
    const res = await fetch(`${API}/api/student/profile`, {
      headers: authHeaders()
    });
    const s = await res.json();

    studentTopName.innerText = s.name;
    studentName.innerText = s.name;
    studentUID.innerText = s.university_id;
    studentEmail.innerText = s.email;
    studentDOB.innerText = s.dob;
    studentFather.innerText = s.father_name;
    studentCourse.innerText = s.course;
    studentSemester.innerText = s.semester;
    studentCampus.innerText = s.campus;

  } catch {
    console.error("Profile load failed");
  }
}

/* ================= ANNOUNCEMENT ================= */
async function loadAnnouncement() {
  try {
    const res = await fetch(`${API}/api/student/announcement`);
    const a = await res.json();
    announcementText.innerText = a.text;
  } catch {
    announcementText.innerText = "Welcome to University Bus Management System";
  }
}

/* ================= BUS ALERTS ================= */
async function loadBusAlerts() {
  try {
    const res = await fetch(`${API}/api/student/alerts`, {
      headers: authHeaders()
    });
    const alerts = await res.json();

    const ul = document.getElementById("busAlerts");
    ul.innerHTML = "";

    if (alerts.length === 0) {
      ul.innerHTML = "<li>No alerts today</li>";
      return;
    }

    alerts.forEach(a => {
      ul.innerHTML += `<li>🚍 ${a.message}</li>`;
    });

    // Notification badge
    const badge = document.createElement("span");
    badge.innerText = alerts.length;
    badge.style.cssText = `
      background:red;
      color:white;
      font-size:11px;
      padding:2px 6px;
      border-radius:50%;
      margin-left:6px;
    `;
    document.getElementById("studentTopName").appendChild(badge);

  } catch {
    busAlerts.innerHTML = "<li>Unable to load alerts</li>";
  }
}

/* ================= SEAT STATUS ================= */
async function loadSeatStatus() {
  try {
    const res = await fetch(`${API}/api/student/seat-status`, {
      headers: authHeaders()
    });
    const data = await res.json();
    seatStatus.innerText = `${data.available} seats available`;
  } catch {
    seatStatus.innerText = "Status unavailable";
  }
}

/* ================= INIT ================= */
loadProfile();
loadAnnouncement();
loadBusAlerts();
loadSeatStatus();
