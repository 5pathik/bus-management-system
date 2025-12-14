/* ================= API BASE ================= */
const API = "http://127.0.0.1:5000";

/* ================= LOAD BUS ROUTES ================= */
function loadRoutes() {
  fetch(`${API}/routes`)
    .then(res => res.json())
    .then(data => {
      let output = "";

      if (!data || data.length === 0) {
        document.getElementById("routes").innerHTML =
          "<p>No routes available</p>";
        return;
      }

      data.forEach(route => {
        output += `
          <div class="card">
            <h3>🚌 ${route.route}</h3>
            <p><b>Time:</b> ${route.time}</p>
          </div>
        `;
      });

      document.getElementById("routes").innerHTML = output;
    })
    .catch(() => {
      document.getElementById("routes").innerHTML =
        "<p>Backend not running</p>";
    });
}

/* Auto-load routes if page has routes container */
if (document.getElementById("routes")) {
  loadRoutes();
}

/* ================= LOGIN ================= */
function login() {
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {

      if (data.status !== "success") {
        alert("Invalid login credentials");
        return;
      }

      /* ================= STORE SESSION ================= */
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userName", data.name);

      /* ================= ROLE REDIRECT ================= */
      if (data.role === "student") {
        window.location.href = "student-dashboard.html";
      }
      else if (data.role === "driver") {
        window.location.href = "driver-dashboard.html";
      }
      else if (data.role === "admin") {
        window.location.href = "admin-dashboard.html";
      }
      else {
        alert("Unknown user role");
      }
    })
    .catch(() => {
      alert("Unable to connect to server");
    });
}
