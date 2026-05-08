import { db } from "../js/firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const busForm =
  document.getElementById("busForm");

const busTableBody =
  document.getElementById("busTableBody");

const busSearch =
  document.getElementById("busSearch");

const busFilter =
  document.getElementById("busFilter");

const busDocId =
  document.getElementById("busDocId");

const saveBusBtn =
  document.getElementById("saveBusBtn");

const cancelBusEditBtn =
  document.getElementById("cancelBusEditBtn");

let allBuses = [];


function clearBusForm() {

  busForm.reset();

  busDocId.value = "";

  saveBusBtn.textContent =
    "Add Bus";

  cancelBusEditBtn.style.display =
    "none";
}


busForm?.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    const busData = {

      busNumber:
        document.getElementById("busNumber").value.trim(),

      busName:
        document.getElementById("busName").value.trim(),

      busRoute:
        document.getElementById("busRoute").value.trim(),

      busConductor:
        document.getElementById("busConductor").value.trim(),

      busCapacity:
        document.getElementById("busCapacity").value.trim(),

      busStatus:
        document.getElementById("busStatus").value
    };

    try {

      const existingId =
        busDocId.value.trim();

      if (existingId) {

        await updateDoc(
          doc(db, "buses", existingId),
          {
            ...busData,
            updatedAt: new Date()
          }
        );

        alert("Bus updated successfully!");
      }

      else {

        await addDoc(
          collection(db, "buses"),
          {
            ...busData,
            createdAt: new Date()
          }
        );

        alert("Bus added successfully!");
      }

      clearBusForm();

      loadBuses();
    }

    catch (error) {

      console.error(error);

      alert(error.message);
    }
  }
);


cancelBusEditBtn?.addEventListener(
  "click",
  () => {

    clearBusForm();
  }
);


function renderBuses() {

  if (!busTableBody) return;

  const searchValue =
    (busSearch?.value || "")
      .toLowerCase()
      .trim();

  const filterValue =
    busFilter?.value || "all";

  const filtered =
    allBuses.filter((item) => {

      const bus =
        item.data;

      const matchesSearch =

        (bus.busNumber || "")
          .toLowerCase()
          .includes(searchValue)

        ||

        (bus.busName || "")
          .toLowerCase()
          .includes(searchValue)

        ||

        (bus.busRoute || "")
          .toLowerCase()
          .includes(searchValue)

        ||

        (bus.busConductor || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesFilter =

        filterValue === "all"

        ||

        (bus.busStatus || "")
          === filterValue;

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  busTableBody.innerHTML = "";

  filtered.forEach((item) => {

    const bus =
      item.data;

    busTableBody.innerHTML += `

      <tr>

        <td>
          ${bus.busNumber || ""}
        </td>

        <td>
          ${bus.busName || ""}
        </td>

        <td>
          ${bus.busRoute || ""}
        </td>

        <td>
          ${bus.busConductor || ""}
        </td>

        <td>
          ${bus.busCapacity || ""}
        </td>

        <td>
          ${bus.busStatus || ""}
        </td>

        <td>

          <button
            class="btn btn-primary"
            onclick="editBus('${item.id}')"
          >
            Edit
          </button>

          <button
            class="delete-btn"
            onclick="deleteBus('${item.id}')"
          >
            Delete
          </button>

        </td>

      </tr>
    `;
  });


  if (filtered.length === 0) {

    busTableBody.innerHTML = `

      <tr>

        <td colspan="7"
          style="text-align:center; padding:20px;"
        >

          No buses found.

        </td>

      </tr>
    `;
  }
}


async function loadBuses() {

  const snapshot =
    await getDocs(collection(db, "buses"));

  allBuses =
    snapshot.docs.map((docItem) => ({
      id: docItem.id,
      data: docItem.data()
    }));

  renderBuses();
}


window.editBus =
function (id) {

  const busObj =
    allBuses.find(
      (item) => item.id === id
    );

  if (!busObj) return;

  const bus =
    busObj.data;

  document.getElementById("busNumber").value =
    bus.busNumber || "";

  document.getElementById("busName").value =
    bus.busName || "";

  document.getElementById("busRoute").value =
    bus.busRoute || "";

  document.getElementById("busConductor").value =
    bus.busConductor || "";

  document.getElementById("busCapacity").value =
    bus.busCapacity || "";

  document.getElementById("busStatus").value =
    bus.busStatus || "Active";

  busDocId.value =
    id;

  saveBusBtn.textContent =
    "Update Bus";

  cancelBusEditBtn.style.display =
    "inline-flex";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};


window.deleteBus =
async function (id) {

  const confirmDelete =
    confirm("Delete this bus?");

  if (!confirmDelete)
    return;

  try {

    await deleteDoc(
      doc(db, "buses", id)
    );

    loadBuses();
  }

  catch (error) {

    console.error(error);

    alert(error.message);
  }
};


busSearch?.addEventListener(
  "input",
  renderBuses
);

busFilter?.addEventListener(
  "change",
  renderBuses
);


loadBuses();