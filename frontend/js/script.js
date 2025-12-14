fetch("http://127.0.0.1:5000/routes")
  .then(response => response.json())
  .then(data => {
    let output = "";
    data.forEach(route => {
      output += `
        <div class="card">
          <h3>${route.route}</h3>
          <p>Time: ${route.time}</p>
        </div>
      `;
    });
    document.getElementById("routes").innerHTML = output;
  })
  .catch(error => {
    document.getElementById("routes").innerHTML =
      "<p>Backend not running</p>";
  });
function login() {
    let role = document.getElementById("role").value;

    if (role === "admin") {
        window.location.href = "admin.html";
    } else if (role === "student") {
        window.location.href = "student.html";
    } else if (role === "driver") {
        window.location.href = "driver.html";
    }
}
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      const role = data.user.role;
      if (role === "admin") location.href = "admin.html";
      if (role === "student") location.href = "student.html";
      if (role === "driver") location.href = "driver.html";
    } else {
      alert("Invalid Login");
    }
  });
}
