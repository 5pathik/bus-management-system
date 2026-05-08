import { db, auth } from "../js/firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const verifyResult = document.getElementById("verifyResult");
const passIdInput = document.getElementById("passIdInput");
const attendanceTableBody = document.getElementById("attendanceTableBody");
const trackingStatus = document.getElementById("trackingStatus");
const startTrackingBtn = document.getElementById("startTrackingBtn");
const stopTrackingBtn = document.getElementById("stopTrackingBtn");
const currentStopInput = document.getElementById("currentStopInput");
const etaInput = document.getElementById("etaInput");
const assignedBusEl = document.getElementById("assignedBus");
const assignedRouteEl = document.getElementById("assignedRoute");
const attendanceCountEl = document.getElementById("attendanceCount");

let html5QrScanner = null;
let watchId = null;
let mapInstance = null;
let liveMarker = null;

let conductorProfile = null;
let conductorBusId = "Bus-01";

function parseDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
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

function getPassStatusBadge(status) {
  if (status === "Valid") return "valid";
  if (status === "Expired") return "invalid";
  return "invalid";
}

function setDashboardProfile(profile) {
  if (!profile) return;

  conductorProfile = profile;
  conductorBusId = profile.bus || "Bus-01";

  if (assignedBusEl) {
    assignedBusEl.textContent = profile.bus || "Bus-01";
  }

  if (assignedRouteEl) {
    assignedRouteEl.textContent = profile.route || "Route";
  }
}

async function loadConductorProfile(email) {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    window.location.href = "../login.html";
    return null;
  }

  const profileDoc = snapshot.docs.find((d) => d.data().role === "conductor");

  if (!profileDoc) {
    window.location.href = "../login.html";
    return null;
  }

  const profile = profileDoc.data();
  setDashboardProfile(profile);
  return profile;
}

async function loadAttendanceCount() {
  if (!attendanceCountEl) return;

  const todayStr = new Date().toLocaleDateString();
  const q = query(collection(db, "attendance"), where("date", "==", todayStr));
  const snapshot = await getDocs(q);
  attendanceCountEl.textContent = String(snapshot.size);
}

async function verifyPassById(passId) {
  if (!passId || !verifyResult) return;

  const q = query(collection(db, "students"), where("passId", "==", passId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    verifyResult.innerHTML = `
      <div class="invalid">
        <h3>Invalid Pass</h3>
        <p>No student found for this Pass ID.</p>
      </div>
    `;
    return;
  }

  const student = snapshot.docs[0].data();
  const passStatus = getCurrentPassStatus(student);
  const badgeClass = getPassStatusBadge(passStatus);

  verifyResult.innerHTML = `
    <div class="${badgeClass}">
      <h3>${passStatus === "Valid" ? "Valid Pass" : "Pass Not Valid"}</h3>
      <p><strong>Name:</strong> ${student.name || ""}</p>
      <p><strong>Email:</strong> ${student.email || ""}</p>
      <p><strong>Bus:</strong> ${student.bus || ""}</p>
      <p><strong>Route:</strong> ${student.route || ""}</p>
      <p><strong>Fee Status:</strong> ${student.feeStatus || "Not Paid"}</p>
      <p><strong>Fee Paid Date:</strong> ${student.feePaidDate || "—"}</p>
      <p><strong>Valid Until:</strong> ${formatDate(student.validUntil)}</p>
      <p><strong>Status:</strong> ${passStatus}</p>
    </div>
  `;
}

window.verifyPass = async function () {
  if (!passIdInput) return;
  await verifyPassById(passIdInput.value.trim());
};

function startScanner() {
  const reader = document.getElementById("reader");
  if (!reader || typeof Html5QrcodeScanner === "undefined") return;

  html5QrScanner = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: { width: 250, height: 250 } },
    false
  );

  html5QrScanner.render(
    async (decodedText) => {
      let passId = decodedText;

      try {
        const parsed = JSON.parse(decodedText);
        if (parsed.passId) passId = parsed.passId;
      } catch {}

      if (passIdInput) passIdInput.value = passId;
      await verifyPassById(passId);
    },
    (errorMessage) => {
      console.log(errorMessage);
    }
  );
}

