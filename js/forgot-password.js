import { auth } from "./firebase-config.js";
import {
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const resetForm = document.getElementById("resetForm");
const resetEmail = document.getElementById("resetEmail");
const resetMsg = document.getElementById("resetMsg");

resetForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = resetEmail.value.trim();

  if (!email) {
    resetMsg.textContent = "Please enter your email.";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    resetMsg.textContent = "Reset link sent. Check your email.";
    resetMsg.style.color = "green";
    resetForm.reset();
  } catch (error) {
    console.error(error);
    resetMsg.textContent = error.message;
    resetMsg.style.color = "red";
  }
});