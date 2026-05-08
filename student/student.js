import { db, auth } from "../js/firebase-config.js";

import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const studentInfo =
  document.getElementById("studentInfo");

const passCard =
  document.getElementById("passCard");

const qrCodeDiv =
  document.getElementById("qrCode");

const notificationContainer =
  document.getElementById("notificationContainer");

const routeStopsList =
  document.getElementById("routeStopsList");

let currentRouteName = "";

let mapInstance = null;
let busMarker = null;
let routePolyline = null;


function parseDate(value) {

  if (!value)
    return null;

  if (value.toDate)
    return value.toDate();

  const d =
    new Date(value);

  return isNaN(d.getTime())
    ? null
    : d;
}


function formatPassDate(value) {

  const date =
    parseDate(value);

  return date
    ? date.toLocaleDateString()
    : "—";
}


function getCurrentPassStatus(student) {

  if (
    student.feeStatus !== "Paid"
  ) {
    return "Invalid";
  }

  const expiry =
    parseDate(student.validUntil);

  if (!expiry)
    return "Invalid";

  return new Date() <= expiry
    ? "Valid"
    : "Expired";
}


function getPassWarningHtml(status) {

  if (status === "Expired") {

    return `

      <div class="pass-warning status-expired">

        ⚠️ Your bus pass has expired.
        Please renew your transport fee.

      </div>
    `;
  }


  if (status === "Invalid") {

    return `

      <div class="pass-warning status-invalid">

        ⚠️ Your bus pass is not valid.
        Please contact the admin.

      </div>
    `;
  }


  return `

    <div class="pass-warning status-valid">

      ✅ Your bus pass is active and valid.

    </div>
  `;
}


onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "../login.html";

      return;
    }

    await loadStudentData(user.email);

    await loadNotifications();

    if (
      document.getElementById("map")
    ) {

      initBusMap();
    }
  }
);


async function loadStudentData(email) {

  try {

    const q =
      query(
        collection(db, "students"),
        where("email", "==", email)
      );

    const snapshot =
      await getDocs(q);


    if (snapshot.empty) {

      if (studentInfo) {

        studentInfo.innerHTML = `

          <div class="stat-card">

            No student profile found.

          </div>
        `;
      }

      if (passCard) {

        passCard.innerHTML =
          "<p>No pass found for this account.</p>";
      }

      return;
    }


    const student =
      snapshot.docs[0].data();

    currentRouteName =
      student.route || "";

    const passStatus =
      getCurrentPassStatus(student);


    if (studentInfo) {

      studentInfo.innerHTML = `

        <div class="stat-card">
          <h2>${student.bus || "Not assigned"}</h2>
          <p>Assigned Bus</p>
        </div>

        <div class="stat-card">
          <h2>${student.route || "Not assigned"}</h2>
          <p>Assigned Route</p>
        </div>

        <div class="stat-card">
          <h2>${student.passId || "N/A"}</h2>
          <p>Pass ID</p>
        </div>

        <div class="stat-card">
          <h2>${passStatus}</h2>
          <p>Pass Status</p>
        </div>

        <div class="stat-card">
          <h2>${student.feeStatus || "Not Paid"}</h2>
          <p>Fee Status</p>
        </div>
      `;
    }


    if (passCard) {

      const today =
        new Date();

      let statusClass =
        "status-invalid";

      let warningMessage =
        "Transport fee not paid.";

      if (
        student.feeStatus === "Paid" &&
        student.validUntil
      ) {

        const expiryDate =
          new Date(student.validUntil);

        if (today <= expiryDate) {

          statusClass =
            "status-valid";

          const daysLeft =
            Math.ceil(
              (expiryDate - today)
              / (1000 * 60 * 60 * 24)
            );

          warningMessage =
            `Pass valid for ${daysLeft} more day(s).`;
        }

        else {

          statusClass =
            "status-expired";

          warningMessage =
            "Your pass has expired. Please renew transport fee.";
        }
      }


      passCard.innerHTML = `

        ${getPassWarningHtml(passStatus)}

        <div class="pass-header">

          <div>

            <h2>
              Bus Pass
            </h2>

            <p>
              Educational Institute Transport System
            </p>

          </div>

          <div class="pass-status ${statusClass}">
            ${passStatus}
          </div>

        </div>


        <div class="pass-details">

          <div class="pass-row">
            <span>Name</span>
            <strong>${student.name || "—"}</strong>
          </div>

          <div class="pass-row">
            <span>Email</span>
            <strong>${student.email || "—"}</strong>
          </div>

          <div class="pass-row">
            <span>Route</span>
            <strong>${student.route || "—"}</strong>
          </div>

          <div class="pass-row">
            <span>Bus</span>
            <strong>${student.bus || "—"}</strong>
          </div>

          <div class="pass-row">
            <span>Pass ID</span>
            <strong>${student.passId || "—"}</strong>
          </div>

          <div class="pass-row">
            <span>Fee Status</span>
            <strong>${student.feeStatus || "Not Paid"}</strong>
          </div>

          <div class="pass-row">
            <span>Fee Paid Date</span>
            <strong>${student.feePaidDate || "—"}</strong>
          </div>

          <div class="pass-row">
            <span>Valid Until</span>
            <strong>${formatPassDate(student.validUntil)}</strong>
          </div>

        </div>


        <div class="pass-warning ${statusClass}">
          ${warningMessage}
        </div>

      `;


      if (qrCodeDiv) {

        qrCodeDiv.innerHTML = "";

        new QRCode(
          qrCodeDiv,
          {
            text: JSON.stringify({
              name: student.name,
              email: student.email,
              passId: student.passId,
              bus: student.bus,
              route: student.route
            }),

            width: 180,
            height: 180
          }
        );
      }
    }
  }

  catch (error) {

    console.error(error);
  }
}


