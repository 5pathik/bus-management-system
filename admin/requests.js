import { db } from "../js/firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";

const requestsList = document.getElementById("requestsList");
const functions = getFunctions();
const approveRequestFn = httpsCallable(functions, "approveRequest");

async function loadRequests() {
  const q = query(collection(db, "requests"), where("status", "==", "pending"));
  const snap = await getDocs(q);

  requestsList.innerHTML = "";

  if (snap.empty) {
    requestsList.innerHTML = `<div class="recent-item"><span>No pending requests.</span></div>`;
    return;
  }

  snap.forEach((d) => {
    const r = d.data();
    requestsList.innerHTML += `
      <div class="recent-item">
        <strong>${r.name}</strong>
        <span>${r.email} • ${r.phone}</span>
        <div style="margin-top:10px;">
          <button class="btn btn-primary" onclick="approve('${d.id}')">Approve</button>
        </div>
      </div>
    `;
  });
}

window.approve = async function (requestId) {
  try {
    const result = await approveRequestFn({ requestId });
    alert(`Approved. Temporary password: ${result.data.tempPassword}`);
    loadRequests();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

loadRequests();