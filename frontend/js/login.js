let code = "";

/* ===== SECURITY CODE ===== */
function generateCode() {
  code = Math.random().toString(36).substring(2, 8).toUpperCase();
  document.getElementById("securityCode").innerText = code;
}
window.onload = generateCode;

/* ===== LOGIN ===== */
function login() {
  const email = document.getElementById("userId").value.trim();
  const password = document.getElementById("password").value.trim();
  const securityInput = document.getElementById("securityInput").value.trim();

  if (!email || !password || !securityInput) {
    alert("Please fill all fields");
    return;
  }

  if (securityInput !== code) {
    alert("Security code incorrect");
    generateCode();
    return;
  }

  fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {

    console.log("LOGIN RESPONSE:", data);

    if (data.status === "success") {

      // ✅ STORE TOKEN CORRECTLY
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userName", data.name);

      // ✅ REDIRECT
      if (data.role === "student") {
        window.location.href = "student-dashboard.html";
      } else if (data.role === "driver") {
        window.location.href = "driver-dashboard.html";
      } else if (data.role === "admin") {
        window.location.href = "admin-dashboard.html";
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
