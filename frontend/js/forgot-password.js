const API = "http://127.0.0.1:5000";

/* ================= SEND OTP ================= */
function sendOTP() {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    alert("Please enter your registered email");
    return;
  }

  fetch(`${API}/forgot-password/send-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        alert("OTP sent to your email");
        document.getElementById("otpSection").style.display = "block";
      } else {
        alert(data.message || "Failed to send OTP");
      }
    })
    .catch(() => {
      alert("Server not responding. Try again later.");
    });
}

/* ================= RESET PASSWORD ================= */
function resetPassword() {
  const email = document.getElementById("email").value.trim();
  const otp = document.getElementById("otp").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();

  if (!email || !otp || !newPassword) {
    alert("Please fill all fields");
    return;
  }

  if (newPassword.length < 4) {
    alert("Password must be at least 4 characters");
    return;
  }

  fetch(`${API}/forgot-password/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      otp,
      new_password: newPassword
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        alert("Password reset successful. Please login.");
        window.location.href = "../pages/index.html";
      } else {
        alert(data.message || "Invalid OTP");
      }
    })
    .catch(() => {
      alert("Server error. Please try again.");
    });
}
