const API = "http://127.0.0.1:5000";

/* ================= AUTH CHECK ================= */
(function authCheck() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "student") {
    localStorage.clear();
    window.location.href = "../pages/index.html";
  }
})();

/* ================= AUTH HEADERS ================= */
function authHeaders() {
  return {
    Authorization: "Bearer " + localStorage.getItem("token")
  };
}

/* ================= USER DROPDOWN ================= */
function toggleDropdown() {
  document.getElementById("userDropdown")?.classList.toggle("show");
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

/* ================= NAVIGATION ================= */
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

/* ================= LOAD PROFILE ================= */
async function loadProfile() {
  try {
    const res = await fetch(`${API}/student/profile`, {
      method: "GET",
      headers: authHeaders()
    });

    if (res.status === 401) throw new Error("Session expired");
    if (!res.ok) throw new Error("Profile load failed");

    const s = await res.json();
    console.log("✅ PROFILE:", s);

    /* HEADER */
    document.getElementById("studentTopName").innerText = s.name || "Student";

    /* PROFILE DETAILS */
    document.getElementById("studentName").innerText = s.name || "-";
    document.getElementById("studentUID").innerText = s.university_id || "-";
    document.getElementById("studentEmail").innerText = s.email || "-";
    document.getElementById("studentDOB").innerText = s.dob || "-";
    document.getElementById("studentFather").innerText = s.father_name || "-";
    document.getElementById("studentCourse").innerText = s.course || "-";
    document.getElementById("studentSemester").innerText = s.semester || "-";
    document.getElementById("studentCampus").innerText = s.campus || "-";

    /* PROFILE IMAGE */
    const img = document.getElementById("profileImage");
    img.src = s.profile_image || "../assets/user.png";

  } catch (err) {
    console.error("❌ PROFILE ERROR:", err);
    alert("Session expired. Please login again.");
    logout();
  }
}

/* ================= UPLOAD PROFILE PHOTO ================= */
async function uploadPhoto() {
  const input = document.getElementById("photoInput");
  if (!input.files.length) {
    alert("Please select an image");
    return;
  }

  const formData = new FormData();
  formData.append("photo", input.files[0]);

  try {
    const res = await fetch(`${API}/student/upload-photo`, {
      method: "POST",
      headers: authHeaders(),
      body: formData
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    document.getElementById("profileImage").src =
      `${API}/uploads/profiles/${data.filename}`;

    alert("Profile photo updated successfully");

  } catch {
    alert("Failed to upload photo");
  }
}

/* ================= ANNOUNCEMENT ================= */
async function loadAnnouncement() {
  try {
    const res = await fetch(`${API}/student/announcement`);
    const a = await res.json();
    document.getElementById("announcementText").innerText =
      a.text || "Welcome to University Bus Management System";
  } catch {
    document.getElementById("announcementText").innerText =
      "Welcome to University Bus Management System";
  }
}

/* ================= BUS ALERTS ================= */
async function loadBusAlerts() {
  try {
    const res = await fetch(`${API}/student/alerts`, {
      headers: authHeaders()
    });

    const alerts = await res.json();
    const ul = document.getElementById("busAlerts");
    ul.innerHTML = "";

    if (!Array.isArray(alerts) || alerts.length === 0) {
      ul.innerHTML = "<li>No alerts today</li>";
      return;
    }

    alerts.forEach(a => {
      ul.innerHTML += `<li>🚍 ${a.message}</li>`;
    });

  } catch {
    document.getElementById("busAlerts").innerHTML =
      "<li>Unable to load alerts</li>";
  }
}

/* ================= SEAT STATUS ================= */
async function loadSeatStatus() {
  try {
    const res = await fetch(`${API}/student/seat-status`, {
      headers: authHeaders()
    });

    if (!res.ok) throw new Error();

    const data = await res.json();
    document.getElementById("seatStatus").innerText =
      `${data.available} seats available`;

  } catch {
    document.getElementById("seatStatus").innerText = "Status unavailable";
  }
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  loadAnnouncement();
  loadBusAlerts();
  loadSeatStatus();
});
