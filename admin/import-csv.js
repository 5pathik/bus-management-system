import { db } from "../js/firebase-config.js";
import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const uploadBtn = document.getElementById("uploadBtn");
const csvFile = document.getElementById("csvFile");
const targetCollection = document.getElementById("targetCollection");
const uploadMsg = document.getElementById("uploadMsg");

uploadBtn.addEventListener("click", () => {
  const file = csvFile.files[0];
  if (!file) {
    uploadMsg.textContent = "Choose a CSV file first.";
    return;
  }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      try {
        const rows = results.data;

        for (const row of rows) {
          await addDoc(collection(db, targetCollection.value), {
            ...row,
            createdAt: new Date()
          });
        }

        uploadMsg.textContent = `Imported ${rows.length} rows into ${targetCollection.value}.`;
      } catch (error) {
        console.error(error);
        uploadMsg.textContent = error.message;
      }
    }
  });
});