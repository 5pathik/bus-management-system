const listEl = document.getElementById("list");
const routeSelect = document.getElementById("route");

// Load routes dropdown
fetch("http://127.0.0.1:5000/routes-list")
  .then(res => res.json())
  .then(routes => {
    routeSelect.innerHTML = `<option value="">All Routes</option>`;
    routes.forEach(r => {
      routeSelect.innerHTML +=
        `<option value="${r.id}">${r.route_name}</option>`;
    });
  });

// Load student data
function loadData() {
  const route = routeSelect.value;
  const date = document.getElementById("date").value;

  let url =
    "http://127.0.0.1:5000/admin/students-by-route/filter?";

  if (route) url += `route_id=${route}&`;
  if (date) url += `date=${date}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        listEl.innerHTML = "<p>No records found</p>";
        return;
      }

      let output = "";
      data.forEach(row => {
        output += `
          <div class="card">
            <h3>${row.route_name}</h3>
            <p><strong>Date:</strong> ${row.date}</p>
            <p><strong>Student:</strong> ${row.student_name}</p>
          </div>
        `;
      });

      listEl.innerHTML = output;
    })
    .catch(() => {
      listEl.innerHTML = "<p>Backend not running</p>";
    });
}

// Export CSV
function exportCSV() {
  const route = routeSelect.value;
  const date = document.getElementById("date").value;

  let url =
    "http://127.0.0.1:5000/admin/export-attendance?";

  if (route) url += `route_id=${route}&`;
  if (date) url += `date=${date}`;

  window.open(url, "_blank");
}

// Auto-load on page open
loadData();
