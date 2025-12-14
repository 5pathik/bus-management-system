// TEMP: student id (later from login/session)
const studentId = 1;

fetch(`http://127.0.0.1:5000/bus-pass/${studentId}`)
  .then(res => res.json())
  .then(data => {
    if (!data) {
      document.getElementById("busPass").innerHTML =
        "<p>No bus pass found</p>";
      return;
    }

    document.getElementById("busPass").innerHTML = `
      <h3>University Bus Pass</h3>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Route:</strong> ${data.route_name}</p>
      <p><strong>Valid Till:</strong> ${data.valid_till}</p>

      <button onclick="downloadPass()">Download Pass</button>
    `;
  })
  .catch(() => {
    document.getElementById("busPass").innerHTML =
      "<p>Backend not running</p>";
  });

// Download placeholder
function downloadPass() {
  window.location.href = "coming-soon.html";
}
