/* Global State Management */

let ALL = [];
let VIEW = [];
let CART = [];
let WISHLIST = [];
let COMPARE = [];
let ORDERS = [];
let modalProductQty = 1; // Quantity selector for product modal
let ORDER_STATS = null;
let orderStatsPromise = null;

// Scroll to top on page load
window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

let state = {
  cat: "all",
  search: "",
  sort: "smart",
  free: false,
  local: false,
  minPrice: 0,
  maxPrice: 500,
  brands: [],
  minRating: 0,
  page: 1,
  pageSize: 15,
};

// Initialize app on page load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const saved = parseInt(localStorage.getItem("pageSize"), 10);
    if (!isNaN(saved) && saved > 0) state.pageSize = saved;
    CART = JSON.parse(localStorage.getItem("cart") || "[]");
    WISHLIST = JSON.parse(localStorage.getItem("wishlist") || "[]");
    COMPARE = JSON.parse(localStorage.getItem("compare") || "[]");
    ORDERS = JSON.parse(localStorage.getItem("orders") || "[]");
  } catch (e) {
    console.error("Error loading from localStorage:", e);
    showToast(
      "Fout bij laden van gegevens. Sommige instellingen kunnen verloren gaan."
    );
  }

  try {
    await load();
    wire();
    wireCartWishlist();
    apply(true);
    updateBadges();
    initAdvancedPriceSlider();
    renderBestSellers();
    renderRecentlyViewed();
    renderBackToTop();

    // Scroll to top AFTER everything is rendered
    setTimeout(() => window.scrollTo(0, 0), 100);
  } catch (e) {
    console.error("Error initializing app:", e);
    showToast(
      "Er is een fout opgetreden bij het laden van de app. Probeer de pagina opnieuw te laden."
    );
  }
});

async function load() {
  const base = await fetchProductsFromAPI();
  ALL = base.map(augment);
  VIEW = [...ALL];
  renderHeroDeals();
  renderBanners();
  populateBrandFilter();
}

function augment(p, idx) {
  // Pre-calculate VAT-inclusive price (21% Dutch tax) for efficiency
  // This eliminates repeated calculations throughout the app
  const priceWithVAT = parseFloat((p.price * 1.21).toFixed(2));
  const originalPriceWithVAT = p.originalPrice
    ? parseFloat((p.originalPrice * 1.21).toFixed(2))
    : priceWithVAT;

  return {
    ...p,
    price: priceWithVAT, // Replace base price with VAT-inclusive
    originalPrice: originalPriceWithVAT,
    createdAt: Date.now() - Math.floor(Math.random() * 45 * 24 * 3600 * 1000),
  };
}

function renderBanners() {
  const b1 = document.getElementById("banner-1");
  const b2 = document.getElementById("banner-2");
  const vibe = document.getElementById("vibe-check");
  const vibeStats = (() => {
    if (!Array.isArray(ALL) || !ALL.length) return null;
    const totalOrders = ALL.reduce((sum, p) => sum + (p.orders || 0), 0);
    const ratingEntries = ALL.filter((p) => typeof p.rating === "number");
    const totalRating = ratingEntries.reduce((sum, p) => sum + p.rating, 0);
    const avgRating = ratingEntries.length
      ? totalRating / ratingEntries.length
      : 0;
    const happyPercent = ratingEntries.length
      ? Math.min(99, Math.max(80, Math.round((avgRating / 5) * 100)))
      : 0;
    const fastCount = ALL.filter((p) => p.local || p.freeShip).length;
    const fastPercent = ALL.length
      ? Math.round((fastCount / ALL.length) * 100)
      : 0;
    const fmtCompact = (n) => {
      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 100_000) return `${Math.round(n / 1_000)}k`;
      if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`;
      if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
      return `${n}`;
    };
    return {
      happyPercent,
      avgRating,
      ratingCount: ratingEntries.length,
      ordersLabel: fmtCompact(totalOrders),
      fastPercent,
    };
  })();
  if (b1)
    b1.innerHTML = `
      <span class="banner-badge">Trending</span>
      <div class="banner-title">🔥 Weekend Mega Sale</div>
      <div class="banner-subtitle">Tot 60% korting op elektronica</div>
    `;
  if (b2)
    b2.innerHTML = `
      <span class="banner-badge">Express</span>
      <div class="banner-title">⚡ Gratis Verzending</div>
      <div class="banner-subtitle">Bij bestellingen vanaf €25 in NL</div>
    `;
  if (vibe) {
    const mergedOrdersLabel = ORDER_STATS?.count
      ? `${ORDER_STATS.count} bestellingen`
      : vibeStats?.ordersLabel
      ? `${vibeStats.ordersLabel} orders`
      : null;
    const shippingPercent =
      ORDER_STATS?.freeShipPercent ?? vibeStats?.fastPercent ?? 0;
    const revenueChip = "";
    const updatedText = (() => {
      const iso = ORDER_STATS?.updatedAt;
      if (!iso) return "";
      try {
        const d = new Date(iso);
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `<div class="vibe-meta" style="margin-top:4px">Laatst bijgewerkt: ${hh}:${mm}</div>`;
      } catch (_) {
        return "";
      }
    })();
    const hasStats = vibeStats && vibeStats.ratingCount;
    vibe.innerHTML = hasStats
      ? `
      <div class="vibe-title">Vibe Check</div>
      <div class="vibe-mood">
        <span class="vibe-score">${vibeStats.happyPercent}%</span>
        <span class="vibe-meta">tevredenheid o.b.v. ratings</span>
      </div>
      <div class="vibe-chip">⭐ ${vibeStats.avgRating.toFixed(1)} / 5 (${
          vibeStats.ratingCount
        } producten)</div>
      ${
        mergedOrdersLabel
          ? `<div class="vibe-chip">🛍️ ${mergedOrdersLabel}</div>`
          : ""
      }
      <div class="vibe-chip">🚚 ${shippingPercent}% snelle verzending</div>
      ${revenueChip}
      ${updatedText}
    `
      : `
      <div class="vibe-title">Vibe Check</div>
      <div class="vibe-mood">
        <span class="vibe-score">--</span>
        <span class="vibe-meta">data wordt geladen</span>
      </div>
    `;

    if (!ORDER_STATS && !orderStatsPromise) {
      orderStatsPromise = BACKEND.getOrderStats()
        .then((res) => {
          if (res && res.orders) ORDER_STATS = res.orders;
        })
        .catch((e) => console.warn("Order stats fetch failed", e))
        .finally(() => {
          orderStatsPromise = null;
          renderBanners(); // re-render with live stats when ready
        });
    }
  }
}
