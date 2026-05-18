import { db, auth } from "./firebase-config.js";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const loginMsg = document.getElementById("loginMsg");

/* -----------------------------
   LOGIN
----------------------------- */
window.loginUser = async function (event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    if (loginMsg) loginMsg.textContent = "Please enter email and password.";
    return;
  }

  try {
    if (loginMsg) loginMsg.textContent = "Logging in...";

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    const userQuery = query(
      collection(db, "users"),
      where("email", "==", user.email)
    );

    const userSnap = await getDocs(userQuery);

    if (userSnap.empty) {
      if (loginMsg) loginMsg.textContent = "No role found for this account.";
      await auth.signOut();
      return;
    }

    const userData = userSnap.docs[0].data();
    const role = (userData.role || "").toLowerCase();

    if (role === "admin") {
      window.location.href = "admin/admin-dashboard.html";
    } else if (role === "conductor") {
      window.location.href = "conductor/conductor-dashboard.html";
    } else if (role === "student") {
      window.location.href = "student/student-dashboard.html";
    } else {
      if (loginMsg) loginMsg.textContent = "Unknown role in user profile.";
      await auth.signOut();
    }
  } catch (error) {
    console.error("Login error:", error);

    if (loginMsg) {
      if (error.code === "auth/invalid-credential") {
        loginMsg.textContent = "Wrong email or password.";
      } else if (error.code === "auth/user-not-found") {
        loginMsg.textContent = "User not found.";
      } else if (error.code === "auth/wrong-password") {
        loginMsg.textContent = "Wrong password.";
      } else {
        loginMsg.textContent = error.message;
      }
    }
  }
};

/* -----------------------------
   REGISTER REQUEST
   Student submits request only
----------------------------- */
window.registerUser = async function (event) {
  event.preventDefault();

  const name = document.getElementById("fullName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const robotCheck = document.getElementById("robotCheck")?.checked;

  if (!name || !email || !password) {
    alert("Please fill all fields.");
    return;
  }

  if (!robotCheck) {
    alert("Please confirm you are not a robot.");
    return;
  }

  try {
    await addDoc(collection(db, "requests"), {
      name,
      email,
      password,
      role: "student",
      status: "pending",
      createdAt: new Date()
    });

    alert("Registration request submitted successfully. Wait for admin approval.");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Register error:", error);
    alert(error.message);
  }
};

/* -----------------------------
   FORGOT PASSWORD
----------------------------- */
window.sendResetLink = async function () {
  const emailInput = document.getElementById("resetEmail");
  const email = emailInput?.value.trim();

  if (!email) {
    alert("Enter your email first.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent to your email.");
  } catch (error) {
    console.error("Reset error:", error);
    alert(error.message);
  }
};