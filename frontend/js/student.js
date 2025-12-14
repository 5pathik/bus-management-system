// ================= AUTH CHECK =================
(function checkAuth() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "student") {
    alert("Unauthorized access");
    window.location.href = "../pages/index.html";
  }
})();

// ================= PAGE LOAD =================
document.addEventListener("DOMContentLoaded", () => {

  const name = localStorage.getItem("userName") || "Student";
  const email = localStorage.getItem("userEmail") || "student@gehu.ac.in";

  // Top header name
  const topName = document.getElementById("studentTopName");
  if (topName) topName.innerText = name;

  // Profile card name
  const cardName = document.getElementById("studentName");
  if (cardName) cardName.innerText = name;

  // Profile email
  const emailEl = document.getElementById("studentEmail");
  if (emailEl) emailEl.innerText = email;
});

// ================= NAVIGATION =================
function goToRoutes() {
  window.location.href = "../modules/routes.html";
}

function goToBusPass() {
  window.location.href = "../modules/bus-pass.html";
}

function goToNotifications() {
  window.location.href = "../modules/notifications.html";
}

function comingSoon() {
  window.location.href = "../modules/coming-soon.html";
}

function goHome() {
  window.location.href = "student-dashboard.html";
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");

  window.location.href = "../pages/index.html";
}
