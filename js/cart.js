/* Cart & Wishlist Management */

function addToCart(p) {
  // Check if item already exists in cart
  const existing = CART.find((item) => item.id === p.id);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
    showToast(
      "Winkelwagen",
      `${p.name} aantal verhoogd naar ${existing.quantity}`,
      "success"
    );
  } else {
    CART.push({ ...p, quantity: 1 });
    showToast(
      "Toegevoegd aan winkelwagen",
      `${p.name} is toegevoegd`,
      "success"
    );
  }
  localStorage.setItem("cart", JSON.stringify(CART));
  updateBadges();
}

function updateQuantity(idx, delta) {
  if (!CART[idx]) return;
  CART[idx].quantity = Math.max(1, (CART[idx].quantity || 1) + delta);
  localStorage.setItem("cart", JSON.stringify(CART));
  updateBadges();
  openCart();
}

function setQuantity(idx, value) {
  if (!CART[idx]) return;
  const qty = parseInt(value, 10);
  if (qty > 0) {
    CART[idx].quantity = qty;
    localStorage.setItem("cart", JSON.stringify(CART));
    updateBadges();
    openCart();
  }
}

function toggleWishlist(p) {
  const idx = WISHLIST.findIndex((w) => w.id === p.id);
  if (idx > -1) {
    WISHLIST.splice(idx, 1);
    showToast("Wishlist", `${p.name} verwijderd`, "info");
  } else {
    WISHLIST.push(p);
    showToast("Wishlist", `${p.name} toegevoegd aan favorieten`, "success");
  }
  localStorage.setItem("wishlist", JSON.stringify(WISHLIST));
  updateBadges();
  renderGrid();
}

function removeFromCart(idx) {
  CART.splice(idx, 1);
  localStorage.setItem("cart", JSON.stringify(CART));
  updateBadges();
  openCart();
}

function removeFromWishlist(idx) {
  WISHLIST.splice(idx, 1);
  localStorage.setItem("wishlist", JSON.stringify(WISHLIST));
  updateBadges();
  renderGrid();
  openWishlist();
}

function addToCartFromWishlist(idx) {
  const p = WISHLIST[idx];
  addToCart(p);
}

function addToCartFromModal(id) {
  const p = ALL.find((x) => x.id === id);
  if (p) addToCart(p);
}

function toggleWishlistFromModal(id) {
  const p = ALL.find((x) => x.id === id);
  if (p) {
    toggleWishlist(p);
    openProductModal(p);
  }
}

function toggleCartItem(idx) {
  if (!CART[idx]) return;
  CART[idx].selected = !CART[idx].selected;
  localStorage.setItem("cart", JSON.stringify(CART));
  openCart();
}

function selectAllCartItems() {
  CART.forEach((item) => {
    item.selected = true;
  });
  localStorage.setItem("cart", JSON.stringify(CART));
  openCart();
}

function deselectAllCartItems() {
  CART.forEach((item) => {
    item.selected = false;
  });
  localStorage.setItem("cart", JSON.stringify(CART));
  openCart();
}

