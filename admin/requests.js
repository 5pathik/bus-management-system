import { db } from "../js/firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";

const requestsList = document.getElementById("requestsList");
const requestCount = document.getElementById("requestCount");

const functions = getFunctions();
const approveRequestFn = httpsCallable(functions, "approveRequest");

async function loadRequests() {
  try {
    const q = query(collection(db, "requests"), where("status", "==", "pending"));
    const snap = await getDocs(q);

    if (requestCount) {
      requestCount.textContent = `${snap.size} Requests`;
    }

    if (!requestsList) return;

    requestsList.innerHTML = "";

    if (snap.empty) {
      requestsList.innerHTML = `
        <div class="request-empty">
          <h3>No pending requests</h3>
          <p>New student registration requests will appear here.</p>
        </div>
      `;
      return;
    }

    snap.forEach((docItem) => {
      const r = docItem.data();

      requestsList.innerHTML += `
        <div class="request-card">
          <div class="request-card-top">
            <div>
              <h3>${r.name || "Unnamed"}</h3>
              <p>${r.email || "No email"} • ${r.phone || "No phone"}</p>
            </div>
            <span class="request-status pending">Pending</span>
          </div>

          <div class="request-details">
            <div><strong>Role:</strong> ${r.role || "student"}</div>
            <div><strong>Route:</strong> ${r.route || "—"}</div>
            <div><strong>Bus:</strong> ${r.bus || "—"}</div>
            <div><strong>Submitted:</strong> ${formatDate(r.createdAt)}</div>
          </div>

          <div class="request-actions">
            <button class="btn btn-primary" onclick="approveRequest('${docItem.id}')">
              Approve
            </button>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error(error);
    if (requestsList) {
      requestsList.innerHTML = `
        <div class="request-empty">
          <h3>Could not load requests</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  }
}

function formatDate(value) {
  if (!value) return "—";
  if (value.toDate) return value.toDate().toLocaleString();
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

window.approveRequest = async function (requestId) {
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