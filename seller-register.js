
import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const form = document.getElementById("seller-register-form");
const message = document.getElementById("register-message");
const button = document.getElementById("register-button");

function showMessage(text, success = false) {
    message.textContent = text;
    message.style.color = success ? "#287342" : "#a13b3b";
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("seller-name").value.trim();
    const email = document.getElementById("seller-email").value.trim();
    const password = document.getElementById("seller-password").value;

    if (!name || !email || password.length < 6) {
        showMessage("Enter your name, a valid email and a password of at least 6 characters.");
        return;
    }

    button.disabled = true;
    showMessage("Creating your account...", true);

    let accountCreated = false;

    try {
        const credential = await createUserWithEmailAndPassword(
            auth, email, password
        );

        accountCreated = true;

        await updateProfile(credential.user, {
            displayName: name
        });

        await setDoc(doc(db, "users", credential.user.uid), {
            name: name,
            email: credential.user.email,
            role: "pending",
            createdAt: serverTimestamp()
        });

        await signOut(auth);

        form.reset();
        showMessage(
            "Registration submitted! Your seller account is pending admin approval.",
            true
        );
    } catch (error) {
        console.error("Seller registration error:", error);

        if (accountCreated) {
            showMessage(
                "Your authentication account was created, but registration could not finish. Do not register again yet. Contact the admin to complete your pending user record."
            );
        } else {
            const errors = {
                "auth/email-already-in-use": "This email is already registered. Try seller login.",
                "auth/invalid-email": "Enter a valid email address.",
                "auth/weak-password": "Choose a stronger password.",
                "auth/operation-not-allowed": "Enable Email/Password in Firebase Authentication.",
                "auth/network-request-failed": "Check your internet connection."
            };

            showMessage(errors[error.code] || `Registration failed: ${error.code || error.message}`);
        }
    } finally {
        button.disabled = false;
    }
});

