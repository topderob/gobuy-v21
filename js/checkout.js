/* Checkout Flow */

function addressKeySuffix() {
  return currentUser?.email ? `:${currentUser.email}` : "";
}

function loadSavedAddress() {
  const suffix = addressKeySuffix();
  const get = (base) =>
    localStorage.getItem(`${base}${suffix}`) ||
    localStorage.getItem(base) ||
    "";
  return {
    address: get("userAddress"),
    city: get("userCity"),
    zip: get("userZip"),
  };
}

function saveDefaultAddress(address, city, zip) {
  const suffix = addressKeySuffix();
  const setKey = (base, val) => {
    localStorage.setItem(`${base}${suffix}`, val || "");
    localStorage.setItem(base, val || "");
  };
  setKey("userAddress", address);
  setKey("userCity", city);
  setKey("userZip", zip);
}

async function getDefaultAddressOnline() {
  if (!window.supabaseClient || !currentUser?.id) return null;
  try {
    // Prefer explicit default; else first address
    const { data: def, error: errDef } = await window.supabaseClient
      .from("addresses")
      .select("name,address,city,zip,is_default")
      .eq("user_id", currentUser.id)
      .eq("is_default", true)
      .limit(1);
    if (!errDef && Array.isArray(def) && def[0]) return def[0];
    const { data: first, error: errFirst } = await window.supabaseClient
      .from("addresses")
      .select("name,address,city,zip,is_default")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: true })
      .limit(1);
    if (!errFirst && Array.isArray(first) && first[0]) return first[0];
  } catch (e) {
    console.warn("[checkout] fetch default address failed:", e.message);
  }
  return null;
}

