import { db } from "../js/firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const passesTableBody = document.getElementById("passesTableBody");
const passSearch = document.getElementById("passSearch");
const passFilter = document.getElementById("passFilter");

let allStudents = [];

function parseDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function addSixMonths(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  date.setMonth(date.getMonth() + 6);
  return date;
}

function formatDate(value) {
  const date = parseDate(value);
  return date ? date.toLocaleDateString() : "—";
}

function getCurrentPassStatus(student) {
  if (student.feeStatus !== "Paid") return "Invalid";
  const expiry = parseDate(student.validUntil);
  if (!expiry) return "Invalid";
  return new Date() <= expiry ? "Valid" : "Expired";
}

function renderPasses() {
  if (!passesTableBody) return;

  const searchValue = (passSearch?.value || "").toLowerCase().trim();
  const filterValue = passFilter?.value || "all";

  const filtered = allStudents.filter((item) => {
    const student = item.data;
    const status = getCurrentPassStatus(student);

    const matchesSearch =
      (student.name || "").toLowerCase().includes(searchValue) ||
      (student.email || "").toLowerCase().includes(searchValue) ||
      (student.route || "").toLowerCase().includes(searchValue) ||
      (student.bus || "").toLowerCase().includes(searchValue) ||
      (student.passId || "").toLowerCase().includes(searchValue);

    const matchesFilter =
      filterValue === "all" || status === filterValue;

    return matchesSearch && matchesFilter;
  });

  passesTableBody.innerHTML = "";

  filtered.forEach((item) => {
    const student = item.data;
    const id = item.id;
    const currentStatus = getCurrentPassStatus(student);

    passesTableBody.innerHTML += `
      <tr>
        <td>${student.name || ""}</td>
        <td>${student.email || ""}</td>
        <td>${student.route || ""}</td>
        <td>${student.bus || ""}</td>
        <td>
          <select id="feeStatus-${id}">
            <option value="Not Paid" ${student.feeStatus === "Not Paid" ? "selected" : ""}>Not Paid</option>
            <option value="Paid" ${student.feeStatus === "Paid" ? "selected" : ""}>Paid</option>
          </select>
        </td>
        <td>
          <input
            type="date"
            id="feePaidDate-${id}"
            value="${student.feePaidDate || ""}"
          >
        </td>
        <td>${formatDate(student.validUntil)}</td>
        <td><strong>${currentStatus}</strong></td>
        <td>
          <button class="btn btn-primary" onclick="savePassStatus('${id}')">Save</button>
        </td>
      </tr>
    `;
  });

  if (filtered.length === 0) {
    passesTableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center; padding:20px;">
          No passes found.
        </td>
      </tr>
    `;
  }
}

async function loadPasses() {
  const snapshot = await getDocs(collection(db, "students"));
  allStudents = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    data: docItem.data()
  }));
  renderPasses();
}

window.savePassStatus = async function (studentId) {
  try {
    const feeStatus = document.getElementById(`feeStatus-${studentId}`).value;
    const feePaidDate = document.getElementById(`feePaidDate-${studentId}`).value;

    let validUntil = "";

    if (feeStatus === "Paid" && feePaidDate) {
      const expiryDate = addSixMonths(feePaidDate);
      validUntil = expiryDate ? expiryDate.toISOString() : "";
    }

    await updateDoc(doc(db, "students", studentId), {
      feeStatus,
      feePaidDate: feeStatus === "Paid" ? feePaidDate : "",
      validUntil: feeStatus === "Paid" ? validUntil : "",
      passStatus: feeStatus === "Paid" && validUntil ? "Valid" : "Invalid",
      updatedAt: new Date()
    });

    alert("Pass updated successfully!");
    loadPasses();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

passSearch?.addEventListener("input", renderPasses);
passFilter?.addEventListener("change", renderPasses);

loadPasses();