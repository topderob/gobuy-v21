/* Premium Features - Advanced UX & Performance */

// ====================
// 1. IMAGE ZOOM FUNCTIONALITY
// ====================
let zoomLevel = 1;
let zoomImageIndex = 0;
let zoomImages = [];

function initImageZoom() {
  const mainImg = document.getElementById("gallery-main-img");
  if (!mainImg) return;

  // Create zoom lens
  const lens = document.createElement("div");
  lens.className = "zoom-lens";
  lens.style.display = "none";
  mainImg.parentElement.appendChild(lens);

  // Create zoomed result container
  const result = document.createElement("div");
  result.className = "zoom-result";
  result.style.display = "none";
  mainImg.parentElement.parentElement.appendChild(result);

  let cx, cy;

  mainImg.addEventListener("mousemove", (e) => {
    const pos = getCursorPos(e, mainImg);
    let x = pos.x - lens.offsetWidth / 2;
    let y = pos.y - lens.offsetHeight / 2;

    if (x > mainImg.width - lens.offsetWidth)
      x = mainImg.width - lens.offsetWidth;
    if (x < 0) x = 0;
    if (y > mainImg.height - lens.offsetHeight)
      y = mainImg.height - lens.offsetHeight;
    if (y < 0) y = 0;

    lens.style.left = x + "px";
    lens.style.top = y + "px";
    lens.style.display = "block";
    result.style.display = "block";

    cx = result.offsetWidth / lens.offsetWidth;
    cy = result.offsetHeight / lens.offsetHeight;
    result.style.backgroundImage = `url('${mainImg.src}')`;
    result.style.backgroundSize = `${mainImg.width * cx}px ${
      mainImg.height * cy
    }px`;
    result.style.backgroundPosition = `-${x * cx}px -${y * cy}px`;
  });

  mainImg.addEventListener("mouseleave", () => {
    lens.style.display = "none";
    result.style.display = "none";
  });
}

