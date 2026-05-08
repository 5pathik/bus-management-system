import { db } from "../js/firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const notificationForm =
  document.getElementById("notificationForm");

const adminNotificationsList =
  document.getElementById("adminNotificationsList");

const notificationType =
  document.getElementById("notificationType");

const targetValue =
  document.getElementById("targetValue");


notificationType?.addEventListener("change", () => {

  if (
    notificationType.value === "all"
  ) {
    targetValue.style.display = "none";
  }

  else {
    targetValue.style.display = "block";
  }
});


notificationForm?.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    try {

      const title =
        document.getElementById("notificationTitle").value.trim();

      const message =
        document.getElementById("notificationMessage").value.trim();

      const type =
        notificationType.value;

      const target =
        targetValue.value.trim();

      await addDoc(
        collection(db, "notifications"),
        {
          title,
          message,
          type,
          target,
          createdAt: new Date()
        }
      );

      alert("Notification sent!");

      notificationForm.reset();

      targetValue.style.display = "none";

      loadNotifications();

    }

    catch (error) {

      console.error(error);

      alert(error.message);
    }
  }
);


async function loadNotifications() {

  if (!adminNotificationsList) return;

  adminNotificationsList.innerHTML = "";

  const q =
    query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );

  const snapshot =
    await getDocs(q);

  snapshot.forEach((docItem) => {

    const notification =
      docItem.data();

    adminNotificationsList.innerHTML += `

      <div class="notification-admin-card">

        <div class="notification-top">

          <h3>
            ${notification.title}
          </h3>

          <span class="notification-type">
            ${notification.type}
          </span>

        </div>

        <p>
          ${notification.message}
        </p>

        <small>
          ${
            notification.target
              ? "Target: " + notification.target
              : "All Students"
          }
        </small>

      </div>
    `;
  });
}


targetValue.style.display = "none";

loadNotifications();