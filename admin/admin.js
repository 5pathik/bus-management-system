import { db } from "../js/firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const totalStudents =
  document.getElementById("totalStudents");

const totalConductors =
  document.getElementById("totalConductors");

const totalBuses =
  document.getElementById("totalBuses");

const activePasses =
  document.getElementById("activePasses");


async function loadDashboardStats() {

  try {

    console.log("Loading dashboard...");


    // STUDENTS
    const studentsSnap =
      await getDocs(
        collection(db, "students")
      );

    totalStudents.textContent =
      studentsSnap.size;


    // USERS
    const usersSnap =
      await getDocs(
        collection(db, "users")
      );


    let conductorCount = 0;

    usersSnap.forEach((docItem) => {

      const user =
        docItem.data();

      if (
        user.role &&
        user.role.toLowerCase() ===
        "conductor"
      ) {

        conductorCount++;
      }
    });

    totalConductors.textContent =
      conductorCount;


    // BUSES
    try {

      const busesSnap =
        await getDocs(
          collection(db, "buses")
        );

      totalBuses.textContent =
        busesSnap.size;

    }

    catch {

      totalBuses.textContent = 0;
    }


    // PASSES
    let validPassCount = 0;

    studentsSnap.forEach((docItem) => {

      const student =
        docItem.data();

      if (
        student.passStatus === "Valid"
      ) {

        validPassCount++;
      }
    });

    activePasses.textContent =
      validPassCount;


    console.log("Dashboard loaded.");

  }

  catch (error) {

    console.error(
      "Dashboard error:",
      error
    );
  }
}


loadDashboardStats();