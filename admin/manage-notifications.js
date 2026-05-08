import { db }
from "../js/firebase-config.js";

import {

  collection,
  addDoc

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const notificationForm =
  document.getElementById("notificationForm");


notificationForm.addEventListener(
  "submit",
  async function (e) {

    e.preventDefault();

    const title =
      document.getElementById("notificationTitle").value;

    const message =
      document.getElementById("notificationMessage").value;

    try {

      await addDoc(
        collection(db, "notifications"),
        {

          title,
          message,

          createdAt:
            new Date()
        }
      );

      alert("Notification Sent!");

      notificationForm.reset();
    }

    catch (error) {

      alert(error.message);
    }
  }
);