import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


window.registerUser = async function (event) {
  event.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const robotCheck = document.getElementById("robotCheck");

  if (!robotCheck || !robotCheck.checked) {
    alert("Please confirm that you are not a robot.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), {
      uid,
      name: fullName,
      email,
      role: "student",
      createdAt: new Date()
    });

    await setDoc(doc(db, "students", uid), {
      uid,
      name: fullName,
      email,
      route: "Not assigned",
      bus: "Not assigned",
      passId: "PASS-" + Date.now(),
      createdAt: new Date()
    });

    alert("Student registered successfully!");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Register error:", error);
    alert(error.message);
  }
};


window.loginUser = async function (event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);

    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("No user profile found in Firestore.");
      return;
    }

    const userData = snapshot.docs[0].data();

    if (userData.role === "admin") {
      window.location.href = "admin/admin-dashboard.html";
    } else if (userData.role === "conductor") {
      window.location.href = "conductor/conductor-dashboard.html";
    } else {
      window.location.href = "student/student-dashboard.html";
    }
  } catch (error) {
    console.error("Login error:", error);
    alert(error.message);
  }
};


window.logoutUser = async function () {
  try {
    await signOut(auth);
    window.location.href = "../login.html";
  } catch (error) {
    console.error("Logout error:", error);
    alert(error.message);
  }
};

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });
}