function openCart() {
  const modal = document.getElementById("product-modal");
  if (!modal) return;

  const selectedItems = CART.filter((p) => p.selected !== false);
  const subtotal = selectedItems.reduce(
    (sum, p) => sum + p.price * 1.21 * (p.quantity || 1),
    0
  );
  const shipping = subtotal >= 25 ? 0 : 4.95;
  const total = subtotal + shipping;

  modal.innerHTML = `
    <div class="content">
      <div class="header">
        <h2>🛒 Winkelwagen</h2>
        <button class="close" onclick="closeModal()">✕</button>
      </div>
      <div class="body" style="display:block;max-height:450px;overflow-y:auto">
        ${
          CART.length
            ? `<div style="padding:12px;border-bottom:1px solid var(--border);display:flex;gap:10px">
                <button class="btn" onclick="selectAllCartItems()" style="flex:1;padding:8px;font-size:13px">✓ Alles selecteren</button>
                <button class="btn" onclick="deselectAllCartItems()" style="flex:1;padding:8px;font-size:13px">Alles deselecteren</button>
              </div>` +
              CART.map((p, i) => {
                const qty = p.quantity || 1;
                const itemPrice = p.price * 1.21;
                const itemTotal = itemPrice * qty;
                const isSelected = p.selected !== false;
                return `
          <div class="cart-item" style="display:flex;gap:12px;padding:16px;border-bottom:1px solid var(--border);opacity:${
            isSelected ? "1" : "0.6"
          }">
            <input type="checkbox" ${
              isSelected ? "checked" : ""
            } onchange="toggleCartItem(${i})" style="width:20px;height:20px;cursor:pointer;flex-shrink:0;margin-top:2px" />
            <img src="${
              p.image
            }" style="width:80px;height:80px;object-fit:cover;border-radius:8px" loading="lazy" onerror="this.src='https://via.placeholder.com/80x80/f3f3f3/666?text=?'" />
            <div style="flex:1;display:flex;flex-direction:column;gap:8px">
              <div>
                <div style="font-weight:600;margin-bottom:4px">${p.name}</div>
                <div style="color:var(--muted);font-size:13px">${formatPrice(
                  itemPrice
                )} per stuk</div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;margin-top:auto">
                <button class="qty-btn" onclick="updateQuantity(${i}, -1)" style="width:28px;height:28px;border:1px solid var(--border);border-radius:6px;background:#fff;cursor:pointer;font-weight:700;font-size:16px;display:flex;align-items:center;justify-content:center">−</button>
                <input type="number" value="${qty}" min="1" onchange="setQuantity(${i}, this.value)" style="width:50px;text-align:center;padding:6px;border:1px solid var(--border);border-radius:6px;font-weight:600" />
                <button class="qty-btn" onclick="updateQuantity(${i}, 1)" style="width:28px;height:28px;border:1px solid var(--border);border-radius:6px;background:#fff;cursor:pointer;font-weight:700;font-size:16px;display:flex;align-items:center;justify-content:center">+</button>
                <div style="margin-left:auto;font-weight:700">${formatPrice(
                  itemTotal
                )}</div>
              </div>
            </div>
            <button class="btn" onclick="removeFromCart(${i})" style="padding:6px 10px;height:fit-content" title="Verwijderen">🗑️</button>
          </div>
        `;
              }).join("")
            : '<div style="padding:24px;text-align:center;color:var(--muted)">Je winkelwagen is leeg</div>'
        }
      </div>
      <div style="padding:20px;border-top:2px solid var(--border);background:#f9fafb">
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;font-size:14px">
            <span>Subtotaal (${selectedItems.length}/${
    CART.length
  } items)</span>
            <span>${formatPrice(subtotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:14px;color:${
            shipping === 0 ? "#10b981" : "inherit"
          }">
            <span>Verzendkosten</span>
            <span>${shipping === 0 ? "GRATIS" : formatPrice(shipping)}</span>
          </div>
          ${
            shipping > 0
              ? `<div style="font-size:12px;color:var(--muted);text-align:right">Gratis verzending vanaf €25</div>`
              : ""
          }
        </div>
        <div style="display:flex;justify-content:space-between;font-size:20px;font-weight:700;padding-top:12px;border-top:1px solid var(--border);margin-bottom:16px">
          <span>Totaal</span>
          <span style="color:#10b981">${formatPrice(total)}</span>
        </div>
        <button class="btn primary" id="checkout-button" style="width:100%;padding:14px;font-size:16px;font-weight:600" ${
          selectedItems.length ? "" : "disabled"
        }>💳 Afrekenen (${selectedItems.length})</button>
      </div>
    </div>`;

  modal.classList.remove("hidden");

  // Attach listener after DOM is updated
  setTimeout(() => {
    const btn = document.getElementById("checkout-button");
    if (btn && typeof openCheckout === "function") {
      btn.onclick = openCheckout;
    }
  }, 10);
}

function openWishlist() {
  const modal = document.getElementById("product-modal");
  if (!modal) return;
  modal.innerHTML = `
    <div class="content">
      <div class="header">
        <h2>❤ Wishlist</h2>
        <button class="close" onclick="closeModal()">✕</button>
      </div>
      <div class="body" style="display:block;max-height:400px;overflow-y:auto">
        ${
          WISHLIST.length
            ? WISHLIST.map(
                (p, i) => `
          <div style="display:flex;gap:12px;align-items:center;padding:12px;border-bottom:1px solid var(--border)">
            <img src="${
              p.image
            }" style="width:60px;height:60px;object-fit:cover;border-radius:8px" loading="lazy" onerror="this.src='https://via.placeholder.com/60x60/f3f3f3/666?text=?'" />
            <div style="flex:1">
              <div style="font-weight:600">${p.name}</div>
              <div style="color:var(--muted);font-size:13px">€${(
                p.price * 1.21
              ).toFixed(2)}</div>
            </div>
            <button class="btn primary" onclick="addToCartFromWishlist(${i})" style="padding:4px 8px">🛒</button>
            <button class="btn" onclick="removeFromWishlist(${i})" style="padding:4px 8px">✕</button>
          </div>
        `
              ).join("")
            : '<div style="padding:24px;text-align:center;color:var(--muted)">Je wishlist is leeg</div>'
        }
      </div>
    </div>`;
  modal.classList.remove("hidden");
}
