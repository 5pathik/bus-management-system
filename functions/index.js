const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

function makeTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 8; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return `Temp@${pass}`;
}

exports.approveRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token || context.auth.token.email !== "admin1@gmail.com") {
    throw new functions.https.HttpsError("permission-denied", "Admin only");
  }

  const requestId = data.requestId;
  if (!requestId) {
    throw new functions.https.HttpsError("invalid-argument", "requestId is required");
  }

  const requestRef = db.collection("requests").doc(requestId);
  const requestSnap = await requestRef.get();

  if (!requestSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Request not found");
  }

  const requestData = requestSnap.data();
  const tempPassword = makeTempPassword();

  const userRecord = await admin.auth().createUser({
    email: requestData.email,
    password: tempPassword,
    displayName: requestData.name
  });

  await db.collection("users").doc(userRecord.uid).set({
    uid: userRecord.uid,
    name: requestData.name,
    email: requestData.email,
    role: requestData.role || "student",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  if ((requestData.role || "student") === "student") {
    await db.collection("students").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name: requestData.name,
      email: requestData.email,
      phone: requestData.phone || "",
      route: requestData.route || "Not assigned",
      bus: requestData.bus || "Not assigned",
      passId: `PASS-${Date.now()}`,
      feeStatus: "Not Paid",
      passStatus: "Invalid",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  await requestRef.update({
    status: "approved",
    tempPassword,
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    authUid: userRecord.uid
  });

  return {
    success: true,
    tempPassword
  };
});