async function openCheckout() {
  console.log("openCheckout called");

  const selectedItems = CART.filter((p) => p.selected !== false);

  if (selectedItems.length === 0) {
    showToast(
      "Checkout niet mogelijk",
      "Selecteer minstens één product",
      "error"
    );
    return;
  }

  const modal = document.getElementById("product-modal");
  console.log("Modal found:", !!modal);
  if (!modal) {
    console.error("Modal not found");
    return;
  }

  // Make sure modal is visible
  modal.classList.remove("hidden");
  console.log("Modal unhidden");

  const subtotal = selectedItems.reduce(
    (sum, p) => sum + p.price * 1.21 * (p.quantity || 1),
    0
  );

  // Initial shipping cost for NL (will be updated dynamically)
  const shipping = subtotal >= 25 ? 0 : 4.95;
  const totalEur = subtotal + shipping;

  // Pre-fill with user info if logged in
  const name = currentUser?.name || "";
  const email = currentUser?.email || "";
  const phone = "";
  let { address, city, zip } = loadSavedAddress();
  const onlineDefault = await getDefaultAddressOnline();
  if (onlineDefault) {
    address = onlineDefault.address || address;
    city = onlineDefault.city || city;
    zip = onlineDefault.zip || zip;
  }

  modal.innerHTML = `
    <div class="content" style="max-width:700px">
      <div class="header">
        <h2>✅ Afrekenen</h2>
        <button class="close" onclick="closeModal()">✕</button>
      </div>
      <div class="body" style="display:block;padding:20px">
        <form id="checkout-form" style="display:grid;gap:16px">
          <div>
            <h3>Contactgegevens</h3>
            <input type="text" id="checkout-name" placeholder="Volledige naam *" value="${name}" required style="width:100%;padding:10px;margin:4px 0;border:1px solid var(--border);border-radius:8px" />
            <input type="email" id="checkout-email" placeholder="E-mail *" value="${email}" required style="width:100%;padding:10px;margin:4px 0;border:1px solid var(--border);border-radius:8px" />
            <input type="tel" id="checkout-phone" placeholder="Telefoonnummer *" required style="width:100%;padding:10px;margin:4px 0;border:1px solid var(--border);border-radius:8px" />
          </div>
          <div>
            <h3>Verzendadres</h3>
            <select id="checkout-country" required style="width:100%;padding:10px;margin:4px 0;border:1px solid var(--border);border-radius:8px;font-size:14px">
              <option value="NL" selected>Nederland</option>
              <option value="BE">België</option>
              <option value="DE">Duitsland</option>
              <option value="FR">Frankrijk</option>
              <option value="ES">Spanje</option>
              <option value="IT">Italië</option>
              <option value="AT">Oostenrijk</option>
              <option value="LU">Luxemburg</option>
              <option value="PL">Polen</option>
              <option value="CZ">Tsjechië</option>
              <option value="DK">Denemarken</option>
              <option value="SE">Zweden</option>
              <option value="NO">Noorwegen</option>
              <option value="FI">Finland</option>
              <option value="UK">Verenigd Koninkrijk</option>
              <option value="IE">Ierland</option>
              <option value="PT">Portugal</option>
              <option value="GR">Griekenland</option>
              <option value="CH">Zwitserland</option>
              <option value="OTHER">Overig internationaal</option>
            </select>
            <input type="text" id="checkout-address" placeholder="Straat + Huisnummer *" value="${address}" required style="width:100%;padding:10px;margin:4px 0;border:1px solid var(--border);border-radius:8px" />
            <input type="text" id="checkout-city" placeholder="Plaats *" value="${city}" required style="width:100%;padding:10px;margin:4px 0;border:1px solid var(--border);border-radius:8px" />
            <input type="text" id="checkout-zip" placeholder="Postcode *" value="${zip}" required style="width:100%;padding:10px;margin:4px 0;border:1px solid var(--border);border-radius:8px" />
            <label style="display:flex;align-items:center;gap:8px;margin-top:12px;cursor:pointer">
              <input type="checkbox" id="checkout-different" style="width:18px;height:18px;cursor:pointer" />
              <span>Ander factuuradres gebruiken</span>
            </label>
          </div>
          <div id="billing-address-section" style="display:none">
            <h3>Factuuradres</h3>
            <input type="text" id="checkout-billing-address" placeholder="Straat + Huisnummer" style="width:100%;padding:10px;margin:4px 0;border:1px solid var(--border);border-radius:8px" />
            <input type="text" id="checkout-billing-city" placeholder="Plaats" style="width:100%;padding:10px;margin:4px 0;border:1px solid var(--border);border-radius:8px" />
            <input type="text" id="checkout-billing-zip" placeholder="Postcode" pattern="[0-9]{4}[A-Za-z]{2}" style="width:100%;padding:10px;margin:4px 0;border:1px solid var(--border);border-radius:8px" />
          </div>
          <div>
            <h3>Betaalmethode</h3>
            <div style="display:grid;gap:10px">
              <label style="display:flex;align-items:center;gap:10px;padding:12px;border:2px solid var(--primary);border-radius:8px;cursor:pointer;background:var(--bg)">
                <input type="radio" name="payment" value="ideal" checked style="width:18px;height:18px;cursor:pointer" />
                <span style="flex:1">
                  <strong>iDEAL</strong>
                  <div style="font-size:12px;color:var(--muted)">Bankoverschrijving via iDEAL</div>
                </span>
              </label>
              <label style="display:flex;align-items:center;gap:10px;padding:12px;border:2px solid var(--border);border-radius:8px;cursor:pointer;background:var(--bg)">
                <input type="radio" name="payment" value="klarna" style="width:18px;height:18px;cursor:pointer" />
                <span style="flex:1">
                  <strong>Klarna</strong>
                  <div style="font-size:12px;color:var(--muted)">Koop nu, betaal later</div>
                </span>
              </label>
              <label style="display:flex;align-items:center;gap:10px;padding:12px;border:2px solid var(--border);border-radius:8px;cursor:pointer;background:var(--bg)">
                <input type="radio" name="payment" value="visa" style="width:18px;height:18px;cursor:pointer" />
                <span style="flex:1">
                  <strong>Visa / Mastercard</strong>
                  <div style="font-size:12px;color:var(--muted)">Creditcard betaling</div>
                </span>
              </label>
              <label style="display:flex;align-items:center;gap:10px;padding:12px;border:2px solid var(--border);border-radius:8px;cursor:pointer;background:var(--bg)">
                <input type="radio" name="payment" value="paypal" style="width:18px;height:18px;cursor:pointer" />
                <span style="flex:1">
                  <strong>PayPal</strong>
                  <div style="font-size:12px;color:var(--muted)">Veilige online betaling</div>
                </span>
              </label>
              <label style="display:flex;align-items:center;gap:10px;padding:12px;border:2px solid var(--border);border-radius:8px;cursor:pointer;background:var(--bg)">
                <input type="radio" name="payment" value="transfer" style="width:18px;height:18px;cursor:pointer" />
                <span style="flex:1">
                  <strong>Bankoverschrijving</strong>
                  <div style="font-size:12px;color:var(--muted)">Rechtstreekse overdracht</div>
                </span>
              </label>
            </div>
          </div>
          <div>
            <h3>Bestelling (${selectedItems.reduce(
              (sum, p) => sum + (p.quantity || 1),
              0
            )} items)</h3>
            <div style="max-height:200px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:12px">
              ${selectedItems
                .map((p) => {
                  const qty = p.quantity || 1;
                  const itemTotal = p.price * 1.21 * qty;
                  return `
                <div style="display:flex;gap:12px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--border)">
                  <img src="${
                    p.image
                  }" style="width:50px;height:50px;object-fit:cover;border-radius:6px" />
                  <div style="flex:1">
                    <div style="font-weight:600;font-size:14px">${p.name}</div>
                    <div style="color:var(--muted);font-size:13px">${formatPrice(
                      p.price * 1.21
                    )} × ${qty}</div>
                  </div>
                  <div style="font-weight:700">${formatPrice(itemTotal)}</div>
                </div>
              `;
                })
                .join("")}
            </div>
            <div style="margin-top:12px;padding:12px;background:var(--bg);border-radius:8px" id="order-summary">
              <div style="display:flex;justify-content:space-between;margin:4px 0">
                <span>Subtotaal:</span>
                <span id="summary-subtotal">${formatPrice(subtotal)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin:4px 0;color:${
                shipping === 0 ? "#10b981" : "inherit"
              }" id="shipping-line">
                <span>Verzending <span id="shipping-country-name">(Nederland)</span>:</span>
                <span id="summary-shipping">${
                  shipping === 0 ? "GRATIS" : formatPrice(shipping)
                }</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin:8px 0 0;padding-top:8px;border-top:2px solid var(--border);font-size:18px;font-weight:700">
                <span>Totaal:</span>
                <span style="color:#10b981" id="summary-total">${formatPrice(
                  totalEur
                )}</span>
              </div>
            </div>
          </div>
          <button type="submit" class="btn primary" style="width:100%;padding:14px;font-size:16px">
            💳 Bestelling plaatsen (${formatPrice(totalEur)})
          </button>
        </form>
      </div>
    </div>
  `;

  console.log("innerHTML set, modal content ready");

  // Attach form submission listener and billing address toggle
  setTimeout(() => {
    const form = document.getElementById("checkout-form");
    const differentCheckbox = document.getElementById("checkout-different");
    const billingSection = document.getElementById("billing-address-section");
    const countrySelect = document.getElementById("checkout-country");

    // Store subtotal for event listeners
    const orderSubtotal = subtotal;

    if (differentCheckbox && billingSection) {
      differentCheckbox.addEventListener("change", (e) => {
        billingSection.style.display = e.target.checked ? "block" : "none";
        const inputs = billingSection.querySelectorAll("input");
        inputs.forEach((input) => {
          input.required = e.target.checked;
        });
      });
    }

    // Update shipping cost when country changes
    if (countrySelect) {
      countrySelect.addEventListener("change", (e) => {
        updateShippingCost(e.target.value, orderSubtotal);
      });
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        processOrder();
      };
    }
  }, 10);
}

