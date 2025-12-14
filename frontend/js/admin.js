// Load dashboard numbers (demo values for now)
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("totalBuses").innerText = "12";
  document.getElementById("totalRoutes").innerText = "6";
  document.getElementById("totalDrivers").innerText = "10";
  document.getElementById("totalStudents").innerText = "1200";
});

// Navigation functions
function openAttendanceReport() {
  window.location.href = "../modules/attendance-report.html";
}

function openStudentsByRoute() {
  window.location.href = "../modules/students-by-route.html";
}
