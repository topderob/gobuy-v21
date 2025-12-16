/* Global State Management */

let ALL = [];
let VIEW = [];
let CART = [];
let WISHLIST = [];
let COMPARE = [];
let ORDERS = [];

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
    initPriceSlider();
    renderBestSellers();
    renderRecentlyViewed();
    renderBackToTop();
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
  // Only add createdAt if product data is already complete
  return {
    ...p,
    createdAt: Date.now() - Math.floor(Math.random() * 45 * 24 * 3600 * 1000),
  };
}

function renderBanners() {
  const b1 = document.getElementById("banner-1");
  const b2 = document.getElementById("banner-2");
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
}
