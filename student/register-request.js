import { db } from "../js/firebase-config.js";
import {
  addDoc,
  collection
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("requestForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    await addDoc(collection(db, "requests"), {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      role: "student",
      status: "pending",
      createdAt: new Date()
    });

    msg.textContent = "Request submitted. Admin will approve it.";
    form.reset();
  } catch (error) {
    console.error(error);
    msg.textContent = error.message;
  }
});