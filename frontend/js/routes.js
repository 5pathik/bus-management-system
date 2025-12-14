const listEl = document.getElementById("list");
const routeSelect = document.getElementById("route");

/* ================= LOAD ROUTES ================= */
fetch("http://127.0.0.1:5000/routes-list")
  .then(res => res.json())
  .then(routes => {
    routeSelect.innerHTML = `<option value="">All Routes</option>`;
    routes.forEach(r => {
      routeSelect.innerHTML +=
        `<option value="${r.id}">${r.route_name}</option>`;
    });
  });

/* ================= LOAD STUDENTS ================= */
function loadData() {
  const route = routeSelect.value;
  const date = document.getElementById("date").value;

  let url = "http://127.0.0.1:5000/admin/students-by-route/filter?";

  if (route) url += `route_id=${route}&`;
  if (date) url += `date=${date}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        listEl.innerHTML = `
          <div class="empty-state">
            📭 No attendance records found
          </div>`;
        return;
      }

      let output = "";
      data.forEach(row => {
        output += `
          <div class="student-card">
            <div class="student-left">
              <div class="avatar">👤</div>
            </div>

            <div class="student-info">
              <h4>${row.student_name}</h4>
              <p><b>Route:</b> ${row.route_name}</p>
              <p><b>Date:</b> ${row.date}</p>
            </div>

            <div class="student-status">
              <span class="status present">Present</span>
            </div>
          </div>
        `;
      });

      listEl.innerHTML = output;
    })
    .catch(() => {
      listEl.innerHTML = `<p class="error">Backend not running</p>`;
    });
}

/* ================= EXPORT CSV ================= */
function exportCSV() {
  const route = routeSelect.value;
  const date = document.getElementById("date").value;

  let url = "http://127.0.0.1:5000/admin/export-attendance?";

  if (route) url += `route_id=${route}&`;
  if (date) url += `date=${date}`;

  window.open(url, "_blank");
}

loadData();