async function loadStudents() {
  if (!attendanceTableBody) return;

  attendanceTableBody.innerHTML = "";
  const snapshot = await getDocs(collection(db, "students"));

  snapshot.forEach((docItem) => {
    const student = docItem.data();
    attendanceTableBody.innerHTML += `
      <tr>
        <td>${student.name || ""}</td>
        <td>${student.bus || ""}</td>
        <td>${student.route || ""}</td>
        <td>
          <button class="present-btn" onclick="markAttendance('${(student.name || "").replace(/'/g, "\\'")}', '${(student.bus || "").replace(/'/g, "\\'")}', '${(student.route || "").replace(/'/g, "\\'")}')">
            Present
          </button>
        </td>
      </tr>
    `;
  });
}

window.markAttendance = async function (name, bus, route) {
  const todayStr = new Date().toLocaleDateString();
  const timeStr = new Date().toLocaleTimeString();

  await addDoc(collection(db, "attendance"), {
    name,
    bus,
    route,
    status: "Present",
    date: todayStr,
    time: timeStr
  });

  alert(`${name} marked present`);
  await loadAttendanceCount();
};

function initConductorMap() {
  const mapDiv = document.getElementById("map");
  if (!mapDiv || typeof L === "undefined") return;

  if (!mapInstance) {
    mapInstance = L.map("map").setView([28.9845, 79.411], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(mapInstance);

    liveMarker = L.marker([28.9845, 79.411]).addTo(mapInstance).bindPopup("Bus Location");
  }

  onSnapshot(doc(db, "busLocations", conductorBusId), (docSnap) => {
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    const lat = data.latitude;
    const lng = data.longitude;

    if (!liveMarker) {
      liveMarker = L.marker([lat, lng]).addTo(mapInstance);
    }

    liveMarker.setLatLng([lat, lng]);
    mapInstance.setView([lat, lng], 15);
    liveMarker.bindPopup(`Bus Location<br>${data.currentStop || ""}`).openPopup();
  });
}

async function startSharingLocation() {
  if (!navigator.geolocation) {
    if (trackingStatus) trackingStatus.textContent = "Geolocation not supported.";
    return;
  }

  if (watchId !== null) {
    if (trackingStatus) trackingStatus.textContent = "Tracking is already running.";
    return;
  }

  if (trackingStatus) trackingStatus.textContent = "Requesting location permission...";

  const busDocId = conductorBusId || "Bus-01";
  initConductorMap();

  watchId = navigator.geolocation.watchPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const currentStop = currentStopInput ? currentStopInput.value.trim() : "";
      const etaMinutes = etaInput ? etaInput.value.trim() : "";
      const conductorEmail = auth.currentUser?.email || "unknown";

      try {
        await setDoc(doc(db, "busLocations", busDocId), {
          latitude,
          longitude,
          conductorEmail,
          busId: busDocId,
          currentStop: currentStop || "Unknown",
          etaMinutes: etaMinutes || "Unknown",
          updatedAt: new Date()
        });

        if (trackingStatus) trackingStatus.textContent = "Live tracking active.";
      } catch (error) {
        console.error(error);
        if (trackingStatus) trackingStatus.textContent = "Failed to update location.";
      }
    },
    (error) => {
      console.error("Geolocation error:", error);

      if (trackingStatus) {
        if (error.code === 1) {
          trackingStatus.textContent = "Location permission denied in browser settings.";
        } else if (error.code === 2) {
          trackingStatus.textContent = "Location unavailable.";
        } else if (error.code === 3) {
          trackingStatus.textContent = "Location request timed out.";
        } else {
          trackingStatus.textContent = "Unknown location error.";
        }
      }
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    }
  );
}

async function stopSharingLocation() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;

    try {
      await deleteDoc(doc(db, "busLocations", conductorBusId || "Bus-01"));
      if (trackingStatus) trackingStatus.textContent = "Location sharing stopped.";
    } catch (error) {
      console.error(error);
    }
  }
}

window.startSharingLocation = startSharingLocation;
window.stopSharingLocation = stopSharingLocation;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../login.html";
    return;
  }

  const profile = await loadConductorProfile(user.email);

  if (!profile) return;

  await loadAttendanceCount();
  await loadStudents();

  if (document.getElementById("map")) {
    initConductorMap();
  }
});

startScanner();