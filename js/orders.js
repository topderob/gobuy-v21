/* Order History Management */

function openOrderHistory() {
  const modal = document.getElementById("product-modal");
  if (!modal) return;

  if (ORDERS.length === 0) {
    modal.innerHTML = `
      <div class="content" style="max-width:500px">
        <div class="header">
          <h2>📦 Mijn Bestellingen</h2>
          <button class="close" onclick="closeModal()">✕</button>
        </div>
        <div class="body" style="display:block;padding:48px;text-align:center">
          <div style="font-size:64px;margin-bottom:16px">📭</div>
          <h3>Geen bestellingen</h3>
          <p style="color:var(--muted);margin-bottom:24px">Je hebt nog geen bestellingen geplaatst</p>
          <button class="btn primary" onclick="closeModal()" style="padding:12px 24px">
            Start met winkelen
          </button>
        </div>
      </div>
    `;
    modal.classList.remove("hidden");
    return;
  }

  const sortedOrders = [...ORDERS].sort((a, b) => b.id - a.id);

  modal.innerHTML = `
    <div class="content" style="max-width:900px">
      <div class="header">
        <h2>📦 Mijn Bestellingen (${ORDERS.length})</h2>
        <button class="close" onclick="closeModal()">✕</button>
      </div>
      <div class="body" style="display:block;max-height:600px;overflow-y:auto">
        ${sortedOrders
          .map(
            (order, idx) => `
          <div class="order-card" style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px">
              <div>
                <h3 style="margin:0 0 8px">Bestelling #${order.id}</h3>
                <div style="display:flex;gap:16px;color:var(--muted);font-size:14px">
                  <span>📅 ${order.date}</span>
                  <span>📍 ${order.customer.city}</span>
                  <span class="order-status-${
                    order.status
                  }" style="padding:4px 12px;background:#10b981;color:white;border-radius:20px;font-size:12px;font-weight:600">
                    ${order.status === "verwerkt" ? "✓ Verwerkt" : order.status}
                  </span>
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:20px;font-weight:700;color:#10b981">${formatPrice(
                  order.totalEur
                )}</div>
                <div style="color:var(--muted);font-size:13px">${order.items.reduce(
                  (sum, p) => sum + (p.quantity || 1),
                  0
                )} items</div>
              </div>
            </div>

            <div style="display:grid;gap:12px;margin-bottom:16px">
              ${order.items
                .map((p) => {
                  const qty = p.quantity || 1;
                  return `
                <div style="display:flex;gap:12px;padding:12px;background:var(--bg);border-radius:8px">
                  <img src="${
                    p.image
                  }" style="width:60px;height:60px;object-fit:cover;border-radius:6px" />
                  <div style="flex:1">
                    <div style="font-weight:600;margin-bottom:4px">${
                      p.name
                    }</div>
                    <div style="color:var(--muted);font-size:13px">
                      ${formatPrice(p.price * 1.21)} × ${qty} = ${formatPrice(
                    p.price * 1.21 * qty
                  )}
                    </div>
                  </div>
                  <button class="btn" onclick="addToCart(ALL.find(x => x.id === '${
                    p.id
                  }'))" style="padding:6px 12px;height:fit-content" title="Bestel opnieuw">
                    🔄
                  </button>
                </div>
              `;
                })
                .join("")}
            </div>

            <div style="display:flex;gap:8px">
              <button class="btn" onclick="viewOrderDetails(${idx})" style="flex:1">
                Details bekijken
              </button>
              <button class="btn primary" onclick="reorderAll(${idx})" style="flex:1">
                🔄 Bestel opnieuw
              </button>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
}