function getShippingCost(country, subtotal) {
  // Free shipping for orders over €25 within Netherlands
  if (country === "NL" && subtotal >= 25) {
    return 0;
  }

  // Shipping costs per country/region
  const shippingRates = {
    NL: 4.95, // Netherlands
    BE: 6.95, // Belgium
    DE: 7.95, // Germany
    FR: 8.95, // France
    LU: 7.95, // Luxembourg
    AT: 9.95, // Austria
    DK: 9.95, // Denmark
    PL: 10.95, // Poland
    CZ: 10.95, // Czech Republic
    ES: 11.95, // Spain
    IT: 11.95, // Italy
    PT: 12.95, // Portugal
    SE: 12.95, // Sweden
    FI: 13.95, // Finland
    NO: 13.95, // Norway
    GR: 14.95, // Greece
    IE: 14.95, // Ireland
    UK: 9.95, // United Kingdom
    CH: 15.95, // Switzerland
    OTHER: 19.95, // Rest of world
  };

  return shippingRates[country] || 19.95;
}

function getCountryName(code) {
  const countryNames = {
    NL: "Nederland",
    BE: "België",
    DE: "Duitsland",
    FR: "Frankrijk",
    ES: "Spanje",
    IT: "Italië",
    AT: "Oostenrijk",
    LU: "Luxemburg",
    PL: "Polen",
    CZ: "Tsjechië",
    DK: "Denemarken",
    SE: "Zweden",
    NO: "Noorwegen",
    FI: "Finland",
    UK: "Verenigd Koninkrijk",
    IE: "Ierland",
    PT: "Portugal",
    GR: "Griekenland",
    CH: "Zwitserland",
    OTHER: "Internationaal",
  };
  return countryNames[code] || "Internationaal";
}

