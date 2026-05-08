function registerUser(event) {
  event.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const role = document.getElementById("regRole").value;

  const user = { fullName, email, password, role };

  localStorage.setItem("bms_user", JSON.stringify(user));
  alert("Registration successful!");
  window.location.href = "login.html";
}

function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const role = document.getElementById("loginRole").value;

  const savedUser = JSON.parse(localStorage.getItem("bms_user"));

  if (
    savedUser &&
    savedUser.email === email &&
    savedUser.password === password &&
    savedUser.role === role
  ) {
    localStorage.setItem("bms_logged_in", JSON.stringify(savedUser));

    if (role === "admin") window.location.href = "admin/admin-dashboard.html";
    else if (role === "conductor") window.location.href = "conductor/conductor-dashboard.html";
    else window.location.href = "student/student-dashboard.html";
  } else {
    alert("Invalid credentials or role.");
  }
}

function logoutUser() {
  localStorage.removeItem("bms_logged_in");
  window.location.href = "../login.html";
}