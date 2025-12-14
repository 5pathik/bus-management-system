// Load attendance cards
fetch("http://127.0.0.1:5000/admin/attendance-report")
  .then(res => res.json())
  .then(data => {
    let output = "";

    data.forEach(row => {
      output += `
        <div class="card">
          <h3>${row.route_name}</h3>
          <p><strong>Date:</strong> ${row.date}</p>
          <p><strong>Students Present:</strong> ${row.total_present}</p>
        </div>
      `;
    });

    document.getElementById("report").innerHTML = output || "No data available";
  })
  .catch(() => {
    document.getElementById("report").innerHTML =
      "<p>Backend not running</p>";
  });

// Load attendance chart
fetch("http://127.0.0.1:5000/admin/attendance-chart")
  .then(res => res.json())
  .then(data => {
    const labels = data.map(d => d.route_name);
    const values = data.map(d => d.total);

    new Chart(document.getElementById("attendanceChart"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Students Present",
          data: values,
          backgroundColor: "#2563eb"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  })
  .catch(() => console.log("Chart data not available"));
