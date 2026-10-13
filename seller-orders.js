
/* Seller Order Management */

(() => {
    "use strict";

    const orderList = document.getElementById("seller-orders-list");
    const filterSelect = document.getElementById("seller-order-filter");

    if (!orderList || !filterSelect) return;

    const readOrders = () => {
        // Support both storage keys used in earlier project versions.
        for (const key of ["elora_orders", "minimalist_orders"]) {
            try {
                const data = JSON.parse(localStorage.getItem(key) || "[]");
                if (Array.isArray(data) && data.length) return data;
            } catch (error) {
                console.error("Could not read orders from", key, error);
            }
        }

        return [];
    };

    const normalizeStatus = (status) => {
        const value = String(status || "Pending").trim().toLowerCase();

        const statuses = {
            "order placed": "Pending",
            "pending": "Pending",
            "processing": "Confirmed",
            "confirmed": "Confirmed",
            "shipped": "Shipped",
            "delivered": "Delivered",
            "cancelled": "Cancelled",
            "canceled": "Cancelled"
        };

        return statuses[value] || "Pending";
    };

    const money = (value) => {
        const amount = Number(value) || 0;

        return amount.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        });
    };

    const makeElement = (tag, className, text) => {
        const element = document.createElement(tag);

        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;

        return element;
    };

    function renderOrders() {
        const orders = readOrders();
        const normalizedOrders = orders.map(order => ({
            ...order,
            displayStatus: normalizeStatus(order.status)
        }));

        document.getElementById("seller-total-orders").textContent =
            normalizedOrders.length;

        document.getElementById("seller-pending-orders").textContent =
            normalizedOrders.filter(order =>
                order.displayStatus === "Pending"
            ).length;

        document.getElementById("seller-delivered-orders").textContent =
            normalizedOrders.filter(order =>
                order.displayStatus === "Delivered"
            ).length;

        const selectedFilter = filterSelect.value;

        const visibleOrders = normalizedOrders.filter(order =>
            selectedFilter === "all" ||
            order.displayStatus === selectedFilter
        );

        orderList.replaceChildren();

        if (!visibleOrders.length) {
            orderList.appendChild(
                makeElement(
                    "p",
                    "seller-no-orders",
                    orders.length
                        ? "No orders match this filter."
                        : "No orders found yet. Place a test order from the consumer panel."
                )
            );
            return;
        }

        visibleOrders.forEach(order => {
            const card = makeElement("article", "seller-order-card");

            const heading = makeElement("div", "seller-order-card-heading");
            const orderId = order.orderId || order.id || "Order";
            const customerName = order.customerName || order.name || "Customer";

            heading.appendChild(
                makeElement("h3", "", `Order ${orderId}`)
            );
            heading.appendChild(
                makeElement("span", "seller-order-status", order.displayStatus)
            );
            card.appendChild(heading);

            const customer = makeElement("div", "seller-order-customer");
            customer.appendChild(
                makeElement("p", "", `Customer: ${customerName}`)
            );
            customer.appendChild(
                makeElement("p", "", `Mobile: ${order.phone || order.mobile || "Not provided"}`)
            );
            customer.appendChild(
                makeElement("p", "", `Address: ${order.address || "Not provided"}`)
            );
            customer.appendChild(
                makeElement("p", "", `Payment: ${order.paymentMethod || "Not specified"}`)
            );
            customer.appendChild(
                makeElement("p", "", `Date: ${order.createdAt || order.date || "Not recorded"}`)
            );
            card.appendChild(customer);

            const itemsHeading = makeElement("h4", "", "Items");
            card.appendChild(itemsHeading);

            const itemsList = makeElement("ul", "seller-order-items");
            const items = Array.isArray(order.items) ? order.items : [];

            if (items.length) {
                items.forEach(item => {
                    const name = item.name || item.title || "Product";
                    const quantity = Number(item.quantity) || 1;
                    const price = Number(item.price) || 0;

                    itemsList.appendChild(
                        makeElement(
                            "li",
                            "",
                            `${name} × ${quantity} — ${money(price * quantity)}`
                        )
                    );
                });
            } else {
                itemsList.appendChild(
                    makeElement("li", "", "Item details unavailable")
                );
            }

            card.appendChild(itemsList);

            const total = Number(order.total ?? order.totalAmount) ||
                items.reduce((sum, item) =>
                    sum + (Number(item.price) || 0) *
                    (Number(item.quantity) || 1), 0);

            card.appendChild(
                makeElement("p", "seller-order-total", `Order Total: ${money(total)}`)
            );

            const statusLabel = makeElement("label", "seller-status-label", "Update status");

            const statusSelect = document.createElement("select");
            statusSelect.className = "seller-status-select";
            statusSelect.setAttribute("aria-label", `Update status for order ${orderId}`);

            ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"]
                .forEach(status => {
                    const option = document.createElement("option");
                    option.value = status;
                    option.textContent = status;
                    option.selected = status === order.displayStatus;
                    statusSelect.appendChild(option);
                });

            statusLabel.appendChild(statusSelect);
            card.appendChild(statusLabel);

            const saveButton = makeElement("button", "seller-save-status", "Save Status");
            saveButton.type = "button";

            saveButton.addEventListener("click", () => {
                const allOrders = readOrders();
                const index = allOrders.findIndex(existing =>
                    String(existing.orderId || existing.id || "") ===
                    String(orderId)
                );

                if (index === -1) {
                    alert("Order not found. Refresh the panel and try again.");
                    return;
                }

                allOrders[index].status = statusSelect.value;

                // Save back to the key where this order already exists.
                const storageKey = ["elora_orders", "minimalist_orders"]
                    .find(key => {
                        try {
                            const saved = JSON.parse(localStorage.getItem(key) || "[]");
                            return Array.isArray(saved) &&
                                saved.some(existing =>
                                    String(existing.orderId || existing.id || "") ===
                                    String(orderId)
                                );
                        } catch {
                            return false;
                        }
                    }) || "elora_orders";

                localStorage.setItem(storageKey, JSON.stringify(allOrders));
                renderOrders();
            });

            card.appendChild(saveButton);
            orderList.appendChild(card);
        });
    }

    filterSelect.addEventListener("change", renderOrders);
    window.addEventListener("storage", renderOrders);

    renderOrders();
})();