function viewOrderDetails(idx) {
  const order = [...ORDERS].sort((a, b) => b.id - a.id)[idx];
  if (!order) return;

  const modal = document.getElementById("product-modal");
  if (!modal) return;

  modal.innerHTML = `
    <div class="content" style="max-width:700px">
      <div class="header">
        <h2>📋 Bestelling #${order.id}</h2>
        <button class="close" onclick="closeModal()">✕</button>
      </div>
      <div class="body" style="display:block;padding:24px">
        <div style="display:grid;gap:24px">
          <div>
            <h3>Status</h3>
            <div style="display:flex;align-items:center;gap:8px;padding:16px;background:var(--bg);border-radius:8px">
              <span style="padding:6px 16px;background:#10b981;color:white;border-radius:20px;font-weight:600">
                ✓ ${order.status}
              </span>
              <span style="color:var(--muted)">Besteld op ${order.date}</span>
            </div>
          </div>

          <div>
            <h3>Verzendadres</h3>
            <div style="padding:16px;background:var(--bg);border-radius:8px">
              <p style="margin:4px 0;font-weight:600">${order.customer.name}</p>
              <p style="margin:4px 0">${order.customer.address}</p>
              <p style="margin:4px 0">${order.customer.zip} ${
    order.customer.city
  }</p>
              <p style="margin:4px 0;color:var(--muted)">📧 ${
                order.customer.email
              }</p>
              <p style="margin:4px 0;color:var(--muted)">📱 ${
                order.customer.phone
              }</p>
            </div>
          </div>

          <div>
            <h3>Producten (${order.items.reduce(
              (sum, p) => sum + (p.quantity || 1),
              0
            )})</h3>
            <div style="display:grid;gap:8px">
              ${order.items
                .map((p) => {
                  const qty = p.quantity || 1;
                  return `
                <div style="display:flex;gap:12px;padding:12px;border:1px solid var(--border);border-radius:8px">
                  <img src="${
                    p.image
                  }" style="width:50px;height:50px;object-fit:cover;border-radius:6px" />
                  <div style="flex:1">
                    <div style="font-weight:600">${p.name}</div>
                    <div style="color:var(--muted);font-size:13px">${formatPrice(
                      p.price * 1.21
                    )} × ${qty}</div>
                  </div>
                  <div style="font-weight:700">${formatPrice(
                    p.price * 1.21 * qty
                  )}</div>
                </div>
              `;
                })
                .join("")}
            </div>
          </div>

          <div>
            <h3>Betaling</h3>
            <div style="padding:16px;background:var(--bg);border-radius:8px">
              <div style="display:flex;justify-content:space-between;margin:8px 0">
                <span>Subtotaal:</span>
                <span>${formatPrice(order.subtotal)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin:8px 0;color:${
                order.shipping === 0 ? "#10b981" : "inherit"
              }">
                <span>Verzending:</span>
                <span>${
                  order.shipping === 0 ? "GRATIS" : formatPrice(order.shipping)
                }</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin:12px 0 0;padding-top:12px;border-top:2px solid var(--border);font-size:18px;font-weight:700">
                <span>Totaal:</span>
                <span style="color:#10b981">${formatPrice(
                  order.totalEur
                )}</span>
              </div>
            </div>
          </div>

          <div style="display:flex;gap:8px">
            <button class="btn" onclick="openOrderHistory()" style="flex:1">
              ← Terug naar overzicht
            </button>
            <button class="btn primary" onclick="reorderAll(${idx})" style="flex:1">
              🔄 Bestel opnieuw
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
}

function reorderAll(idx) {
  const order = [...ORDERS].sort((a, b) => b.id - a.id)[idx];
  if (!order) return;

  let added = 0;
  order.items.forEach((item) => {
    const product = ALL.find((p) => p.id === item.id);
    if (product) {
      const qty = item.quantity || 1;
      for (let i = 0; i < qty; i++) {
        addToCart(product);
      }
      added++;
    }
  });

  closeModal();
  if (added > 0) {
    showToast(
      "Opnieuw bestellen",
      `${added} product(en) toegevoegd aan winkelwagen 🛒`,
      "success"
    );
  }
}

/**
 * Open returns page for chatbot
 */
function openReturnsPage() {
  const modal = document.getElementById("product-modal");
  if (!modal) return;

  // Show orders with return status information
  if (ORDERS.length === 0) {
    modal.innerHTML = `
      <div class="content" style="max-width:600px">
        <div class="header">
          <h2>🔄 Retouren</h2>
          <button class="close" onclick="closeModal()">✕</button>
        </div>
        <div class="body" style="display:block;padding:48px;text-align:center">
          <div style="font-size:64px;margin-bottom:16px">📭</div>
          <h3>Geen bestellingen beschikbaar</h3>
          <p style="color:var(--muted);margin-bottom:24px">Je hebt geen bestellingen om te retourneren</p>
          <div style="background:#fff8e1;padding:16px;border-radius:8px;margin-bottom:24px;font-size:14px">
            📮 <strong>Retouradres:</strong><br>
            Netherlands Warehouse<br>
            Stapelstraat 50<br>
            2132 PN Hoofddorp<br>
            <br>
            <em>Gratis retouren binnen 30 dagen</em>
          </div>
          <button class="btn primary" onclick="closeModal()" style="padding:12px 24px">
            Terug
          </button>
        </div>
      </div>
    `;
    modal.classList.remove("hidden");
    return;
  }

  const sortedOrders = [...ORDERS].sort((a, b) => b.id - a.id);

  modal.innerHTML = `
    <div class="content" style="max-width:900px">
      <div class="header">
        <h2>🔄 Retouren (${ORDERS.length} bestellingen)</h2>
        <button class="close" onclick="closeModal()">✕</button>
      </div>
      <div class="body" style="display:block;max-height:600px;overflow-y:auto">
        <div style="background:#fff8e1;padding:16px;border-radius:8px;margin-bottom:20px;font-size:14px">
          📮 <strong>Retouradres:</strong><br>
          Netherlands Warehouse<br>
          Stapelstraat 50<br>
          2132 PN Hoofddorp, Netherlands<br>
          <br>
          <strong>Let op:</strong> Je hebt 30 dagen om producten terug te sturen vanaf ontvangst
        </div>
        ${sortedOrders
          .map(
            (order) => `
          <div class="order-card" style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px">
              <div>
                <h3 style="margin:0 0 8px">Bestelling #${order.id}</h3>
                <div style="display:flex;gap:16px;color:var(--muted);font-size:14px">
                  <span>📅 ${order.date}</span>
                  <span>💰 €${order.total}</span>
                </div>
              </div>
              <button class="btn small" onclick="initiateReturn(${
                order.id
              })" style="padding:8px 16px;font-size:12px">
                Retour aanvragen
              </button>
            </div>
            <div style="border-top:1px solid var(--border);padding-top:12px">
              ${order.items
                .map(
                  (item) => `
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px">
                  <span>${item.name}</span>
                  <span style="color:var(--muted)">x${item.quantity}</span>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
}

/**
 * Initiate return for specific order
 */
function initiateReturn(orderId) {
  const order = ORDERS.find((o) => o.id === orderId);
  if (!order) return;

  const modal = document.getElementById("product-modal");
  modal.innerHTML = `
    <div class="content" style="max-width:600px">
      <div class="header">
        <h2>🔄 Retour Aanvragen</h2>
        <button class="close" onclick="openReturnsPage()">←</button>
      </div>
      <div class="body" style="display:block;padding:24px">
        <h3>Bestelling #${order.id}</h3>
        <p style="color:var(--muted);margin-bottom:20px">Selecteer producten om terug te sturen:</p>
        
        ${order.items
          .map(
            (item, idx) => `
          <label style="display:flex;align-items:center;padding:12px;border:1px solid var(--border);border-radius:8px;margin-bottom:12px;cursor:pointer">
            <input type="checkbox" value="${idx}" style="margin-right:12px" />
            <span>${item.name}</span>
            <span style="margin-left:auto;color:var(--muted)">€${(
              item.price * 1.21
            ).toFixed(2)}</span>
          </label>
        `
          )
          .join("")}
        
        <div style="background:#e8f5e9;padding:16px;border-radius:8px;margin-top:20px;font-size:13px">
          ✅ <strong>Kosteloos retourneren</strong><br>
          Verstuur naar het retouradres hierboven
        </div>
        
        <button class="btn primary" onclick="confirmReturn(${orderId})" style="width:100%;padding:12px;margin-top:20px">
          Retour Bevestigen
        </button>
        <button class="btn" onclick="openReturnsPage()" style="width:100%;padding:12px;margin-top:8px">
          Annuleren
        </button>
      </div>
    </div>
  `;
}

/**
 * Confirm return
 */
function confirmReturn(orderId) {
  showToast(
    "Retour Aanvraag",
    "✅ Je retourvraag is ontvangen! We nemen contact met je op.",
    "success"
  );
  closeModal();
}