function updateShippingCost(country, subtotal) {
  const shippingCost = getShippingCost(country, subtotal);
  const total = subtotal + shippingCost;
  const countryName = getCountryName(country);

  // Update shipping line
  const shippingLine = document.getElementById("shipping-line");
  const shippingCountryName = document.getElementById("shipping-country-name");
  const summaryShipping = document.getElementById("summary-shipping");
  const summaryTotal = document.getElementById("summary-total");
  const submitBtn = document.querySelector(
    '#checkout-form button[type="submit"]'
  );

  if (shippingCountryName) {
    shippingCountryName.textContent = `(${countryName})`;
  }

  if (summaryShipping) {
    summaryShipping.textContent =
      shippingCost === 0 ? "GRATIS" : formatPrice(shippingCost);
  }

  if (shippingLine) {
    shippingLine.style.color = shippingCost === 0 ? "#10b981" : "inherit";
  }

  if (summaryTotal) {
    summaryTotal.textContent = formatPrice(total);
  }

  if (submitBtn) {
    submitBtn.textContent = `💳 Bestelling plaatsen (${formatPrice(total)})`;
  }

  // Show notice for international shipping
  const existingNotice = document.getElementById("shipping-notice");
  if (existingNotice) {
    existingNotice.remove();
  }

  if (country !== "NL" && country !== "BE") {
    const orderSummary = document.getElementById("order-summary");
    if (orderSummary) {
      const notice = document.createElement("div");
      notice.id = "shipping-notice";
      notice.style.cssText =
        "margin-top:12px;padding:10px;background:#fff3cd;border-left:3px solid #ffc107;border-radius:4px;font-size:13px;color:#856404";
      notice.innerHTML = `<strong>ℹ️ Internationale verzending:</strong> Levertijd 7-14 werkdagen. Mogelijk invoerrechten van toepassing.`;
      orderSummary.appendChild(notice);
    }
  }
}

