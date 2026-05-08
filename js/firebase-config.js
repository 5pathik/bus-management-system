// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Firebase Config
const firebaseConfig = {

  apiKey: "AIzaSyDTcSyNAVXbQxU411bowbAJx0XRhczaRd8",

  authDomain: "bus-management-system-afa05.firebaseapp.com",

  projectId: "bus-management-system-afa05",

  storageBucket: "bus-management-system-afa05.firebasestorage.app",

  messagingSenderId: "975498384208",

  appId: "1:975498384208:web:e97cd9e6ae3ffb26529255"

};



const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };