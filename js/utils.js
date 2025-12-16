/* Utility Functions */

function showToast(title, message, type = "success") {
  const toastContainer = document.getElementById("toast");
  if (!toastContainer) return;

  const toastId = "toast-" + Date.now();
  const icons = {
    success: "✓",
    error: "✗",
    info: "ℹ",
  };

  const toastEl = document.createElement("div");
  toastEl.className = `toast-item ${type}`;
  toastEl.id = toastId;
  toastEl.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.success}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ""}
    </div>
  `;

  toastContainer.appendChild(toastEl);
  try {
    toastContainer.classList.add("visible");
  } catch (_) {}

  // Animate cart button pulse if it's a cart action
  if (type === "success" && title.includes("Winkelwagen")) {
    const cartBtn = document.getElementById("cart-btn");
    if (cartBtn) {
      cartBtn.classList.add("cart-pulse");
      setTimeout(() => cartBtn.classList.remove("cart-pulse"), 300);
    }
  }

  // Auto remove after 3 seconds
  setTimeout(() => {
    toastEl.style.animation = "slideIn 0.3s ease reverse";
    setTimeout(() => {
      if (toastEl.parentNode) {
        toastEl.remove();
        // Hide container when empty to support CSS that toggles visibility
        if (toastContainer && toastContainer.children.length === 0) {
          try {
            toastContainer.classList.remove("visible");
          } catch (_) {}
        }
      }
    }, 300);
  }, 3000);
}

function updateBadges() {
  const cartBadge = document.querySelector("#cart-btn .badge");
  const wishBadge = document.querySelector("#wishlist-btn .badge");
  const totalQty = CART.reduce((sum, item) => sum + (item.quantity || 1), 0);
  if (cartBadge) cartBadge.textContent = totalQty;
  if (wishBadge) wishBadge.textContent = WISHLIST.length;
  updateCompareBadge();
}

function hasUserPurchased(productId) {
  // Check if user has purchased this product in any order
  return ORDERS.some((order) =>
    order.items.some((item) => item.id === productId)
  );
}
