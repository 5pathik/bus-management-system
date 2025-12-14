const API = "http://127.0.0.1:5000";

/* ================= AUTH CHECK ================= */
(function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    alert("Unauthorized access");
    window.location.href = "../pages/index.html";
  }
})();

/* ================= HEADERS ================= */
function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("token")
  };
}

/* ================= ELEMENTS ================= */
const routeSelect = document.getElementById("route");
const dateInput = document.getElementById("date");
const listEl = document.getElementById("list");

/* ================= LOAD ROUTES ================= */
async function loadRoutes() {
  try {
    const res = await fetch(`${API}/admin/routes-list`, {
      headers: authHeaders()
    });
    const routes = await res.json();

    routeSelect.innerHTML = `<option value="">All Routes</option>`;

    routes.forEach(r => {
      routeSelect.innerHTML += `
        <option value="${r.id}">
          ${r.route_name}
        </option>
      `;
    });

  } catch (err) {
    console.error("Routes load failed", err);
    routeSelect.innerHTML = `<option>Error loading routes</option>`;
  }
}

/* ================= LOAD STUDENTS ================= */
async function loadStudents() {
  let url = `${API}/admin/students-by-route/filter?`;

  if (routeSelect.value)
    url += `route_id=${routeSelect.value}&`;

  if (dateInput.value)
    url += `date=${dateInput.value}`;

  try {
    const res = await fetch(url, {
      headers: authHeaders()
    });

    const data = await res.json();
    listEl.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      listEl.innerHTML = `<p class="empty">No records found</p>`;
      return;
    }

    data.forEach(row => {
      listEl.innerHTML += `
        <div class="card">
          <h3>${row.student_name}</h3>
          <p><b>Route:</b> ${row.route_name}</p>
          <p><b>Date:</b> ${row.date}</p>
        </div>
      `;
    });

  } catch (err) {
    console.error("Students load failed", err);
    listEl.innerHTML = `<p class="error">Backend not running</p>`;
  }
}

/* ================= EXPORT CSV ================= */
function exportCSV() {
  let url = `${API}/admin/export-attendance?`;

  if (routeSelect.value)
    url += `route_id=${routeSelect.value}&`;

  if (dateInput.value)
    url += `date=${dateInput.value}`;

  window.open(url, "_blank");
}

/* ================= EVENTS ================= */
routeSelect.addEventListener("change", loadStudents);
dateInput.addEventListener("change", loadStudents);

/* ================= INIT ================= */
loadRoutes();
loadStudents();
