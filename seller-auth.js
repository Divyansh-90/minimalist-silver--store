
import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const loginForm = document.getElementById("seller-login-form");
const message = document.getElementById("seller-login-message");
const logoutButton = document.getElementById("seller-logout");

function showMessage(text, isError = true) {
    if (!message) return;
    message.textContent = text;
    message.style.color = isError ? "#a13b3b" : "#397344";
}

function isSellerDashboard() {
    return window.location.pathname.endsWith("/seller.html")
        || window.location.pathname.endsWith("seller.html");
}

// Protect seller dashboard
if (isSellerDashboard()) {
    document.body.style.display = "none";

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.replace("seller-login.html");
            return;
        }

        try {
            const userRef = doc(db, "users", user.uid);
            const userSnapshot = await getDoc(userRef);

            if (!userSnapshot.exists()
                || userSnapshot.data().role !== "seller") {
                await signOut(auth);
                window.location.replace("seller-login.html");
                return;
            }

            // Show dashboard only after seller verification
            document.body.style.display = "";
        } catch (error) {
            console.error("Seller verification failed:", error);
            document.body.style.display = "";
            document.body.innerHTML = `
                <main style="font-family:Arial;padding:30px">
                    <h2>Dashboard verification failed</h2>
                    <p>Access could not be verified. Check your internet
                    connection and Firebase configuration, then try again.</p>
                    <button onclick="location.href='seller-login.html'">
                        Back to Seller Login
                    </button>
                </main>
            `;
        }
    });
}

// Seller login
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("seller-email").value.trim();
        const password = document.getElementById("seller-password").value;
        const submitButton =
            loginForm.querySelector('button[type="submit"]');

        if (!email || !password) {
            showMessage("Please enter your email and password.");
            return;
        }

        if (submitButton) submitButton.disabled = true;
        showMessage("Signing in...", false);

        try {
            const credential = await signInWithEmailAndPassword(
                auth, email, password
            );

            const userRef = doc(db, "users", credential.user.uid);
            const userSnapshot = await getDoc(userRef);

            if (!userSnapshot.exists()
                || userSnapshot.data().role !== "seller") {
                await signOut(auth);
                showMessage("Access denied. This account is not an authorized seller.");
                if (submitButton) submitButton.disabled = false;
                return;
            }

            window.location.replace("seller.html");
        } catch (error) {
            console.error("Seller login error:", error.code, error.message);

            const messages = {
                "auth/invalid-credential": "Incorrect email or password.",
                "auth/user-not-found": "No account found with this email.",
                "auth/wrong-password": "Incorrect password.",
                "auth/invalid-email": "Please enter a valid email address.",
                "auth/too-many-requests": "Too many attempts. Try again later.",
                "auth/network-request-failed": "Check your internet connection.",
                "permission-denied": "Firestore permission denied. Check Security Rules."
            };

            showMessage(
                messages[error.code]
                || `Login failed (${error.code || "unknown error"}). Check Console.`
            );

            if (submitButton) submitButton.disabled = false;
        }
    });
}

// Seller logout
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.replace("seller-login.html");
        } catch (error) {
            console.error("Logout error:", error);
            alert("Logout failed. Please try again.");
        }
    });
}
