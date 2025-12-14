const API = "http://127.0.0.1:5000";

/* ================= AUTH CHECK ================= */
(function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "student") {
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

/* ================= LOAD BUS PASS ================= */
async function loadBusPass() {
  try {
    const res = await fetch(`${API}/student/bus-pass`, {
      headers: authHeaders()
    });

    if (!res.ok) throw new Error("Bus pass not found");

    const data = await res.json();

    document.getElementById("busPass").innerHTML = `
      <h3>🎫 University Bus Pass</h3>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Route:</strong> ${data.route_name}</p>
      <p><strong>Valid Till:</strong> ${data.valid_till}</p>

      <img 
        src="${API}/student/bus-pass/qr" 
        alt="Bus Pass QR"
        style="width:180px;margin-top:15px;border:1px solid #ccc"
      >
    `;

  } catch (err) {
    console.error("❌ Bus pass error:", err);
    document.getElementById("busPass").innerHTML =
      "<p>No active bus pass found</p>";
  }
}

/* ================= INIT ================= */
loadBusPass();
