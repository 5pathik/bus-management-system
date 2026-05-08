import { db, auth } from "../js/firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const conductorForm = document.getElementById("conductorForm");
const conductorTableBody = document.getElementById("conductorTableBody");
const conductorSearch = document.getElementById("conductorSearch");
const conductorFilter = document.getElementById("conductorFilter");
const conductorDocId = document.getElementById("conductorDocId");
const saveConductorBtn = document.getElementById("saveConductorBtn");
const cancelConductorEditBtn = document.getElementById("cancelConductorEditBtn");
const conductorPassword = document.getElementById("conductorPassword");
const conductorEmail = document.getElementById("conductorEmail");

let allConductors = [];

function clearConductorForm() {
  conductorForm.reset();
  conductorDocId.value = "";
  saveConductorBtn.textContent = "Add Conductor";
  cancelConductorEditBtn.style.display = "none";
  conductorPassword.required = true;
  conductorPassword.style.display = "block";
  conductorPassword.previousElementSibling.style.display = "block";
  conductorEmail.readOnly = false;
}

conductorForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("conductorName").value.trim();
  const email = document.getElementById("conductorEmail").value.trim();
  const bus = document.getElementById("conductorBus").value.trim();
  const route = document.getElementById("conductorRoute").value.trim();
  const existingId = conductorDocId.value.trim();

  try {
    if (existingId) {
      await updateDoc(doc(db, "users", existingId), {
        name,
        bus,
        route,
        updatedAt: new Date()
      });

      alert("Conductor updated successfully!");
    } else {
      const password = conductorPassword.value.trim();

      await addDoc(collection(db, "users"), {
        name,
        email,
        bus,
        route,
        role: "conductor",
        createdAt: new Date()
      });

      await addDoc(collection(db, "users"), {
        name,
        email,
        bus,
        route,
        role: "conductor",
        createdAt: new Date()
      });

      alert("Conductor added successfully!");
    }

    clearConductorForm();
    loadConductors();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

cancelConductorEditBtn?.addEventListener("click", () => {
  clearConductorForm();
});

function renderConductors() {
  if (!conductorTableBody) return;

  const searchValue = (conductorSearch?.value || "").toLowerCase().trim();
  const filterValue = conductorFilter?.value || "all";

  const filtered = allConductors.filter((item) => {
    const conductor = item.data;

    const matchesSearch =
      (conductor.name || "").toLowerCase().includes(searchValue) ||
      (conductor.email || "").toLowerCase().includes(searchValue) ||
      (conductor.bus || "").toLowerCase().includes(searchValue) ||
      (conductor.route || "").toLowerCase().includes(searchValue);

    const hasBus = !!(conductor.bus && conductor.bus.trim());
    const hasRoute = !!(conductor.route && conductor.route.trim());

    let matchesFilter = true;
    if (filterValue === "bus") matchesFilter = hasBus;
    if (filterValue === "route") matchesFilter = hasRoute;
    if (filterValue === "empty") matchesFilter = !hasBus || !hasRoute;

    return matchesSearch && matchesFilter;
  });

  conductorTableBody.innerHTML = "";

  filtered.forEach((item) => {
    const conductor = item.data;

    conductorTableBody.innerHTML += `
      <tr>
        <td>${conductor.name || ""}</td>
        <td>${conductor.email || ""}</td>
        <td>${conductor.bus || "—"}</td>
        <td>${conductor.route || "—"}</td>
        <td>
          <button class="btn btn-primary" onclick="editConductor('${item.id}')">Edit</button>
          <button class="delete-btn" onclick="deleteConductor('${item.id}')">Delete</button>
        </td>
      </tr>
    `;
  });

  if (filtered.length === 0) {
    conductorTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:20px;">
          No conductors found.
        </td>
      </tr>
    `;
  }
}

async function loadConductors() {
  const snapshot = await getDocs(collection(db, "users"));
  allConductors = snapshot.docs
    .filter((docItem) => docItem.data().role === "conductor")
    .map((docItem) => ({
      id: docItem.id,
      data: docItem.data()
    }));

  renderConductors();
}

window.editConductor = function (id) {
  const conductorObj = allConductors.find((item) => item.id === id);
  if (!conductorObj) return;

  const conductor = conductorObj.data;

  document.getElementById("conductorName").value = conductor.name || "";
  document.getElementById("conductorEmail").value = conductor.email || "";
  document.getElementById("conductorBus").value = conductor.bus || "";
  document.getElementById("conductorRoute").value = conductor.route || "";
  conductorDocId.value = id;

  saveConductorBtn.textContent = "Update Conductor";
  cancelConductorEditBtn.style.display = "inline-flex";

  conductorPassword.required = false;
  conductorPassword.style.display = "none";
  conductorPassword.previousElementSibling.style.display = "none";
  conductorEmail.readOnly = true;

  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.deleteConductor = async function (id) {
  const confirmDelete = confirm("Delete this conductor?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "users", id));
    loadConductors();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

conductorSearch?.addEventListener("input", renderConductors);
conductorFilter?.addEventListener("change", renderConductors);

loadConductors();