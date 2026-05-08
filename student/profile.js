import { db, auth } from "../js/firebase-config.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


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


function getPassStatus(student) {

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


onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "../login.html";

      return;
    }

    loadProfile(user.email);
  }
);


async function loadProfile(email) {

  try {

    const q =
      query(
        collection(db, "students"),
        where("email", "==", email)
      );

    const snapshot =
      await getDocs(q);

    if (snapshot.empty)
      return;

    const student =
      snapshot.docs[0].data();

    document.getElementById("profileName").textContent =
      student.name || "Student";

    document.getElementById("profileEmail").textContent =
      student.email || "—";

    document.getElementById("profileBus").textContent =
      student.bus || "—";

    document.getElementById("profileRoute").textContent =
      student.route || "—";

    document.getElementById("profilePassId").textContent =
      student.passId || "—";

    document.getElementById("profileFeeStatus").textContent =
      student.feeStatus || "Not Paid";

    document.getElementById("profileValidity").textContent =
      getPassStatus(student);

  }

  catch (error) {

    console.error(error);
  }
}