function getCursorPos(e, img) {
  const rect = img.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

// ====================
// 2. SKELETON LOADERS
// ====================
function renderSkeletonGrid(count = 15) {
  const grid = document.querySelector(".grid");
  if (!grid) return;

  grid.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "card skeleton";
    skeleton.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-text skeleton-title"></div>
      <div class="skeleton-text skeleton-price"></div>
      <div class="skeleton-text skeleton-meta"></div>
    `;
    grid.appendChild(skeleton);
  }
}

function showSkeletonLoader() {
  const grid = document.querySelector(".grid");
  if (grid) {
    grid.style.opacity = "0.5";
    renderSkeletonGrid(state.pageSize);
  }
}

function hideSkeletonLoader() {
  const grid = document.querySelector(".grid");
  if (grid) {
    grid.style.opacity = "1";
  }
}

// ====================
// 3. AUTOCOMPLETE SEARCH
// ====================
let searchTimeout;
let autocompleteCache = new Map();

function initAutocomplete() {
  const searchInput = document.getElementById("search");
  if (!searchInput) return;

  // Create autocomplete container
  const autocomplete = document.createElement("div");
  autocomplete.id = "autocomplete";
  autocomplete.className = "autocomplete";
  searchInput.parentElement.style.position = "relative";
  searchInput.parentElement.appendChild(autocomplete);

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim().toLowerCase();

    if (query.length < 2) {
      autocomplete.innerHTML = "";
      autocomplete.style.display = "none";
      return;
    }

    searchTimeout = setTimeout(() => {
      showAutocompleteSuggestions(query, autocomplete);
    }, 200);
  });

  // Click outside to close
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !autocomplete.contains(e.target)) {
      autocomplete.style.display = "none";
    }
  });
}

function showAutocompleteSuggestions(query, container) {
  // Check cache first
  if (autocompleteCache.has(query)) {
    renderAutocomplete(autocompleteCache.get(query), container);
    return;
  }

  // Search products
  const matches = ALL.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.type.toLowerCase().includes(query) ||
      (p.brand && p.brand.toLowerCase().includes(query))
  ).slice(0, 8);

  // Get popular categories
  const categories = [
    ...new Set(
      matches.map((p) => p.type).concat(["elektronica", "mode", "huis & tuin"])
    ),
  ].slice(0, 3);

  const result = { products: matches, categories };
  autocompleteCache.set(query, result);
  renderAutocomplete(result, container);
}

function renderAutocomplete({ products, categories }, container) {
  if (products.length === 0 && categories.length === 0) {
    container.innerHTML =
      '<div class="autocomplete-empty">Geen resultaten</div>';
    container.style.display = "block";
    return;
  }

  let html = "";

  if (categories.length > 0) {
    html +=
      '<div class="autocomplete-section"><div class="autocomplete-label">Categorieën</div>';
    categories.forEach((cat) => {
      html += `<div class="autocomplete-item autocomplete-category" onclick="filterByCategory('${cat}')">${cat}</div>`;
    });
    html += "</div>";
  }

  if (products.length > 0) {
    html +=
      '<div class="autocomplete-section"><div class="autocomplete-label">Producten</div>';
    products.forEach((p) => {
      const price = formatPrice(p.price * 1.21);
      html += `
        <div class="autocomplete-item" onclick="openProductModal(ALL.find(x => x.id === ${p.id}))">
          <img src="${p.image}" alt="${p.name}" style="width:40px;height:40px;object-fit:contain;border-radius:4px;background:#f5f5f5" />
          <div style="flex:1">
            <div class="autocomplete-product-name">${p.name}</div>
            <div class="autocomplete-product-price">${price}</div>
          </div>
        </div>
      `;
    });
    html += "</div>";
  }

  container.innerHTML = html;
  container.style.display = "block";
}

function filterByCategory(cat) {
  state.cat = cat;
  document.getElementById("search").value = "";
  document.getElementById("autocomplete").style.display = "none";
  apply(true);
}

// ====================
// 4. KEYBOARD SHORTCUTS
// ====================
function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // / - Focus search
    if (e.key === "/" && !isInputFocused()) {
      e.preventDefault();
      document.getElementById("search")?.focus();
    }

    // ESC - Close modals, blur inputs
    if (e.key === "Escape") {
      closeModal();
      document.activeElement?.blur();
      document.getElementById("autocomplete").style.display = "none";
    }

    // Ctrl/Cmd + K - Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      document.getElementById("search")?.focus();
    }

    // ? - Show shortcuts help
    if (e.key === "?" && !isInputFocused()) {
      e.preventDefault();
      showShortcutsModal();
    }

    // Arrow keys for product modal gallery
    if (document.getElementById("gallery-main-img")) {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    }
  });
}

function isInputFocused() {
  const active = document.activeElement;
  return (
    active.tagName === "INPUT" ||
    active.tagName === "TEXTAREA" ||
    active.isContentEditable
  );
}

function showShortcutsModal() {
  const modal = document.getElementById("product-modal");
  if (!modal) return;

  modal.innerHTML = `
    <div class="content" style="max-width:500px">
      <div class="header">
        <h2>⌨️ Sneltoetsen</h2>
        <button class="close" onclick="closeModal()">✕</button>
      </div>
      <div class="body">
        <div class="shortcuts-list">
          <div class="shortcut-item">
            <kbd>/</kbd>
            <span>Focus op zoekbalk</span>
          </div>
          <div class="shortcut-item">
            <kbd>ESC</kbd>
            <span>Sluit modals / blur input</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>K</kbd>
            <span>Snel zoeken</span>
          </div>
          <div class="shortcut-item">
            <kbd>?</kbd>
            <span>Toon sneltoetsen</span>
          </div>
          <div class="shortcut-item">
            <kbd>←</kbd> <kbd>→</kbd>
            <span>Navigeer door afbeeldingen</span>
          </div>
        </div>
      </div>
    </div>
  `;
  modal.style.display = "flex";
}

// ====================
// 5. ADVANCED PRICE SLIDER
// ====================
function initAdvancedPriceSlider() {
  const container = document.getElementById("price-slider-advanced");
  if (!container) return;

  const min = 0;
  const max = 500;

  container.innerHTML = `
    <div class="price-slider-header">
      <span>Prijs</span>
      <span id="price-range-display">€${state.minPrice} - €${state.maxPrice}</span>
    </div>
    <div class="price-slider-track">
      <div class="price-slider-range" id="price-slider-range"></div>
      <input type="range" id="price-min" min="${min}" max="${max}" value="${state.minPrice}" step="5" class="price-slider-input" />
      <input type="range" id="price-max" min="${min}" max="${max}" value="${state.maxPrice}" step="5" class="price-slider-input" />
    </div>
  `;

  const minInput = document.getElementById("price-min");
  const maxInput = document.getElementById("price-max");
  const rangeDisplay = document.getElementById("price-range-display");
  const rangeBar = document.getElementById("price-slider-range");

  function updateSlider() {
    const minVal = parseInt(minInput.value);
    const maxVal = parseInt(maxInput.value);

    if (minVal >= maxVal - 10) {
      if (this === minInput) {
        minInput.value = maxVal - 10;
      } else {
        maxInput.value = minVal + 10;
      }
    }

    state.minPrice = parseInt(minInput.value);
    state.maxPrice = parseInt(maxInput.value);
    rangeDisplay.textContent = `€${state.minPrice} - €${state.maxPrice}`;

    // Update range bar
    const percentMin = ((state.minPrice - min) / (max - min)) * 100;
    const percentMax = ((state.maxPrice - min) / (max - min)) * 100;
    rangeBar.style.left = percentMin + "%";
    rangeBar.style.width = percentMax - percentMin + "%";
  }

  minInput.addEventListener("input", updateSlider);
  maxInput.addEventListener("input", updateSlider);
  minInput.addEventListener("change", () => apply(true));
  maxInput.addEventListener("change", () => apply(true));

  updateSlider();
}

// ====================
// 6. OPTIMISTIC UI UPDATES
// ====================
function optimisticAddToCart(product) {
  // Instant feedback
  const btn = event?.target;
  if (btn) {
    const originalText = btn.textContent;
    btn.textContent = "✓ Toegevoegd!";
    btn.style.background = "var(--accent)";
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = "";
      btn.disabled = false;
    }, 1500);
  }

  // Actual cart update
  addToCart(product);

  // Animate cart badge
  const badge = document.getElementById("cart-badge");
  if (badge) {
    badge.classList.add("badge-pulse");
    setTimeout(() => badge.classList.remove("badge-pulse"), 600);
  }
}

function optimisticWishlistToggle(product) {
  const isInWishlist = WISHLIST.some((x) => x.id === product.id);
  const btn = event?.target;

  if (btn) {
    btn.style.transform = "scale(1.3) rotate(15deg)";
    btn.style.color = isInWishlist ? "var(--muted)" : "var(--primary)";

    setTimeout(() => {
      btn.style.transform = "";
    }, 300);
  }

  toggleWishlist(product);
}

// ====================
// 7. MICRO-INTERACTIONS
// ====================
function initMicroInteractions() {
  // Ripple effect on buttons
  document.addEventListener("click", (e) => {
    if (e.target.matches("button, .btn, .card")) {
      createRipple(e);
    }
  });

  // Smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Card hover effects
  observeCards();
}

function createRipple(event) {
  // Ensure we operate on the clicked element, not the document
  const button =
    event && event.target && typeof event.target.closest === "function"
      ? event.target.closest("button, .btn, .card")
      : null;
  if (!button || typeof button.getBoundingClientRect !== "function") return;

  // Skip ripple for header action buttons (they have badges that shouldn't be clipped)
  if (button.classList.contains("act")) return;

  const ripple = document.createElement("span");
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  // Fallback to center when clientX/Y not present (e.g., keyboard activation)
  const cx =
    typeof event.clientX === "number"
      ? event.clientX
      : rect.left + rect.width / 2;
  const cy =
    typeof event.clientY === "number"
      ? event.clientY
      : rect.top + rect.height / 2;
  const x = cx - rect.left - size / 2;
  const y = cy - rect.top - size / 2;

  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = x + "px";
  ripple.style.top = y + "px";
  ripple.classList.add("ripple");

  button.style.position = "relative";
  button.style.overflow = "hidden";
  button.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
}

function observeCards() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("card-visible");
          }, index * 50);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".card").forEach((card) => {
    card.classList.add("card-animate");
    observer.observe(card);
  });
}

// ====================
// 8. PERFORMANCE OPTIMIZATIONS
// ====================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Lazy load images
function initLazyLoading() {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          img.classList.add("loaded");
          imageObserver.unobserve(img);
        }
      }
    });
  });

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img);
  });
}

// Optimize scroll performance
const optimizedScroll = throttle(() => {
  const scrollTop = window.pageYOffset;
  const backToTop = document.getElementById("back-to-top");

  if (backToTop) {
    if (scrollTop > 500) {
      backToTop.style.display = "flex";
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  }
}, 100);

window.addEventListener("scroll", optimizedScroll);

// ====================
// 9. SMART LOADING INDICATOR
// ====================
let loadingIndicator;

function showLoadingIndicator(message = "Laden...") {
  if (!loadingIndicator) {
    loadingIndicator = document.createElement("div");
    loadingIndicator.className = "loading-indicator";
    document.body.appendChild(loadingIndicator);
  }

  loadingIndicator.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <div class="loading-text">${message}</div>
    </div>
  `;
  loadingIndicator.classList.add("active");
}

function hideLoadingIndicator() {
  if (loadingIndicator) {
    loadingIndicator.classList.remove("active");
  }
}

// ====================
// INITIALIZE ALL PREMIUM FEATURES
// ====================
function initPremiumFeatures() {
  console.log("🚀 Initializing Premium Features...");

  initAutocomplete();
  initKeyboardShortcuts();
  initMicroInteractions();
  initLazyLoading();

  // Re-init on product modal open
  const originalOpenProductModal = window.openProductModal;
  window.openProductModal = function (p) {
    originalOpenProductModal(p);
    setTimeout(initImageZoom, 100);
  };

  // Smooth apply with loading
  const originalApply = window.apply;
  window.apply = function (scroll) {
    showLoadingIndicator("Producten laden...");
    setTimeout(() => {
      originalApply(scroll);
      hideLoadingIndicator();
      observeCards();
    }, 100);
  };

  console.log("✅ Premium Features Loaded!");
}

// Auto-init when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPremiumFeatures);
} else {
  initPremiumFeatures();
}