async function loadNotifications() {

  if (!notificationContainer)
    return;

  const snapshot =
    await getDocs(collection(db, "notifications"));

  notificationContainer.innerHTML = "";

  snapshot.forEach((docItem) => {

    const notification =
      docItem.data();

    notificationContainer.innerHTML += `

      <div class="notification-card">

        <h3>
          ${notification.title}
        </h3>

        <p>
          ${notification.message}
        </p>

      </div>
    `;
  });
}


function initBusMap() {

  const mapDiv =
    document.getElementById("map");

  if (!mapDiv)
    return;

  mapInstance =
    L.map("map")
      .setView([28.9845, 79.411], 13);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        "© OpenStreetMap contributors"
    }
  ).addTo(mapInstance);


  busMarker =
    L.marker([28.9845, 79.411])
      .addTo(mapInstance)
      .bindPopup("Bus Location")
      .openPopup();


  if (currentRouteName) {
    loadRouteLine(currentRouteName);
  }


  onSnapshot(
    doc(db, "busLocations", "Bus-01"),
    async (docSnap) => {

      if (!docSnap.exists())
        return;

      const data =
        docSnap.data();

      const lat =
        data.latitude;

      const lng =
        data.longitude;

      busMarker.setLatLng([lat, lng]);

      mapInstance.setView([lat, lng], 15);

      const currentStopText =
        document.getElementById("currentStop");

      const etaText =
        document.getElementById("etaText");

      const lastUpdatedText =
        document.getElementById("lastUpdated");

      const arrivalAlert =
        document.getElementById("arrivalAlert");


      if (currentStopText) {

        currentStopText.textContent =
          `Current Stop: ${data.currentStop || "Unknown"}`;
      }


      if (etaText) {

        etaText.textContent =
          `ETA: ${data.etaMinutes || "Unknown"} min`;
      }


      if (lastUpdatedText) {

        lastUpdatedText.textContent =
          `Updated: ${new Date().toLocaleTimeString()}`;
      }


      const eta =
        parseInt(data.etaMinutes);


      if (
        arrivalAlert &&
        !isNaN(eta)
      ) {

        if (eta <= 5) {

          arrivalAlert.style.display =
            "block";

          arrivalAlert.textContent =
            `🚌 Bus arriving in ${eta} minutes!`;
        }

        else {

          arrivalAlert.style.display =
            "none";
        }
      }


      await loadRouteStops(
        data.currentStop || ""
      );

      if (
        currentRouteName &&
        !routePolyline
      ) {

        await loadRouteLine(currentRouteName);
      }
    }
  );
}


async function loadRouteLine(routeName) {

  if (
    !mapInstance ||
    routePolyline
  ) {
    return;
  }

  try {

    const q =
      query(
        collection(db, "routes"),
        where("routeName", "==", routeName)
      );

    const snapshot =
      await getDocs(q);

    if (snapshot.empty)
      return;

    const route =
      snapshot.docs[0].data();

    const routePath =
      route.routePath || [];

    if (
      !Array.isArray(routePath) ||
      routePath.length < 2
    ) {
      return;
    }

    const coords =
      routePath
        .map((point) => {

          if (
            Array.isArray(point) &&
            point.length >= 2
          ) {

            return [
              Number(point[0]),
              Number(point[1])
            ];
          }

          if (
            point &&
            typeof point === "object" &&
            point.lat != null &&
            point.lng != null
          ) {

            return [
              Number(point.lat),
              Number(point.lng)
            ];
          }

          return null;
        })

        .filter(Boolean);


    if (coords.length < 2)
      return;


    routePolyline =
      L.polyline(
        coords,
        {
          color: "#2563eb",
          weight: 5,
          opacity: 0.85,
          dashArray: "8 8"
        }
      ).addTo(mapInstance);

    mapInstance.fitBounds(
      routePolyline.getBounds(),
      {
        padding: [30, 30]
      }
    );
  }

  catch (error) {

    console.error(error);
  }
}


async function loadRouteStops(
  currentStop = ""
) {

  if (!routeStopsList)
    return;

  routeStopsList.innerHTML = "";

  try {

    const snapshot =
      await getDocs(collection(db, "routes"));

    snapshot.forEach((docItem) => {

      const route =
        docItem.data();

      const stops =
        (route.stops || "")
          .split(",");

      stops.forEach((stop) => {

        const cleanStop =
          stop.trim();

        if (!cleanStop)
          return;

        const li =
          document.createElement("li");

        li.textContent =
          cleanStop;

        if (
          currentStop &&
          cleanStop.toLowerCase()
            === currentStop.toLowerCase()
        ) {

          li.classList.add("active-stop");
        }

        routeStopsList.appendChild(li);
      });
    });
  }

  catch (error) {

    console.error(error);
  }
}


window.downloadPassPDF =
function () {

  const element =
    document.getElementById("passCard");

  if (!element) {

    alert("Pass not loaded.");

    return;
  }

  const options = {

    margin: 0.5,

    filename: "bus-pass.pdf",

    image: {
      type: "jpeg",
      quality: 1
    },

    html2canvas: {
      scale: 2
    },

    jsPDF: {
      unit: "in",
      format: "a4",
      orientation: "portrait"
    }
  };

  html2pdf()
    .set(options)
    .from(element)
    .save();
};