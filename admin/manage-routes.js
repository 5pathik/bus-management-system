import { db } from "../js/firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const routeForm = document.getElementById("routeForm");
const routeName = document.getElementById("routeName");
const routeStops = document.getElementById("routeStops");
const routePath = document.getElementById("routePath");
const routesTableBody = document.getElementById("routesTableBody");
const routeSearch = document.getElementById("routeSearch");
const routeFilter = document.getElementById("routeFilter");
const routeDocId = document.getElementById("routeDocId");
const saveRouteBtn = document.getElementById("saveRouteBtn");
const cancelRouteEditBtn = document.getElementById("cancelRouteEditBtn");

let allRoutes = [];

function clearRouteForm() {
  routeForm.reset();
  routeDocId.value = "";
  saveRouteBtn.textContent = "Save Route";
  cancelRouteEditBtn.style.display = "none";
}

routeForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  let parsedPath = [];
  try {
    parsedPath = JSON.parse(routePath.value);
  } catch {
    alert("Invalid route coordinates JSON.");
    return;
  }

  try {
    const payload = {
      routeName: routeName.value.trim(),
      stops: routeStops.value.trim(),
      routePath: parsedPath,
      updatedAt: new Date()
    };

    const existingId = routeDocId.value.trim();

    if (existingId) {
      await updateDoc(doc(db, "routes", existingId), payload);
      alert("Route updated successfully!");
    } else {
      await addDoc(collection(db, "routes"), {
        ...payload,
        createdAt: new Date()
      });
      alert("Route added successfully!");
    }

    clearRouteForm();
    loadRoutes();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

cancelRouteEditBtn?.addEventListener("click", () => {
  clearRouteForm();
});

function renderRoutes() {
  if (!routesTableBody) return;

  const searchValue = (routeSearch?.value || "").toLowerCase().trim();
  const filterValue = routeFilter?.value || "all";

  const filtered = allRoutes.filter((item) => {
    const route = item.data;
    const pathPoints = Array.isArray(route.routePath) ? route.routePath.length : 0;

    const matchesSearch =
      (route.routeName || "").toLowerCase().includes(searchValue) ||
      (route.stops || "").toLowerCase().includes(searchValue);

    const hasPath = pathPoints > 0;
    const matchesFilter =
      filterValue === "all" ||
      (filterValue === "withPath" && hasPath) ||
      (filterValue === "withoutPath" && !hasPath);

    return matchesSearch && matchesFilter;
  });

  routesTableBody.innerHTML = "";

  filtered.forEach((item) => {
    const route = item.data;
    const pathPoints = Array.isArray(route.routePath) ? route.routePath.length : 0;

    routesTableBody.innerHTML += `
      <tr>
        <td>${route.routeName || ""}</td>
        <td>${route.stops || ""}</td>
        <td>${pathPoints}</td>
        <td>
          <button class="btn btn-primary" onclick="editRoute('${item.id}')">Edit</button>
          <button class="delete-btn" onclick="deleteRoute('${item.id}')">Delete</button>
        </td>
      </tr>
    `;
  });

  if (filtered.length === 0) {
    routesTableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:20px;">
          No routes found.
        </td>
      </tr>
    `;
  }
}

async function loadRoutes() {
  const snapshot = await getDocs(collection(db, "routes"));
  allRoutes = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    data: docItem.data()
  }));

  renderRoutes();
}

window.editRoute = function (id) {
  const routeObj = allRoutes.find((item) => item.id === id);
  if (!routeObj) return;

  const route = routeObj.data;

  routeName.value = route.routeName || "";
  routeStops.value = route.stops || "";
  routePath.value = JSON.stringify(route.routePath || [], null, 2);
  routeDocId.value = id;

  saveRouteBtn.textContent = "Update Route";
  cancelRouteEditBtn.style.display = "inline-flex";

  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.deleteRoute = async function (routeId) {
  const confirmDelete = confirm("Delete this route?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "routes", routeId));
    loadRoutes();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

routeSearch?.addEventListener("input", renderRoutes);
routeFilter?.addEventListener("change", renderRoutes);

loadRoutes();