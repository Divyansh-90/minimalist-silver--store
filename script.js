
"use strict";

document.addEventListener("DOMContentLoaded", function () {
    console.log("ÉLORA JavaScript loaded successfully.");

    const KEYS = {
        products: "elora_products",
        cart: "elora_cart",
        orders: "elora_orders",
        sellerSession: "elora_seller_session"
    };

    const $ = (id) => document.getElementById(id);

    function readData(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch (error) {
            console.warn("Could not read localStorage:", key, error);
            return fallback;
        }
    }

    function saveData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("Could not save localStorage:", key, error);
            return false;
        }
    }

    // Default ELORA products
    const initialProducts = [
        {
            id: "EL101",
            name: "Classic Silver Necklace",
            category: "necklace",
            price: 899,
            description: "An elegant everyday necklace.",
            image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: "EL102",
            name: "Minimal Hoop Earrings",
            category: "earrings",
            price: 599,
            description: "A timeless addition to your collection.",
            image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: "EL103",
            name: "Everyday Bracelet",
            category: "bracelet",
            price: 699,
            description: "A delicate piece for everyday wear.",
            image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: "EL104",
            name: "Elegant Silver Ring",
            category: "ring",
            price: 449,
            description: "Simple, subtle and effortlessly elegant.",
            image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: "EL105",
            name: "Layered Pendant",
            category: "necklace",
            price: 1099,
            description: "A refined accent for any outfit.",
            image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: "EL106",
            name: "Pearl Stud Earrings",
            category: "earrings",
            price: 549,
            description: "Understated beauty with a classic finish.",
            image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: "EL107",
            name: "Silver Chain Bracelet",
            category: "bracelet",
            price: 799,
            description: "A versatile accessory for every day.",
            image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: "EL108",
            name: "Minimal Band Ring",
            category: "ring",
            price: 399,
            description: "A clean design to complement your style.",
            image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=700&q=80"
        }
    ];

    function isValidProduct(product) {
        return product &&
            typeof product.id === "string" &&
            typeof product.name === "string" &&
            typeof product.category === "string" &&
            Number.isFinite(Number(product.price)) &&
            Number(product.price) >= 0 &&
            typeof product.description === "string" &&
            typeof product.image === "string";
    }

    function getProducts() {
        const stored = readData(KEYS.products, null);

        if (!Array.isArray(stored)) {
            saveData(KEYS.products, initialProducts);
            return initialProducts.slice();
        }

        return stored.filter(isValidProduct);
    }

    function getCart() {
        const stored = readData(KEYS.cart, []);

        if (!Array.isArray(stored)) {
            return [];
        }

        const productIds = new Set(getProducts().map(product => product.id));

        return stored.filter(item =>
            item &&
            productIds.has(item.id) &&
            Number.isSafeInteger(item.quantity) &&
            item.quantity > 0 &&
            item.quantity <= 99
        );
    }

    function money(amount) {
        return Number(amount).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        });
    }

    function addText(parent, tag, value, className) {
        const element = document.createElement(tag);
        element.textContent = String(value);

        if (className) {
            element.className = className;
        }

        parent.appendChild(element);
        return element;
    }

    function updateCartCount() {
        const badge = $("header-cart-count");

        if (!badge) return;

        const count = getCart().reduce(
            (total, item) => total + item.quantity,
            0
        );

        badge.textContent = String(count);
    }

    // Mobile navigation
    const menuToggle = $("menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function () {
            const open = navLinks.classList.toggle("open");

            menuToggle.setAttribute("aria-expanded", String(open));
            menuToggle.textContent = open ? "✕" : "☰";
        });

        navLinks.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                navLinks.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.textContent = "☰";
            });
        });
    }

    // Product catalogue, search and sorting
    function renderProducts() {
        const grid = $("consumer-product-grid");

        if (!grid) return;

        const search = ($("product-search")?.value || "")
            .trim()
            .toLowerCase();

        const category = $("category-filter")?.value || "all";
        const sort = $("sort-filter")?.value || "default";

        let products = getProducts().filter(function (product) {
            const name = product.name.toLowerCase();
            const description = product.description.toLowerCase();
            const productCategory = product.category.toLowerCase();

            const matchesSearch =
                name.includes(search) ||
                description.includes(search) ||
                productCategory.includes(search);

            const matchesCategory =
                category === "all" || product.category === category;

            return matchesSearch && matchesCategory;
        });

        if (sort === "low-high") {
            products.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sort === "high-low") {
            products.sort((a, b) => Number(b.price) - Number(a.price));
        } else if (sort === "name") {
            products.sort((a, b) => a.name.localeCompare(b.name));
        }

        grid.replaceChildren();

        const count = $("product-count");

        if (count) {
            count.textContent = `${products.length} products`;
        }

        const empty = $("empty-products");

        if (empty) {
            empty.hidden = products.length > 0;
        }

        products.forEach(function (product) {
            const card = document.createElement("article");
            card.className = "product-card";

            const imageWrap = document.createElement("div");
            imageWrap.className = "product-image-wrap";

            const img = document.createElement("img");
            img.className = "product-image";
            img.alt = product.name;
            img.loading = "lazy";

            img.addEventListener("error", function () {
                img.onerror = null;
                img.style.display = "none";

                if (!imageWrap.querySelector(".image-error")) {
                    addText(
                        imageWrap,
                        "p",
                        "Product image unavailable. Please check the image URL.",
                        "image-error"
                    );
                }
            });

            if (product.image) {
                img.src = product.image;
            } else {
                img.dispatchEvent(new Event("error"));
            }

            imageWrap.appendChild(img);
            card.appendChild(imageWrap);

            const info = document.createElement("div");
            info.className = "product-info";

            addText(info, "h3", product.name);
            addText(
                info,
                "p",
                product.description,
                "product-description"
            );
            addText(
                info,
                "p",
                money(product.price),
                "product-price"
            );

            const button = addText(
                info,
                "button",
                "Add to Bag",
                "add-to-cart"
            );

            button.type = "button";
            button.addEventListener("click", function () {
                addToCart(product.id);
            });

            card.appendChild(info);
            grid.appendChild(card);
        });
    }

    // Add products to cart
    function addToCart(id) {
        const product = getProducts().find(item => item.id === id);

        if (!product) return;

        const cart = getCart();
        const existing = cart.find(item => item.id === id);

        if (existing) {
            if (existing.quantity >= 99) {
                alert("Maximum quantity is 99.");
                return;
            }

            existing.quantity += 1;
        } else {
            cart.push({
                id: id,
                quantity: 1
            });
        }

        if (!saveData(KEYS.cart, cart)) {
            alert("Could not save your cart. Check browser storage settings.");
            return;
        }

        renderCart();

        const message = $("shop-message");

        if (message) {
            message.textContent = product.name + " added to your bag.";
            message.className = "form-message success";
        }
    }

    // Display cart items and totals
    function renderCart() {
        const container = $("cart-items");

        if (!container) {
            updateCartCount();
            return;
        }

        const cart = getCart();
        const products = getProducts();

        container.replaceChildren();

        let subtotal = 0;
        let itemCount = 0;

        if (cart.length === 0) {
            addText(
                container,
                "p",
                "Your bag is waiting for something beautiful.",
                "empty-cart"
            );
        }

        cart.forEach(function (item) {
            const product = products.find(p => p.id === item.id);

            if (!product) return;

            subtotal += Number(product.price) * item.quantity;
            itemCount += item.quantity;

            const row = document.createElement("div");
            row.className = "cart-item";

            const image = document.createElement("img");
            image.className = "cart-item-image";
            image.src = product.image;
            image.alt = product.name;

            image.addEventListener("error", function () {
                image.style.display = "none";
            });

            row.appendChild(image);

            const details = document.createElement("div");

            addText(details, "h4", product.name);
            addText(
                details,
                "p",
                money(product.price),
                "cart-item-price"
            );

            const controls = document.createElement("div");
            controls.className = "quantity-controls";

            const minus = addText(controls, "button", "−");
            minus.type = "button";
            minus.setAttribute("aria-label", "Decrease quantity");

            addText(controls, "span", item.quantity);

            const plus = addText(controls, "button", "+");
            plus.type = "button";
            plus.setAttribute("aria-label", "Increase quantity");

            minus.addEventListener("click", () => {
                changeQuantity(item.id, -1);
            });

            plus.addEventListener("click", () => {
                changeQuantity(item.id, 1);
            });

            details.appendChild(controls);

            const remove = addText(
                details,
                "button",
                "Remove item",
                "remove-item"
            );

            remove.type = "button";
            remove.addEventListener("click", () => {
                removeFromCart(item.id);
            });

            row.appendChild(details);

            addText(
                row,
                "div",
                money(Number(product.price) * item.quantity),
                "cart-item-total"
            );

            container.appendChild(row);
        });

        if ($("cart-item-count")) {
            $("cart-item-count").textContent =
                `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
        }

        if ($("cart-subtotal")) {
            $("cart-subtotal").textContent = money(subtotal);
        }

        if ($("cart-total")) {
            $("cart-total").textContent = money(subtotal);
        }

        if ($("delivery-charge")) {
            $("delivery-charge").textContent = "Free";
        }

        if ($("checkout-item-count")) {
            $("checkout-item-count").textContent = String(itemCount);
        }

        if ($("checkout-total")) {
            $("checkout-total").textContent = money(subtotal);
        }

        updateCartCount();
    }

    function changeQuantity(id, delta) {
        const cart = getCart();
        const item = cart.find(entry => entry.id === id);

        if (!item) return;

        const next = item.quantity + delta;

        if (next <= 0) {
            removeFromCart(id);
            return;
        }

        if (next > 99) {
            alert("Maximum quantity is 99.");
            return;
        }

        item.quantity = next;

        if (saveData(KEYS.cart, cart)) {
            renderCart();
        }
    }

    function removeFromCart(id) {
        const cart = getCart().filter(item => item.id !== id);

        if (saveData(KEYS.cart, cart)) {
            renderCart();
        }
    }

    // Search and filters
    ["product-search", "category-filter", "sort-filter"].forEach(
        function (id) {
            const field = $(id);

            if (field) {
                field.addEventListener(
                    id === "product-search" ? "input" : "change",
                    renderProducts
                );
            }
        }
    );

    // Proceed to checkout
    const checkoutButton = $("go-to-checkout");

    if (checkoutButton) {
        checkoutButton.addEventListener("click", function () {
            if (getCart().length === 0) {
                alert("Please add a product to your bag first.");
                return;
            }

            $("checkout")?.scrollIntoView({
                behavior: "smooth"
            });
        });
    }

    // Checkout and local demo order creation
    const checkoutForm = $("checkout-form");

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const message = $("checkout-message");

            function showError(text) {
                if (message) {
                    message.textContent = text;
                    message.className = "form-message error";
                }
            }

            const cart = getCart();

            if (cart.length === 0) {
                showError("Your bag is empty. Add a product first.");
                return;
            }

            const name = $("customer-name").value.trim();
            const mobile = $("customer-mobile").value.trim();
            const address = $("customer-address").value.trim();
            const payment = $("payment-method").value;

            if (name.length < 2) {
                showError("Please enter your full name.");
                return;
            }

            if (!/^[6-9]\d{9}$/.test(mobile)) {
                showError("Enter a valid 10-digit Indian mobile number.");
                return;
            }

            if (address.length < 10) {
                showError("Please enter a complete delivery address.");
                return;
            }

            if (payment !== "cod") {
                showError("Please select Cash on Delivery.");
                return;
            }

            const products = getProducts();
            const items = [];
            let total = 0;

            for (const item of cart) {
                const product = products.find(p => p.id === item.id);

                if (!product) {
                    showError("A product in your bag is unavailable.");
                    return;
                }

                total += Number(product.price) * item.quantity;

                items.push({
                    productId: product.id,
                    name: product.name,
                    price: Number(product.price),
                    quantity: item.quantity,
                    sellerId: product.sellerId || null
                });
            }

            const orders = readData(KEYS.orders, []);

            if (!Array.isArray(orders)) {
                showError("Saved orders could not be read. Refresh and retry.");
                return;
            }

            const order = {
                id: "EL" + Date.now().toString(36).toUpperCase(),
                customerName: name,
                mobile: mobile,
                address: address,
                paymentMethod: "Cash on Delivery",
                items: items,
                total: total,
                status: "Order Placed",
                date: new Date().toISOString()
            };

            orders.push(order);

            if (!saveData(KEYS.orders, orders)) {
                showError("Could not save your order. Check browser storage.");
                return;
            }

            if (!saveData(KEYS.cart, [])) {
                showError(
                    "Order saved, but cart could not be cleared. Please clear it manually."
                );
                return;
            }

            if ($("confirmation-order-id")) {
                $("confirmation-order-id").textContent = order.id;
            }

            if ($("confirmation-total")) {
                $("confirmation-total").textContent = money(total);
            }

            if ($("confirmation-payment")) {
                $("confirmation-payment").textContent = order.paymentMethod;
            }

            if ($("confirmation-status")) {
                $("confirmation-status").textContent = order.status;
            }

            const confirmation = $("order-confirmation");

            if (confirmation) {
                confirmation.hidden = false;
                confirmation.scrollIntoView({
                    behavior: "smooth"
                });
            }

            if (message) {
                message.textContent = "";
                message.className = "form-message";
            }

            checkoutForm.reset();
            renderCart();

            console.log("Demo order placed:", order.id);
        });
    }

    // Share functions with other scripts on this page.
    window.EloraStore = {
        STORAGE_KEYS: KEYS,
        readStoredData: readData,
        saveStoredData: saveData,
        getProducts: getProducts,
        renderProducts: renderProducts,
        renderCart: renderCart,
        updateCartCount: updateCartCount
    };

    // Initial render
    getProducts();
    renderProducts();
    renderCart();
    updateCartCount();

    // Load seller products from Firestore.
    async function loadSellerProducts() {
        const grid = $("consumer-product-grid");
        if (!grid) return;

        try {
            const { db } = await import("./firebase.js");

            const { collection, getDocs } = await import(
                "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"
            );

            const snapshot = await getDocs(collection(db, "products"));

            const sellerProducts = snapshot.docs.map(function (productDoc) {
                const data = productDoc.data();

                return {
                    id: productDoc.id,
                    name: data.name || "Jewellery",
                    category: data.category || "other",
                    price: Number(data.price) || 0,
                    description: data.description || "",
                    image: data.image || "",
                    sellerId: data.sellerId || ""
                };
            });

            // Keep the original demo products and add current Firebase products.
            // Firestore products use their document IDs, so seller deletion
            // is reflected when the customer page is refreshed.
            const allProducts = [
                ...initialProducts,
                ...sellerProducts
            ];

            const uniqueProducts = Array.from(
                new Map(
                    allProducts.map(product => [product.id, product])
                ).values()
            );

            if (!saveData(KEYS.products, uniqueProducts)) {
                throw new Error("Could not save product catalogue.");
            }

            renderProducts();
            renderCart();
            updateCartCount();

            console.log(
                "Firebase seller products loaded:",
                sellerProducts.length
            );
        } catch (error) {
            console.error("Firebase product loading failed:", error);
        }
    }

    loadSellerProducts();
});
