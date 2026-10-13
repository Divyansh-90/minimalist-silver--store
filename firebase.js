
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAqvJYP76NX3I9QF0NHQpn_r6kH2vnC-co",
    authDomain: "minimalist-silver-store.firebaseapp.com",
    projectId: "minimalist-silver-store",
    storageBucket: "minimalist-silver-store.firebasestorage.app",
    messagingSenderId: "928778470405",
    appId: "1:928778470405:web:203e404c9b38758b99486c",
    measurementId: "G-3K8CFCY1CJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
