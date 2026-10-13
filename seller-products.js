
import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    deleteDoc,
    doc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const form = document.getElementById("seller-product-form");
const list = document.getElementById("seller-products-list");
const message = document.getElementById("seller-product-message");

let currentSeller = null;
let deleting = false;

function showMessage(text, success = false) {
    if (!message) return;
    message.textContent = text;
    message.style.color = success ? "#287342" : "#a13b3b";
}

function makeElement(tag, text, parent) {
    const element = document.createElement(tag);
    element.textContent = text;
    parent.appendChild(element);
    return element;
}

function renderProduct(product) {
    const card = document.createElement("article");
    card.className = "seller-product-card";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    image.loading = "lazy";

    image.onerror = () => {
        image.removeAttribute("src");
        image.alt = "Product image unavailable";
        image.style.display = "none";

        if (!card.querySelector(".image-error")) {
            const error = document.createElement("p");
            error.className = "image-error";
            error.textContent =
                "Image not available. Check the image URL.";
            card.appendChild(error);
        }
    };

    card.appendChild(image);

    makeElement("h3", product.name, card);
    makeElement(
        "p",
        "Price: ₹" + Number(product.price).toLocaleString("en-IN"),
        card
    );
    makeElement("p", "Category: " + product.category, card);
    makeElement("p", product.description, card);

    const deleteButton = makeElement("button", "Delete Product", card);
    deleteButton.type = "button";
    deleteButton.style.cssText =
        "padding:10px 14px;background:#a52a2a;color:white;border:0;cursor:pointer;margin-top:10px";

    deleteButton.addEventListener("click", async () => {
        if (!currentSeller || deleting) return;

        const confirmed = window.confirm(
            `Delete "${product.name}" from your store?`
        );

        if (!confirmed) return;

        deleting = true;
        deleteButton.disabled = true;
        showMessage("Deleting product...", true);

        try {
            // Verify ownership before attempting deletion.
            const productRef = doc(db, "products", product.id);
            const latest = await getDoc(productRef);

            if (!latest.exists()) {
                showMessage("This product has already been deleted.");
                await loadMyProducts();
                return;
            }

            if (latest.data().sellerId !== currentSeller.uid) {
                showMessage("You can delete only your own products.");
                return;
            }

            await deleteDoc(productRef);

            showMessage("Product deleted successfully!", true);
            await loadMyProducts();
        } catch (error) {
            console.error("Delete product error:", error);
            showMessage(
                "Could not delete product. Check Firestore Rules and Console."
            );
        } finally {
            deleting = false;
            if (deleteButton.isConnected) {
                deleteButton.disabled = false;
            }
        }
    });

    list.appendChild(card);
}

async function loadMyProducts() {
    if (!currentSeller || !list) return;

    list.replaceChildren();

    const loading = document.createElement("p");
    loading.textContent = "Loading your products...";
    list.appendChild(loading);

    try {
        const productsQuery = query(
            collection(db, "products"),
            where("sellerId", "==", currentSeller.uid)
        );

        const snapshot = await getDocs(productsQuery);
        list.replaceChildren();

        if (snapshot.empty) {
            makeElement(
                "p",
                "You have not added any products yet.",
                list
            );
            return;
        }

        snapshot.forEach(productDoc => {
            renderProduct({
                id: productDoc.id,
                ...productDoc.data()
            });
        });
    } catch (error) {
        console.error("Load products error:", error);
        list.replaceChildren();
        makeElement("p", "Could not load your products.", list);
        showMessage("Check your Firestore Rules and browser Console.");
    }
}

if (form) {
    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (!currentSeller) {
            showMessage("Sign in with an approved seller account.");
            return;
        }

        const name = document.getElementById("product-name").value.trim();
        const category = document.getElementById("product-category").value;
        const price = Number(document.getElementById("product-price").value);
        const description =
            document.getElementById("product-description").value.trim();
        const image = document.getElementById("product-image").value.trim();

        if (
            !name ||
            !category ||
            !description ||
            !image ||
            !Number.isFinite(price) ||
            price <= 0
        ) {
            showMessage("Please enter valid product details.");
            return;
        }

        // Require a valid HTTP(S) image URL.
        try {
            const url = new URL(image);
            if (!["https:", "http:"].includes(url.protocol)) {
                throw new Error("Invalid image URL");
            }
        } catch {
            showMessage("Enter a valid direct image URL.");
            return;
        }

        const button = form.querySelector('button[type="submit"]');
        if (button) button.disabled = true;

        showMessage("Saving product...", true);

        try {
            await addDoc(collection(db, "products"), {
                name,
                category,
                price,
                description,
                image,
                sellerId: currentSeller.uid,
                createdAt: serverTimestamp()
            });

            form.reset();
            showMessage("Product added successfully!", true);
            await loadMyProducts();
        } catch (error) {
            console.error("Add product error:", error);
            showMessage(
                "Could not add product. Check Firestore Rules and Console."
            );
        } finally {
            if (button) button.disabled = false;
        }
    });
}

onAuthStateChanged(auth, async user => {
    if (!user) {
        window.location.replace("seller-login.html");
        return;
    }

    try {
        const userSnapshot = await getDoc(doc(db, "users", user.uid));

        if (
            !userSnapshot.exists() ||
            userSnapshot.data().role !== "seller"
        ) {
            window.location.replace("seller-login.html");
            return;
        }

        currentSeller = user;
        await loadMyProducts();
    } catch (error) {
        console.error("Seller verification error:", error);
        showMessage("Could not verify seller access.");
    }
});
