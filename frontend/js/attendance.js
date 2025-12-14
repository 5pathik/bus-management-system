const API = "http://127.0.0.1:5000";

/* ================= AUTH CHECK ================= */
(function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    alert("Unauthorized access");
    window.location.href = "../pages/index.html";
  }
})();

/* ================= AUTH HEADERS ================= */
function authHeaders() {
  return {
    "Authorization": "Bearer " + localStorage.getItem("token")
  };
}

/* ================= LOAD ATTENDANCE CARDS ================= */
async function loadAttendanceReport() {
  try {
    const res = await fetch(`${API}/admin/attendance-report`, {
      headers: authHeaders()
    });

    if (!res.ok) throw new Error("Unauthorized");

    const data = await res.json();
    const reportDiv = document.getElementById("report");

    if (!data || data.length === 0) {
      reportDiv.innerHTML = "<p>No attendance data available</p>";
      return;
    }

    let output = "";
    data.forEach(row => {
      output += `
        <div class="card">
          <h3>${row.route_name}</h3>
          <p><strong>Date:</strong> ${row.date}</p>
          <p><strong>Students Present:</strong> ${row.total_present}</p>
        </div>
      `;
    });

    reportDiv.innerHTML = output;

  } catch (err) {
    console.error("❌ Attendance report error:", err);
    document.getElementById("report").innerHTML =
      "<p>Session expired. Please login again.</p>";
  }
}

/* ================= LOAD ATTENDANCE CHART ================= */
async function loadAttendanceChart() {
  try {
    const res = await fetch(`${API}/admin/attendance-chart`, {
      headers: authHeaders()
    });

    if (!res.ok) throw new Error("Chart API failed");

    const data = await res.json();
    if (!data || data.length === 0) return;

    const labels = data.map(d => d.route_name);
    const values = data.map(d => d.total);

    new Chart(document.getElementById("attendanceChart"), {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Students Present",
          data: values,
          backgroundColor: "#2563eb"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

  } catch (err) {
    console.warn("⚠️ Chart data not available");
  }
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  loadAttendanceReport();
  loadAttendanceChart();
});
