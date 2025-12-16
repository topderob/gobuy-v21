/* Product Comparison System */

function toggleCompare(p) {
  const idx = COMPARE.findIndex((c) => c.id === p.id);
  if (idx > -1) {
    COMPARE.splice(idx, 1);
    showToast("Vergelijking", `${p.name} verwijderd`, "info");
  } else {
    if (COMPARE.length >= 4) {
      showToast("Vergelijking vol", "Maximaal 4 producten mogelijk", "error");
      return;
    }
    COMPARE.push(p);
    showToast("Vergelijking", `${p.name} toegevoegd`, "success");
  }
  localStorage.setItem("compare", JSON.stringify(COMPARE));
  updateCompareBadge();
  renderGrid();
}

function updateCompareBadge() {
  const badge = document.getElementById("compare-count");
  if (badge) badge.textContent = COMPARE.length;
}

function openCompare() {
  if (COMPARE.length === 0) {
    showToast(
      "Vergelijking leeg",
      "Selecteer producten om te vergelijken",
      "info"
    );
    return;
  }

  const modal = document.getElementById("product-modal");
  if (!modal) return;

  modal.innerHTML = `
    <div class="content" style="max-width:1200px">
      <div class="header">
        <h2>🔍 Product vergelijking (${COMPARE.length})</h2>
        <button class="close" onclick="closeModal()">✕</button>
      </div>
      <div class="body" style="overflow-x:auto">
        <table class="compare-table">
          <thead>
            <tr>
              <th>Product</th>
              ${COMPARE.map(
                (p) => `
                <th>
                  <img src="${p.image}" style="width:100px;height:100px;object-fit:cover;border-radius:8px" />
                  <div style="margin-top:8px;font-weight:600">${p.name}</div>
                </th>
              `
              ).join("")}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Prijs</strong></td>
              ${COMPARE.map(
                (p) => `<td>${formatPrice(p.price * 1.21)}</td>`
              ).join("")}
            </tr>
            <tr>
              <td><strong>Rating</strong></td>
              ${COMPARE.map(
                (p) =>
                  `<td>${"★".repeat(Math.round(p.rating))} ${p.rating.toFixed(
                    1
                  )}</td>`
              ).join("")}
            </tr>
            <tr>
              <td><strong>Orders</strong></td>
              ${COMPARE.map((p) => `<td>${p.orders}+</td>`).join("")}
            </tr>
            <tr>
              <td><strong>Verkoper</strong></td>
              ${COMPARE.map((p) => `<td>${p.seller}</td>`).join("")}
            </tr>
            <tr>
              <td><strong>Verzending</strong></td>
              ${COMPARE.map(
                (p) => `<td>${p.freeShip ? "✓ Gratis" : "Betaald"}</td>`
              ).join("")}
            </tr>
            <tr>
              <td><strong>Lokaal</strong></td>
              ${COMPARE.map((p) => `<td>${p.local ? "✓ Ja" : "Nee"}</td>`).join(
                ""
              )}
            </tr>
            <tr>
              <td><strong>Korting</strong></td>
              ${COMPARE.map(
                (p) => `<td>${p.discount ? `-${p.discount}%` : "Geen"}</td>`
              ).join("")}
            </tr>
            <tr>
              <td><strong>Features</strong></td>
              ${COMPARE.map(
                (p) =>
                  `<td><ul style="padding-left:20px;text-align:left">${p.features
                    .map((f) => `<li>${f}</li>`)
                    .join("")}</ul></td>`
              ).join("")}
            </tr>
            <tr>
              <td><strong>Acties</strong></td>
              ${COMPARE.map(
                (p, i) => `
                <td>
                  <button class="btn primary" onclick="addToCartFromCompare(${i})" style="margin:4px;width:100%">🛒 In winkelwagen</button>
                  <button class="btn" onclick="removeFromCompare(${i})" style="margin:4px;width:100%">✕ Verwijder</button>
                </td>
              `
              ).join("")}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
}

function addToCartFromCompare(idx) {
  const p = COMPARE[idx];
  if (p) addToCart(p);
}

function removeFromCompare(idx) {
  COMPARE.splice(idx, 1);
  localStorage.setItem("compare", JSON.stringify(COMPARE));
  updateCompareBadge();
  renderGrid();
  openCompare();
}
