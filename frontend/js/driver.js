// Load today's route (demo for now)
document.addEventListener("DOMContentLoaded", () => {
  // This can later come from backend
  document.getElementById("routeName").innerText =
    "Campus → City Center";
});

// Mark attendance (demo)
function markAttendance() {
  alert("Attendance marked successfully");
}
// AUTH CHECK
(function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "driver") {
    window.location.href = "index.html";
  }
})();

// LOAD DRIVER INFO
fetch("http://127.0.0.1:5000/driver/info", {
  headers: {
    Authorization: localStorage.getItem("token")
  }
})
.then(res => res.json())
.then(data => {
  document.getElementById("driverName").innerText = data.name;
});

// LOAD ROUTE
fetch("http://127.0.0.1:5000/driver/today-route", {
  headers: {
    Authorization: localStorage.getItem("token")
  }
})
.then(res => res.json())
.then(data => {
  document.getElementById("route").innerText = data.route;
  document.getElementById("shift").innerText = data.shift;
  document.getElementById("status").innerText = data.status;
});
function scanQR() {
  const qr = document.getElementById("qrInput").value;

  fetch("http://127.0.0.1:5000/driver/scan-bus-pass", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token")
    },
    body: JSON.stringify({ qr })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("scanResult").innerText = data.message;
  });
}
let html5QrCode;

function startScan() {
  document.getElementById("scanStatus").innerText = "Opening camera...";

  html5QrCode = new Html5Qrcode("qr-reader");

  html5QrCode.start(
    { facingMode: "environment" }, // rear camera
    {
      fps: 10,
      qrbox: 250
    },
    qrCodeMessage => {
      // QR detected
      stopScan();
      markAttendance(qrCodeMessage);
    },
    errorMessage => {
      // silent scan errors
    }
  ).catch(err => {
    document.getElementById("scanStatus").innerText =
      "Camera permission denied";
  });
}

function stopScan() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
    });
  }
}

function markAttendance(qrText) {
  document.getElementById("scanStatus").innerText =
    "Verifying bus pass...";

  fetch("http://127.0.0.1:5000/driver/scan-bus-pass", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token")
    },
    body: JSON.stringify({ qr: qrText })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("scanStatus").innerText =
        data.message;
    })
    .catch(() => {
      document.getElementById("scanStatus").innerText =
        "Server error";
    });
}
