import { db } from "../js/firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const totalStudents = document.getElementById("totalStudents");
const totalConductors = document.getElementById("totalConductors");
const totalBuses = document.getElementById("totalBuses");
const validPasses = document.getElementById("validPasses");
const expiredPasses = document.getElementById("expiredPasses");
const totalAttendance = document.getElementById("totalAttendance");
const topRoutesList = document.getElementById("topRoutesList");
const recentActivityList = document.getElementById("recentActivityList");

function parseDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function getPassStatus(student) {
  if (student.feeStatus !== "Paid") return "Invalid";
  const expiry = parseDate(student.validUntil);
  if (!expiry) return "Invalid";
  return new Date() <= expiry ? "Valid" : "Expired";
}

function safeText(value) {
  return value ?? "—";
}

async function loadReports() {
  try {
    const studentsSnap = await getDocs(collection(db, "students"));
    const conductorsSnap = await getDocs(
      query(collection(db, "users"), where("role", "==", "conductor"))
    );
    const busesSnap = await getDocs(collection(db, "buses"));
    const attendanceSnap = await getDocs(collection(db, "attendance"));

    totalStudents.textContent = studentsSnap.size;
    totalConductors.textContent = conductorsSnap.size;
    totalBuses.textContent = busesSnap.size;
    totalAttendance.textContent = attendanceSnap.size;

    let validCount = 0;
    let expiredCount = 0;
    const routeCounts = {};

    studentsSnap.forEach((docItem) => {
      const student = docItem.data();
      const passStatus = getPassStatus(student);

      if (passStatus === "Valid") validCount++;
      else expiredCount++;

      const route = student.route || "Unknown";
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });

    validPasses.textContent = validCount;
    expiredPasses.textContent = expiredCount;

    loadAttendanceChart(attendanceSnap);
    loadPassStatusChart(validCount, expiredCount);
    loadBusStatusChart(busesSnap);
    loadTopRoutes(routeCounts);
    loadRecentActivity(attendanceSnap);
  } catch (error) {
    console.error("Reports error:", error);
  }
}

function loadAttendanceChart(attendanceSnap) {
  const attendanceData = {};

  attendanceSnap.forEach((docItem) => {
    const item = docItem.data();
    const route = item.route || "Unknown";
    attendanceData[route] = (attendanceData[route] || 0) + 1;
  });

  new Chart(document.getElementById("attendanceChart"), {
    type: "bar",
    data: {
      labels: Object.keys(attendanceData),
      datasets: [
        {
          label: "Attendance Count",
          data: Object.values(attendanceData),
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function loadPassStatusChart(validCount, expiredCount) {
  new Chart(document.getElementById("passStatusChart"), {
    type: "doughnut",
    data: {
      labels: ["Valid", "Expired / Invalid"],
      datasets: [{ data: [validCount, expiredCount] }]
    },
    options: { responsive: true }
  });
}

function loadBusStatusChart(busesSnap) {
  let active = 0;
  let maintenance = 0;
  let inactive = 0;

  busesSnap.forEach((docItem) => {
    const bus = docItem.data();
    const status = (bus.busStatus || "").toLowerCase();

    if (status === "active") active++;
    else if (status === "maintenance") maintenance++;
    else inactive++;
  });

  new Chart(document.getElementById("busStatusChart"), {
    type: "pie",
    data: {
      labels: ["Active", "Maintenance", "Inactive"],
      datasets: [{ data: [active, maintenance, inactive] }]
    },
    options: { responsive: true }
  });
}

function loadTopRoutes(routeCounts) {
  if (!topRoutesList) return;

  topRoutesList.innerHTML = "";
  const sortedRoutes = Object.entries(routeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (sortedRoutes.length === 0) {
    topRoutesList.innerHTML = `<div class="recent-item"><span>No route data available.</span></div>`;
    return;
  }

  sortedRoutes.forEach(([route, count]) => {
    topRoutesList.innerHTML += `
      <div class="recent-item">
        <strong>${route}</strong>
        <span>${count} students assigned</span>
      </div>
    `;
  });
}

function loadRecentActivity(attendanceSnap) {
  if (!recentActivityList) return;

  recentActivityList.innerHTML = "";

  const recentAttendance = [];
  attendanceSnap.forEach((docItem) => recentAttendance.push(docItem.data()));

  if (recentAttendance.length === 0) {
    recentActivityList.innerHTML = `<div class="recent-item"><span>No recent activity.</span></div>`;
    return;
  }

  recentAttendance.slice(-5).reverse().forEach((item) => {
    recentActivityList.innerHTML += `
      <div class="recent-item">
        <strong>${item.name || "Attendance marked"}</strong>
        <span>${safeText(item.route)} • ${safeText(item.time)} • ${safeText(item.date)}</span>
      </div>
    `;
  });
}

loadReports();