/* Rendering Functions */

function renderHeroDeals() {
  const wrap = document.getElementById("hero-deals");
  if (!wrap) return;
  const picks = [...ALL]
    .sort((a, b) => b.discount - a.discount || b.orders - a.orders)
    .slice(0, 8);
  wrap.innerHTML = "";
  picks.forEach((p) => {
    const price = formatPrice(p.price);
    const original = p.discount ? formatPrice(p.originalPrice) : "";
    const el = document.createElement("div");
    el.className = "deal";
    el.style.cursor = "pointer";
    el.innerHTML = `
      <img src="${p.image}" alt="${p.name}" loading="lazy" />
      <div class="quick-add" title="Direct in winkelwagen"></div>
      <div class="body">
        <div class="title">${p.name}</div>
        <div class="price">${price} ${
      original ? `<small>${original}</small>` : ""
    }</div>
      </div>`;
    el.addEventListener("click", () => openProductModal(p));

    // Add quick-add button click handler
    const quickAddBtn = el.querySelector(".quick-add");
    if (quickAddBtn) {
      quickAddBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        addToCart(p);
      });
    }

    wrap.appendChild(el);
  });
}

function renderGrid() {
  const grid = document.getElementById("grid");
  if (!grid) return;
  grid.innerHTML = "";
  const start = (state.page - 1) * state.pageSize;
  const end = start + state.pageSize;
  const pageItems = VIEW.slice(start, end);
  if (!pageItems.length) {
    grid.innerHTML = '<div class="empty">Geen producten gevonden.</div>';
    return;
  }
  pageItems.forEach((p) => grid.appendChild(card(p)));
}

function card(p) {
  const el = document.createElement("div");
  el.className = "card";
  const price = formatPrice((p.price || 0) * 1.21);
  const original = p.discount ? formatPrice((p.originalPrice || 0) * 1.21) : "";
  const rating = p.rating || 0;
  const stars =
    "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  const isWished = WISHLIST.some((w) => w.id === p.id);
  const isCompared = COMPARE.some((c) => c.id === p.id);

  // Track recently viewed
  trackRecentlyViewed(p);
  el.innerHTML = `
    <img class="thumb" src="${
      p.image ||
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e5e5" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E'
    }" alt="${p.name}" loading="lazy" />
    <div class="body">
      <div class="title">${p.name || "Product"}</div>
      <div style="display:flex;align-items:center;gap:8px;margin:6px 0;font-size:13px">
        <span style="font-size:16px;color:#ffc107">${stars}</span>
        <span style="color:#666;font-weight:600">${rating.toFixed(1)}</span>
        <span style="color:#999">(${p.orders || 0})</span>
      </div>
      <div><span class="price">${price}</span> ${
    original ? `<small>${original}</small>` : ""
  } ${p.freeShip ? '<span class="badge">Gratis verzending</span>' : ""}</div>
      <div class="seller">${p.seller} · Verzending uit ${p.shipFrom}</div>
      <div class="actions">
        <button class="btn primary cart-add" data-id="${p.id}">🛒</button>
        <button class="btn wish-toggle ${isWished ? "active" : ""}" data-id="${
    p.id
  }">${isWished ? "❤️" : "♡"}</button>
        <button class="btn compare-toggle ${
          isCompared ? "active" : ""
        }" data-id="${p.id}" title="Vergelijken">⚖️</button>
      </div>
    </div>`;
  el.querySelector(".thumb").addEventListener("click", () =>
    openProductModal(p)
  );
  el.querySelector(".title").addEventListener("click", () =>
    openProductModal(p)
  );
  el.querySelector(".cart-add").addEventListener("click", (e) => {
    e.stopPropagation();
    addToCart(p);
  });
  el.querySelector(".wish-toggle").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleWishlist(p);
  });
  el.querySelector(".compare-toggle").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleCompare(p);
  });
  return el;
}

function renderPagination() {
  const total = VIEW.length;
  const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
  state.page = Math.min(state.page, totalPages);
  const info = document.querySelector(".pagination .info");
  const prev = document.querySelector(".pagination .prev");
  const next = document.querySelector(".pagination .next");
  const first = document.querySelector(".pagination .first");
  const last = document.querySelector(".pagination .last");
  const nums = document.querySelector(".pagination .numbers");
  if (info) info.textContent = `Pagina ${state.page}/${totalPages}`;
  const scroll = () =>
    document.querySelector(".grid")?.scrollIntoView({ behavior: "smooth" });
  if (prev) {
    prev.disabled = state.page <= 1;
    prev.onclick = () => {
      if (state.page > 1) {
        state.page--;
        renderGrid();
        renderPagination();
        scroll();
      }
    };
  }
  if (next) {
    next.disabled = state.page >= totalPages;
    next.onclick = () => {
      if (state.page < totalPages) {
        state.page++;
        renderGrid();
        renderPagination();
        scroll();
      }
    };
  }
  if (first) {
    first.disabled = state.page <= 1;
    first.onclick = () => {
      if (state.page !== 1) {
        state.page = 1;
        renderGrid();
        renderPagination();
        scroll();
      }
    };
  }
  if (last) {
    last.disabled = state.page >= totalPages;
    last.onclick = () => {
      if (state.page !== totalPages) {
        state.page = totalPages;
        renderGrid();
        renderPagination();
        scroll();
      }
    };
  }
  if (nums) {
    nums.innerHTML = "";
    const windowSize = 5;
    let start = Math.max(1, state.page - 2);
    let end = Math.min(totalPages, start + windowSize - 1);
    if (end - start < windowSize - 1) start = Math.max(1, end - windowSize + 1);
    for (let i = start; i <= end; i++) {
      const b = document.createElement("button");
      b.textContent = String(i);
      if (i === state.page) b.classList.add("active");
      b.onclick = () => {
        if (state.page !== i) {
          state.page = i;
          renderGrid();
          renderPagination();
          scroll();
        }
      };
      nums.appendChild(b);
    }
  }
}

