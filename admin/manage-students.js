import { db } from "../js/firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const studentForm = document.getElementById("studentForm");
const studentTableBody = document.getElementById("studentTableBody");
const studentSearch = document.getElementById("studentSearch");
const statusFilter = document.getElementById("statusFilter");
const saveStudentBtn = document.getElementById("saveStudentBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const studentDocId = document.getElementById("studentDocId");

let allStudents = [];

function parseDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function getCurrentPassStatus(student) {
  if (student.feeStatus !== "Paid") return "Invalid";
  const expiry = parseDate(student.validUntil);
  if (!expiry) return "Invalid";
  return new Date() <= expiry ? "Valid" : "Expired";
}

function clearForm() {
  studentForm.reset();
  studentDocId.value = "";
  saveStudentBtn.textContent = "Add Student";
  cancelEditBtn.style.display = "none";
}

studentForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById("studentName").value.trim(),
    email: document.getElementById("studentEmail").value.trim(),
    route: document.getElementById("studentRoute").value.trim(),
    bus: document.getElementById("studentBus").value.trim()
  };

  try {
    const existingId = studentDocId.value.trim();

    if (existingId) {
      await updateDoc(doc(db, "students", existingId), {
        ...payload,
        updatedAt: new Date()
      });
      alert("Student updated successfully!");
    } else {
      await addDoc(collection(db, "students"), {
        ...payload,
        passId: "PASS-" + Date.now(),
        feeStatus: "Not Paid",
        feePaidDate: "",
        validUntil: "",
        passStatus: "Invalid",
        createdAt: new Date()
      });
      alert("Student added successfully!");
    }

    clearForm();
    loadStudents();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

cancelEditBtn?.addEventListener("click", () => {
  clearForm();
});

function renderStudents() {
  if (!studentTableBody) return;

  const searchValue = (studentSearch?.value || "").toLowerCase().trim();
  const filterValue = statusFilter?.value || "all";

  const filtered = allStudents.filter((studentItem) => {
    const student = studentItem.data;
    const passStatus = getCurrentPassStatus(student);

    const matchesSearch =
      (student.name || "").toLowerCase().includes(searchValue) ||
      (student.email || "").toLowerCase().includes(searchValue) ||
      (student.route || "").toLowerCase().includes(searchValue) ||
      (student.bus || "").toLowerCase().includes(searchValue);

    const matchesStatus =
      filterValue === "all" || passStatus === filterValue;

    return matchesSearch && matchesStatus;
  });

  studentTableBody.innerHTML = "";

  filtered.forEach((studentItem) => {
    const student = studentItem.data;
    const id = studentItem.id;
    const passStatus = getCurrentPassStatus(student);

    studentTableBody.innerHTML += `
      <tr>
        <td>${student.name || ""}</td>
        <td>${student.email || ""}</td>
        <td>${student.route || ""}</td>
        <td>${student.bus || ""}</td>
        <td>${student.feeStatus || "Not Paid"}</td>
        <td><strong>${passStatus}</strong></td>
        <td>
          <button class="btn btn-primary" onclick="editStudent('${id}')">Edit</button>
          <button class="delete-btn" onclick="deleteStudent('${id}')">Delete</button>
        </td>
      </tr>
    `;
  });

  if (filtered.length === 0) {
    studentTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:20px;">
          No students found.
        </td>
      </tr>
    `;
  }
}

async function loadStudents() {
  const snapshot = await getDocs(collection(db, "students"));
  allStudents = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    data: docItem.data()
  }));
  renderStudents();
}

window.editStudent = async function (id) {
  const studentObj = allStudents.find((item) => item.id === id);
  if (!studentObj) return;

  const student = studentObj.data;

  document.getElementById("studentName").value = student.name || "";
  document.getElementById("studentEmail").value = student.email || "";
  document.getElementById("studentRoute").value = student.route || "";
  document.getElementById("studentBus").value = student.bus || "";
  studentDocId.value = id;

  saveStudentBtn.textContent = "Update Student";
  cancelEditBtn.style.display = "inline-flex";

  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.deleteStudent = async function (id) {
  const confirmDelete = confirm("Delete this student?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "students", id));
    loadStudents();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

studentSearch?.addEventListener("input", renderStudents);
statusFilter?.addEventListener("change", renderStudents);

loadStudents();