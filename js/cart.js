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
  CART.forEach((item) => {
    item.selected = false;
  });
  localStorage.setItem("cart", JSON.stringify(CART));
  openCart();
}

function updateQuantity(idx, delta) {
  if (!CART[idx]) return;
  CART[idx].quantity = Math.max(1, (CART[idx].quantity || 1) + delta);
  localStorage.setItem("cart", JSON.stringify(CART));
  openCart();
}

function setQuantity(idx, value) {
  if (!CART[idx]) return;
  const qty = parseInt(value, 10);
  if (qty > 0) {
    CART[idx].quantity = qty;
    localStorage.setItem("cart", JSON.stringify(CART));
    openCart();
  }
}

function toggleWishlist(p, qty = 1) {
  const idx = WISHLIST.findIndex((w) => w.id === p.id);
  if (idx > -1) {
    WISHLIST.splice(idx, 1);
    showToast("Wishlist", `${p.name} verwijderd`, "info");
  } else {
    WISHLIST.push({ ...p, quantity: qty });
    showToast(
      "Wishlist",
      `${qty}x ${p.name} toegevoegd aan favorieten`,
      "success"
    );
  }
  localStorage.setItem("wishlist", JSON.stringify(WISHLIST));
  updateBadges();
  renderGrid();
}

function removeFromCart(idx) {
  CART.splice(idx, 1);
  localStorage.setItem("cart", JSON.stringify(CART));
  openCart();
}

function removeFromWishlist(idx) {
  WISHLIST.splice(idx, 1);
  localStorage.setItem("wishlist", JSON.stringify(WISHLIST));
  renderGrid();
  openWishlist();
}

function updateWishlistQty(idx, delta) {
  if (!WISHLIST[idx]) return;
  WISHLIST[idx].quantity = Math.max(1, (WISHLIST[idx].quantity || 1) + delta);
  localStorage.setItem("wishlist", JSON.stringify(WISHLIST));
  updateBadges();
  openWishlist();
}

function addToCartFromWishlist(idx) {
  const p = WISHLIST[idx];
  const qty = p.quantity || 1;
  addToCart(p);
  for (let i = 1; i < qty; i++) {
    addToCart(p);
  }
  WISHLIST.splice(idx, 1);
  localStorage.setItem("wishlist", JSON.stringify(WISHLIST));
  updateBadges();
  openWishlist();
}

function addToCartFromModal(id) {
  const p = ALL.find((x) => x.id === id);
  if (p) {
    const qty = modalProductQty || 1;
    for (let i = 0; i < qty; i++) {
      addToCart(p);
    }
    showToast("Winkelwagen", `${qty}x ${p.name} toegevoegd`, "success");
    modalProductQty = 1; // Reset quantity
    const input = document.getElementById("modal-qty");
    if (input) input.value = 1;
    closeModal();
  }
}

function toggleWishlistFromModal(id) {
  const p = ALL.find((x) => x.id === id);
  if (p) {
    const qty = modalProductQty || 1;
    toggleWishlist(p, qty);
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
    (sum, p) => sum + p.price * (p.quantity || 1),
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
                  const itemPrice = p.price;
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
              }" style="width:80px;height:80px;object-fit:cover;border-radius:8px;cursor:pointer" loading="lazy" onclick="openProductModal(ALL.find(x => x.id === '${
                    p.id
                  }'))" />
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
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted)">
              <span>waarvan BTW (21%)</span>
              <span>${formatPrice(subtotal - subtotal / 1.21)}</span>
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
          <button class="btn primary" id="checkout-button" style="width:100%;padding:14px;font-size:16px;font-weight:600;margin-bottom:8px" ${
            selectedItems.length ? "" : "disabled"
          }>💳 Afrekenen (${selectedItems.length})</button>
        </div>
      </div>`;

  modal.classList.remove("hidden");

  // Attach listener after DOM is updated
  setTimeout(() => {
    const btn = document.getElementById("checkout-button");
    if (!btn) return;
    const pk = (window.APP_CONFIG && window.APP_CONFIG.stripePublicKey) || "";
    const demoMode = !window.Stripe || !pk;
    btn.onclick = async () => {
      const sel = CART.filter((p) => p.selected !== false);
      if (sel.length === 0) {
        showToast("Winkelwagen", "Selecteer items om af te rekenen", "info");
        return;
      }
      if (demoMode) {
        showToast(
          "Checkout (test)",
          "Demo-modus: vul je gegevens in en plaats bestelling",
          "info"
        );
        return openCheckout();
      }

      showToast("Stripe", "Stripe actief: bezig met afrekenen", "success");

      if (
        typeof PAYMENTS !== "undefined" &&
        typeof PAYMENTS.startCheckout === "function"
      ) {
        const result = await PAYMENTS.startCheckout();
        if (result && (result.demo || result.error)) {
          return openCheckout();
        }
        return;
      }

      showToast(
        "Stripe",
        "Stripe module niet geladen — val terug op demo",
        "info"
      );
      return openCheckout();
    };
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
            ? WISHLIST.map((p, i) => {
                const qty = p.quantity || 1;
                return `
          <div style="display:flex;gap:12px;align-items:center;padding:12px;border-bottom:1px solid var(--border)">
            <img src="${
              p.image
            }" style="width:60px;height:60px;object-fit:cover;border-radius:8px;cursor:pointer" loading="lazy" onclick="openProductModal(ALL.find(x => x.id === '${
                  p.id
                }'))" />
            <div style="flex:1">
              <div style="font-weight:600">${p.name}</div>
              <div style="color:var(--muted);font-size:13px">€${p.price.toFixed(
                2
              )}</div>
              <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
                <button style="width:24px;height:24px;border:1px solid var(--border);border-radius:4px;background:#fff;cursor:pointer;font-weight:700" onclick="updateWishlistQty(${i}, -1)">−</button>
                <span style="min-width:30px;text-align:center;font-weight:600">${qty}</span>
                <button style="width:24px;height:24px;border:1px solid var(--border);border-radius:4px;background:#fff;cursor:pointer;font-weight:700" onclick="updateWishlistQty(${i}, 1)">+</button>
              </div>
            </div>
            <button class="btn primary" onclick="addToCartFromWishlist(${i})" style="padding:4px 8px">🛒</button>
            <button class="btn" onclick="removeFromWishlist(${i})" style="padding:4px 8px">✕</button>
          </div>
        `;
              }).join("")
            : '<div style="padding:24px;text-align:center;color:var(--muted)">Je wishlist is leeg</div>'
        }
      </div>
    </div>`;
  modal.classList.remove("hidden");
}