// Recently Viewed Products
function trackRecentlyViewed(p) {
  let viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
  viewed = viewed.filter((id) => id !== p.id);
  viewed.unshift(p.id);
  viewed = viewed.slice(0, 10);
  localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
}

function renderRecentlyViewed() {
  const section = document.getElementById("recently-viewed");
  if (!section) return;

  let viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
  if (viewed.length === 0) {
    section.style.display = "none";
    return;
  }

  const products = viewed
    .map((id) => ALL.find((p) => p.id === id))
    .filter((p) => p);

  let html = `
    <div style="margin: 40px 0; padding: 20px; background: var(--card); border-radius: 12px; border: 1px solid var(--border);">
      <h2 style="margin: 0 0 20px 0">👀 Onlangs Bekeken</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px;">
  `;

  products.slice(0, 6).forEach((p) => {
    const price = formatPrice((p.price || 0) * 1.21);
    const imgSrc =
      p.image ||
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e5e5" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
    html += `
      <div style="background: var(--card); border: 1px solid var(--border); padding: 12px; border-radius: 8px; cursor: pointer; text-align: center; position: relative;" onclick="openProductModal(ALL.find(x => x.id === '${
        p.id
      }'))">
        <img src="${imgSrc}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 8px; background: var(--bg);" />
        <div class="quick-add" title="Direct in winkelwagen" style="position: absolute; bottom: 12px; right: 12px; width: 40px; height: 40px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: transform 0.2s;" onclick="event.stopPropagation(); addToCart(ALL.find(x => x.id === '${
          p.id
        }'))">+</div>
        <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px;">${p.name.substring(
          0,
          20
        )}...</div>
        <div style="font-size: 14px; font-weight: 700; color: var(--primary);">${price}</div>
      </div>
    `;
  });

  html += `</div></div>`;
  section.innerHTML = html;
  section.style.display = "block";
}

function renderBestSellers() {
  const section = document.getElementById("best-sellers");
  if (!section) return;

  const bestsellers = [...ALL].sort((a, b) => b.orders - a.orders).slice(0, 6);

  let html = `
    <div style="margin: 40px 0; background: linear-gradient(135deg, var(--primary), var(--accent)); color: white; padding: 30px; border-radius: 12px;">
      <h2 style="margin: 0 0 20px 0">🏆 Meest Populair</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
  `;

  bestsellers.forEach((p) => {
    const price = formatPrice(p.price * 1.21);
    html += `
      <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; cursor: pointer;" onclick="openProductModal(ALL.find(x => x.id === '${
        p.id
      }'))">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 6px">${p.name.substring(
          0,
          30
        )}...</div>
        <div style="font-size: 18px; font-weight: 700;">${price}</div>
        <div style="font-size: 12px; margin-top: 6px;">📦 ${
          p.orders
        } verkocht</div>
      </div>
    `;
  });

  html += `</div></div>`;
  section.innerHTML = html;
}

function renderBreadcrumbs() {
  const bread = document.getElementById("breadcrumbs");
  if (!bread) return;

  let html = `<a onclick="state.cat='all';state.page=1;apply(true)" style="cursor:pointer;color:var(--primary);text-decoration:none">Home</a> / `;

  if (state.cat !== "all") {
    const catName =
      {
        elektronica: "Elektronica",
        keuken: "Keuken",
        sportengezondheid: "Sport & Gezondheid",
        wonenenzo: "Wonen",
        mode: "Mode",
      }[state.cat] || state.cat;
    html += `<span>${catName}</span>`;
  }

  if (state.search) {
    html += ` / <span>Zoeken: "${state.search}"</span>`;
  }

  bread.innerHTML = html;
}

function renderBackToTop() {
  let btn = document.getElementById("back-to-top");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "back-to-top";
    btn.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      display: none;
      z-index: 999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s;
    `;
    btn.innerHTML = "↑";
    btn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
    document.body.appendChild(btn);
  }

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      btn.style.display = "block";
    } else {
      btn.style.display = "none";
    }
  });
}
