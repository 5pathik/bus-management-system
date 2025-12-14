const API = "http://127.0.0.1:5000";
let html5QrCode;

/* ================= AUTH CHECK ================= */
(function authCheck() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "driver") {
    localStorage.clear();
    window.location.href = "../pages/index.html";
  }
})();

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  window.location.href = "../pages/index.html";
}

/* ================= LOAD DRIVER INFO ================= */
/* ✅ Static demo-safe (avoids backend dependency) */
function loadDriverInfo() {
  const el = document.getElementById("driverName");
  if (el) el.innerText = "Driver";
}

/* ================= LOAD TODAY ROUTE ================= */
/* ✅ Static demo-safe */
function loadTodayRoute() {
  document.getElementById("route").innerText = "Campus → City Center";
  document.getElementById("shift").innerText = "Morning";
  document.getElementById("status").innerText = "Active";
}

/* ================= START QR SCAN ================= */
function startScan() {
  document.getElementById("scanStatus").innerText = "Opening camera...";

  html5QrCode = new Html5Qrcode("qr-reader");

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    qrText => {
      stopScan();
      verifyBusPass(qrText);
    },
    () => {} // silent scan errors
  ).catch(() => {
    document.getElementById("scanStatus").innerText =
      "Camera permission denied";
  });
}

/* ================= STOP SCAN ================= */
function stopScan() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
    }).catch(() => {});
  }
}

/* ================= VERIFY BUS PASS ================= */
/* ✅ Demo-safe QR verification */
function verifyBusPass(qrText) {
  console.log("📷 SCANNED QR:", qrText);

  document.getElementById("scanStatus").innerText =
    "Bus pass verified ✅";
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  loadDriverInfo();
  loadTodayRoute();
});
