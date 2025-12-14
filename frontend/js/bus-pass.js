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

/* ================= LOAD BUS PASS ================= */
async function loadBusPass() {
  const busPassEl = document.getElementById("busPass");
  const passInfoEl = document.getElementById("passInfo");
  const qrImg = document.getElementById("qrImage");

  try {
    const res = await fetch(`${API}/student/bus-pass`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    });

    // ❌ Session expired
    if (res.status === 401) {
      throw new Error("Session expired");
    }

    // ❌ No bus pass
    if (!res.ok) {
      throw new Error("No active bus pass");
    }

    const data = await res.json();
    console.log("✅ BUS PASS:", data);

    /* ===== PASS DETAILS ===== */
    passInfoEl.innerHTML = `
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Route:</strong> ${data.route_name}</p>
      <p><strong>Valid Till:</strong> ${data.valid_till}</p>
    `;

    /* ===== QR IMAGE (IMPORTANT FIX) ===== */
    qrImg.src = `${API}/student/bus-pass/qr`;
    qrImg.alt = "Bus Pass QR Code";
    qrImg.style.display = "block";

  } catch (err) {
    console.error("❌ BUS PASS ERROR:", err);

    busPassEl.innerHTML = `
      <h3>🎫 No Active Bus Pass</h3>
      <p>Please contact the transport office.</p>
    `;

    // Auto logout if session expired
    if (err.message.includes("Session")) {
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "../pages/index.html";
      }, 1500);
    }
  }
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", loadBusPass);