function processOrder() {
  const selectedItems = CART.filter((p) => p.selected !== false);
  const differentAddress =
    document.getElementById("checkout-different")?.checked;
  const paymentMethod =
    document.querySelector('input[name="payment"]:checked')?.value || "ideal";

  const subtotal = selectedItems.reduce(
    (sum, p) => sum + p.price * 1.21 * (p.quantity || 1),
    0
  );

  // Get selected country and calculate shipping
  const country = document.getElementById("checkout-country")?.value || "NL";
  const shipping = getShippingCost(country, subtotal);

  const order = {
    id: Date.now(),
    date: new Date().toLocaleDateString("nl-NL"),
    items: selectedItems,
    customer: {
      name: document.getElementById("checkout-name")?.value,
      email: document.getElementById("checkout-email")?.value,
      phone: document.getElementById("checkout-phone")?.value,
      address: document.getElementById("checkout-address")?.value,
      city: document.getElementById("checkout-city")?.value,
      zip: document.getElementById("checkout-zip")?.value,
      country: country,
    },
    billingAddress: differentAddress
      ? {
          address: document.getElementById("checkout-billing-address")?.value,
          city: document.getElementById("checkout-billing-city")?.value,
          zip: document.getElementById("checkout-billing-zip")?.value,
        }
      : null,
    paymentMethod: paymentMethod,
    subtotal: subtotal,
    shipping: shipping,
    shippingCountry: getCountryName(country),
    totalEur: subtotal + shipping,
    status: "verwerkt",
  };

  // Save user address for next time
  saveDefaultAddress(
    order.customer.address,
    order.customer.city,
    order.customer.zip
  );

  ORDERS.push(order);
  localStorage.setItem("orders", JSON.stringify(ORDERS));

  // Remove only purchased items from cart
  const selectedIds = order.items.map((item) => item.id);
  CART = CART.filter((item) => !selectedIds.includes(item.id));
  localStorage.setItem("cart", JSON.stringify(CART));
  updateBadges();

  // Send confirmation email (async, don't block UI)
  fetch("/api/emails/send-confirmation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  }).catch((e) => console.warn("Email send failed (non-critical):", e));

  showOrderConfirmation(order);
}

function showOrderConfirmation(order) {
  const modal = document.getElementById("product-modal");
  if (!modal) return;

  const finalTotal = formatPrice(order.totalEur);
  const shipping = order.shipping || 0;

  const paymentMethodMap = {
    ideal: "🏦 iDEAL",
    klarna: "✨ Klarna",
    visa: "💳 Visa / Mastercard",
    paypal: "🅿️ PayPal",
    transfer: "🏦 Bankoverschrijving",
  };

  const billingAddressHTML = order.billingAddress
    ? `
    <div style="margin:24px 0;padding:20px;background:var(--bg);border-radius:12px;text-align:left">
      <h4 style="margin-top:0">Factuuradres:</h4>
      <p style="margin:4px 0">${order.billingAddress.address}</p>
      <p style="margin:4px 0">${order.billingAddress.zip} ${order.billingAddress.city}</p>
    </div>
  `
    : "";

  modal.innerHTML = `
    <div class="content" style="max-width:600px">
      <div class="header" style="background:var(--accent);color:#fff;padding:24px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center">
        <h2 style="margin:0;color:#fff">✅ Bestelling geplaatst!</h2>
        <button class="close" onclick="closeModal();renderGrid()" style="background:rgba(255,255,255,0.2);border:none;color:#fff;font-size:24px;cursor:pointer;padding:0;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center">✕</button>
      </div>
      <div class="body" style="display:block;padding:24px;text-align:center">
        <div style="font-size:48px;margin:16px 0">🎉</div>
        <h3>Bedankt voor je bestelling!</h3>
        <p style="color:var(--muted)">Bestelnummer: <strong>#${
          order.id
        }</strong></p>
        <p>We hebben je bestelling ontvangen en verwerken deze zo snel mogelijk.</p>
        <p>Je ontvangt een bevestigingsmail op <strong>${
          order.customer.email
        }</strong></p>
        
        <div style="margin:24px 0;padding:20px;background:var(--bg);border-radius:12px;text-align:left">
          <h4 style="margin-top:0">Verzendadres:</h4>
          <p style="margin:4px 0">${order.customer.name}</p>
          <p style="margin:4px 0">${order.customer.address}</p>
          <p style="margin:4px 0">${order.customer.zip} ${
    order.customer.city
  }</p>
        </div>
        
        ${billingAddressHTML}
        
        <div style="margin:24px 0;padding:20px;background:var(--bg);border-radius:12px">
          <div style="display:flex;justify-content:space-between;margin:8px 0">
            <span>Betaalmethode:</span>
            <strong>${
              paymentMethodMap[order.paymentMethod] || order.paymentMethod
            }</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin:8px 0">
            <span>Antal items:</span>
            <strong>${order.items.reduce(
              (sum, p) => sum + (p.quantity || 1),
              0
            )}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin:8px 0">
            <span>Subtotaal:</span>
            <strong>${formatPrice(order.subtotal)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin:8px 0;color:${
            order.shipping === 0 ? "#10b981" : "inherit"
          }">
            <span>Verzending:</span>
            <strong>${
              order.shipping === 0 ? "GRATIS" : formatPrice(order.shipping)
            }</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin:8px 0;padding-top:8px;border-top:2px solid var(--border);font-size:18px">
            <span>Totaal betaald:</span>
            <strong style="color:#10b981">${formatPrice(
              order.totalEur
            )}</strong>
          </div>
        </div>
        
        <button class="btn primary" onclick="closeModal();renderGrid()" style="width:100%;padding:14px;margin-top:16px">
          🏠 Terug naar winkelen
        </button>
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
}
