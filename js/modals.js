/* Modal Functions */

function openProductModal(p) {
  const modal = document.getElementById("product-modal");
  if (!modal) return;

  // Lower chatbot z-index when modal opens
  const chatWidget = document.querySelector(".chat-widget");
  if (chatWidget) chatWidget.style.zIndex = "9998";

  const price = formatPrice(p.price * 1.21);
  const original = p.discount ? formatPrice(p.originalPrice * 1.21) : "";
  const stars =
    "★".repeat(Math.round(p.rating)) + "☆".repeat(5 - Math.round(p.rating));
  const reviews = generateReviews(p);
  const related = ALL.filter((x) => x.type === p.type && x.id !== p.id).slice(
    0,
    4
  );

  // Check if product has multiple images
  const hasGallery = p.images && p.images.length > 1;
  const galleryHTML = hasGallery
    ? `
    <div class="product-gallery" style="width:100%;height:auto;">
      <div class="gallery-main" style="height:300px;">
        <img src="${
          p.images[0]
        }" id="gallery-main-img" loading="lazy" style="width:100%;height:100%;object-fit:contain;" />
        <button class="gallery-nav prev" onclick="prevImage()">‹</button>
        <button class="gallery-nav next" onclick="nextImage()">›</button>
        <div class="gallery-indicator">
          ${p.images
            .map(
              (_, i) =>
                `<div class="gallery-dot ${
                  i === 0 ? "active" : ""
                }" onclick="goToImage(${i})"></div>`
            )
            .join("")}
        </div>
      </div>
      <div class="gallery-thumbs" style="display:flex;gap:8px;margin-top:12px;overflow-x:auto;">
        ${p.images
          .map(
            (img, i) => `
          <div class="gallery-thumb ${
            i === 0 ? "active" : ""
          }" onclick="goToImage(${i})" style="flex-shrink:0;width:60px;height:60px;border:2px solid ${
              i === 0 ? "var(--primary)" : "var(--border)"
            };border-radius:4px;overflow:hidden;cursor:pointer;">
            <img src="${img}" style="width:100%;height:100%;object-fit:contain;" />
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `
    : `<img src="${p.image}" style="width:100%;height:300px;object-fit:contain;border-radius:12px;background:#f3f3f3" loading="lazy" />`;

  modal.innerHTML = `
    <div class="content" style="max-width:800px">
      <div class="header">
        <h2>${p.name}</h2>
        <button class="close" onclick="closeModal()">✕</button>
      </div>
      <div class="body" style="display:block;padding:20px">
        <div style="display:grid;grid-template-columns:300px 1fr;gap:20px;margin-bottom:20px">
          ${galleryHTML}
          <div>
            <div style="font-size:24px;font-weight:700;color:var(--primary);margin-bottom:8px">${price}</div>
            ${
              original
                ? `<div style="color:var(--muted);text-decoration:line-through;margin-bottom:4px">${original}</div>`
                : ""
            }
            ${
              p.discount
                ? `<div style="color:var(--accent);font-weight:600;margin-bottom:12px">-${p.discount}% korting</div>`
                : ""
            }
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
              <span style="font-size:18px">${stars}</span>
              <span style="font-weight:600">${p.rating.toFixed(1)}</span>
              <span style="color:var(--muted);font-size:14px">(${
                reviews.length
              } reviews)</span>
            </div>
            <div style="color:var(--muted);font-size:13px;margin-bottom:12px">${
              p.orders
            }+ bestellingen · ${p.seller}</div>
            ${
              p.freeShip
                ? '<div style="color:var(--accent);font-weight:600;font-size:14px;margin-bottom:4px">✓ Gratis verzending</div>'
                : ""
            }
            ${
              p.local
                ? '<div style="color:var(--accent);font-weight:600;font-size:14px;margin-bottom:12px">✓ Lokaal magazijn</div>'
                : ""
            }
            <p style="line-height:1.5;color:var(--text);font-size:14px;margin-bottom:16px">${
              p.description
            }</p>
            <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
              <label style="font-weight:600;color:var(--text)">Aantal:</label>
              <button onclick="decreaseModalQty()" style="width:32px;height:32px;border:1px solid var(--border);background:var(--bg);border-radius:4px;cursor:pointer;font-weight:600">−</button>
              <input type="number" id="modal-qty" value="1" min="1" max="999" style="width:50px;text-align:center;border:1px solid var(--border);padding:6px;border-radius:4px;font-weight:600" onchange="setModalQty(this.value)" />
              <button onclick="increaseModalQty()" style="width:32px;height:32px;border:1px solid var(--border);background:var(--bg);border-radius:4px;cursor:pointer;font-weight:600">+</button>
            </div>
            <div style="display:flex;gap:12px">
              <button class="btn primary" onclick="addToCartFromModal('${
                p.id
              }')" style="flex:1;padding:10px">🛒 In winkelwagen</button>
              <button class="btn" onclick="toggleWishlistFromModal('${
                p.id
              }')" style="padding:10px">${
    WISHLIST.some((w) => w.id === p.id) ? "❤" : "♡"
  }</button>
            </div>
          </div>
        </div>
        
        <div style="border-top:1px solid var(--border);padding-top:16px">
          <div style="display:flex;gap:8px;margin-bottom:12px;border-bottom:2px solid var(--border)">
            <button onclick="switchProductTab('details','${
              p.id
            }')" id="tab-details" class="product-tab active" style="padding:8px 16px;border:none;background:none;cursor:pointer;font-weight:600;border-bottom:2px solid var(--primary);margin-bottom:-2px">Details</button>
            <button onclick="switchProductTab('reviews','${
              p.id
            }')" id="tab-reviews" class="product-tab" style="padding:8px 16px;border:none;background:none;cursor:pointer;color:var(--muted)">Reviews (${
    reviews.length
  })</button>
            ${
              related.length
                ? `<button onclick="switchProductTab('related','${p.id}')" id="tab-related" class="product-tab" style="padding:8px 16px;border:none;background:none;cursor:pointer;color:var(--muted)">Gerelateerd</button>`
                : ""
            }
          </div>
          
          <div id="content-details" class="tab-content" style="display:block">
            <h4 style="margin-bottom:12px">Product specificaties</h4>
            <ul style="padding-left:20px;color:var(--text);line-height:2">
              ${
                (p.features || []).map((f) => `<li>${f}</li>`).join("") ||
                "<li>Geen specificaties beschikbaar</li>"
              }
            </ul>
          </div>
          
          <div id="content-reviews" class="tab-content" style="display:none">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <h4 style="margin:0">Klantbeoordelingen</h4>
              ${
                hasUserPurchased(p.id)
                  ? `<button class="btn primary" onclick="openReviewForm('${p.id}')" style="padding:6px 12px;font-size:13px">
                    ✍️ Schrijf review
                  </button>`
                  : `<button class="btn" disabled style="padding:6px 12px;font-size:13px;opacity:0.5;cursor:not-allowed" title="Je moet dit product eerst kopen">
                    🔒 Review (eerst kopen)
                  </button>`
              }
            </div>
            <div style="max-height:300px;overflow-y:auto">
              ${reviews
                .map(
                  (r) => `
                <div style="margin-bottom:10px;padding:10px;background:var(--bg);border-radius:8px">
                  <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                    <span style="font-weight:600;font-size:14px">${
                      r.name
                    }</span>
                    <span style="color:var(--accent)">${"★".repeat(
                      r.rating
                    )}</span>
                  </div>
                  <div style="font-size:13px;color:var(--muted)">${r.text}</div>
                </div>
              `
                )
                .join("")}
              ${getUserReviews(p.id)
                .map(
                  (r) => `
                <div style="margin-bottom:10px;padding:10px;background:#e8f5e9;border:1px solid #4caf50;border-radius:8px">
                  <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                    <div>
                      <span style="font-weight:600;font-size:14px">${
                        r.name
                      }</span>
                      <span style="color:#4caf50;font-size:11px;margin-left:6px">✓ Geverifieerde aankoop</span>
                    </div>
                    <span style="color:var(--accent)">${"★".repeat(
                      r.rating
                    )}</span>
                  </div>
                  <div style="font-size:13px;color:var(--text)">${r.text}</div>
                  <div style="font-size:11px;color:var(--muted);margin-top:4px">${
                    r.date
                  }</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          
          ${
            related.length
              ? `
          <div id="content-related" class="tab-content" style="display:none">
            <h4 style="margin-bottom:12px">Ook interessant voor jou</h4>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
              ${related
                .map(
                  (r) => `
                <div onclick="openProductModal(ALL.find(p=>p.id==='${
                  r.id
                }'))" style="cursor:pointer;border:1px solid var(--border);border-radius:8px;padding:10px;display:flex;gap:10px;align-items:center;transition:all 0.2s" onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='none'">
                  <img src="${
                    r.image
                  }" style="width:60px;height:60px;object-fit:cover;border-radius:6px" loading="lazy" />
                  <div style="flex:1">
                    <div style="font-weight:600;font-size:13px;margin-bottom:4px">${r.name.substring(
                      0,
                      35
                    )}...</div>
                    <div style="color:var(--primary);font-weight:600">${formatPrice(
                      r.price * 1.21
                    )}</div>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }
        </div>
      </div>
    </div>`;
  modal.classList.remove("hidden");

  // Initialize gallery if product has multiple images
  if (hasGallery) {
    setTimeout(() => {
      initGallery(p);
      console.log("Gallery initialized for product:", p.name);
    }, 50);
  }
}

function switchProductTab(tab, productId) {
  // Update tab buttons
  document.querySelectorAll(".product-tab").forEach((btn) => {
    btn.style.borderBottom = "none";
    btn.style.fontWeight = "400";
    btn.style.color = "var(--muted)";
  });
  const activeTab = document.getElementById(`tab-${tab}`);
  if (activeTab) {
    activeTab.style.borderBottom = "2px solid var(--primary)";
    activeTab.style.fontWeight = "600";
    activeTab.style.color = "var(--text)";
  }

  // Update content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.style.display = "none";
  });
  const activeContent = document.getElementById(`content-${tab}`);
  if (activeContent) {
    activeContent.style.display = "block";
  }
}

function closeModal() {
  document.getElementById("product-modal")?.classList.add("hidden");

  // Restore chatbot z-index when modal closes
  const chatWidget = document.querySelector(".chat-widget");
  if (chatWidget) chatWidget.style.zIndex = "9999";
}

function generateReviews(p) {
  const names = ["Emma", "Lars", "Sophie", "Daan", "Lisa", "Tim"];
  const texts = [
    "Super blij mee! Precies wat ik zocht.",
    "Goede kwaliteit voor de prijs.",
    "Snelle levering en goed verpakt.",
    "Werkt perfect, aanrader!",
    "Precies zoals beschreven.",
  ];
  const count = Math.min(5, Math.floor(p.orders / 200) + 2);
  return Array.from({ length: count }, (_, i) => ({
    name: names[i % names.length],
    rating: Math.max(3, Math.round(p.rating)),
    text: texts[i % texts.length],
  }));
}

// Gallery carousel functions
let currentImageIndex = 0;
let currentProduct = null;

function initGallery(product) {
  currentProduct = product;
  currentImageIndex = 0;
}

function updateGalleryImage() {
  if (!currentProduct || !currentProduct.images) return;

  const mainImg = document.getElementById("gallery-main-img");
  if (mainImg) {
    mainImg.style.opacity = "0";
    setTimeout(() => {
      mainImg.src = currentProduct.images[currentImageIndex];
      mainImg.style.opacity = "1";
    }, 150);
  }

  // Update thumbnails
  document.querySelectorAll(".gallery-thumb").forEach((thumb, i) => {
    const isActive = i === currentImageIndex;
    thumb.classList.toggle("active", isActive);
    thumb.style.borderColor = isActive ? "var(--primary)" : "var(--border)";
  });

  // Update dots
  document.querySelectorAll(".gallery-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === currentImageIndex);
  });
}

function nextImage() {
  if (!currentProduct || !currentProduct.images) return;
  currentImageIndex = (currentImageIndex + 1) % currentProduct.images.length;
  updateGalleryImage();
}

function prevImage() {
  if (!currentProduct || !currentProduct.images) return;
  currentImageIndex =
    currentImageIndex === 0
      ? currentProduct.images.length - 1
      : currentImageIndex - 1;
  updateGalleryImage();
}

function goToImage(index) {
  if (!currentProduct || !currentProduct.images) return;
  currentImageIndex = index;
  updateGalleryImage();
}

function decreaseModalQty() {
  const input = document.getElementById("modal-qty");
  if (input) {
    let val = parseInt(input.value, 10) || 1;
    val = Math.max(1, val - 1);
    input.value = val;
    modalProductQty = val;
  }
}

function increaseModalQty() {
  const input = document.getElementById("modal-qty");
  if (input) {
    let val = parseInt(input.value, 10) || 1;
    val = Math.min(999, val + 1);
    input.value = val;
    modalProductQty = val;
  }
}

function setModalQty(val) {
  let num = parseInt(val, 10) || 1;
  num = Math.max(1, Math.min(999, num));
  modalProductQty = num;
  const input = document.getElementById("modal-qty");
  if (input) input.value = num;
}
