let code = "";

// ================= SECURITY CODE =================
function generateCode() {
  code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const codeEl = document.getElementById("securityCode");
  if (codeEl) {
    codeEl.innerText = code;
  }
}

window.onload = generateCode;

// ================= LOGIN FUNCTION =================
function login() {
  const email = document.getElementById("userId").value.trim();
  const password = document.getElementById("password").value.trim();
  const securityInput = document.getElementById("securityInput").value.trim();

  // Basic validation
  if (!email || !password || !securityInput) {
    alert("Please fill all fields");
    return;
  }

  // Security code validation
  if (securityInput !== code) {
    alert("Security code incorrect");
    generateCode();
    return;
  }

  fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {

      if (data.status === "success" && data.token && data.user) {

        // ================= STORE JWT PROPERLY =================
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("userId", data.user.id);

        // ================= ROLE-BASED REDIRECT =================
        if (data.user.role === "student") {
          window.location.href = "student-dashboard.html";
        }
        else if (data.user.role === "driver") {
          window.location.href = "driver-dashboard.html";
        }
        else if (data.user.role === "admin") {
          window.location.href = "admin-dashboard.html";
        }
        else {
          alert("Unknown user role");
        }

      } else {
        alert("Invalid login credentials");
        generateCode();
      }
    })
    .catch(() => {
      alert("Unable to connect to server");
    });
}
