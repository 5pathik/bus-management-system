import { db, auth } from "../js/firebase-config.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const studentNotificationsList =
  document.getElementById("studentNotificationsList");

const notificationBadge =
  document.getElementById("notificationBadge");


onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "../login.html";
    return;
  }

  loadNotifications(user.email);
});


async function loadNotifications(email) {

  const studentQuery =
    query(
      collection(db, "students"),
      where("email", "==", email)
    );

  const studentSnapshot =
    await getDocs(studentQuery);

  if (studentSnapshot.empty) return;

  const student =
    studentSnapshot.docs[0].data();

  const route =
    student.route || "";

  const bus =
    student.bus || "";

  const notificationQuery =
    query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );

  const notificationSnapshot =
    await getDocs(notificationQuery);

  studentNotificationsList.innerHTML = "";

  let count = 0;

  notificationSnapshot.forEach((docItem) => {

    const notification =
      docItem.data();

    let show =
      false;

    if (
      notification.type === "all"
    ) {
      show = true;
    }

    else if (
      notification.type === "route" &&
      notification.target === route
    ) {
      show = true;
    }

    else if (
      notification.type === "bus" &&
      notification.target === bus
    ) {
      show = true;
    }

    if (show) {

      count++;

      studentNotificationsList.innerHTML += `

        <div class="notification-student-card">

          <div class="notification-header">

            <h3>
              ${notification.title}
            </h3>

            <span>
              ${notification.type}
            </span>

          </div>

          <p>
            ${notification.message}
          </p>

        </div>
      `;
    }
  });

  notificationBadge.textContent = count;
}