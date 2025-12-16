/* Filtering & Sorting Logic */

function apply(scroll) {
  VIEW = filterBase();
  sortData(VIEW);
  renderGrid();
  renderPagination();
  renderBreadcrumbs();
  if (scroll)
    document.querySelector(".grid")?.scrollIntoView({ behavior: "smooth" });
}

function filterBase() {
  let data = [...ALL];
  if (state.cat !== "all") data = data.filter((p) => p.type === state.cat);
  if (state.search)
    data = data.filter(
      (p) =>
        p.name.toLowerCase().includes(state.search) ||
        p.description.toLowerCase().includes(state.search)
    );
  if (state.free) data = data.filter((p) => p.freeShip);
  if (state.local) data = data.filter((p) => p.local);

  // Price filter
  data = data.filter((p) => {
    const price = p.price * 1.21;
    return price >= state.minPrice && price <= state.maxPrice;
  });

  // Brand filter
  if (state.brands.length > 0) {
    data = data.filter((p) => state.brands.includes(p.seller));
  }

  // Rating filter
  if (state.minRating > 0) {
    data = data.filter((p) => p.rating >= state.minRating);
  }

  return data;
}

function sortData(list) {
  const k = state.sort;
  if (k === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (k === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (k === "popular") list.sort((a, b) => b.orders - a.orders);
  else if (k === "new") list.sort((a, b) => b.createdAt - a.createdAt);
  else if (k === "smart")
    list.sort((a, b) => b.discount - a.discount || b.orders - a.orders);
}

// Price Slider
function initPriceSlider() {
  const minSlider = document.getElementById("price-slider-min");
  const maxSlider = document.getElementById("price-slider-max");
  const minLabel = document.getElementById("price-min");
  const maxLabel = document.getElementById("price-max");

  if (!minSlider || !maxSlider) return;

  // Set initial values
  minSlider.value = state.minPrice;
  maxSlider.value = state.maxPrice;
  if (minLabel) minLabel.textContent = state.minPrice;
  if (maxLabel) maxLabel.textContent = state.maxPrice;

  minSlider.addEventListener("input", () => {
    let newMin = parseInt(minSlider.value, 10);
    // Ensure min doesn't exceed max
    if (newMin > state.maxPrice - 5) {
      newMin = state.maxPrice - 5;
      minSlider.value = newMin;
    }
    state.minPrice = newMin;
    if (minLabel) minLabel.textContent = newMin;
    state.page = 1;
    apply(false);
  });

  maxSlider.addEventListener("input", () => {
    let newMax = parseInt(maxSlider.value, 10);
    // Ensure max doesn't go below min
    if (newMax < state.minPrice + 5) {
      newMax = state.minPrice + 5;
      maxSlider.value = newMax;
    }
    state.maxPrice = newMax;
    if (maxLabel) maxLabel.textContent = newMax;
    state.page = 1;
    apply(false);
  });

  // Populate brand filter
  populateBrandFilter();
}

function populateBrandFilter() {
  const brandSelect = document.getElementById("brand-select");
  if (!brandSelect) return;

  const brands = [...new Set(ALL.map((p) => p.seller))].sort();
  brands.forEach((brand) => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    brandSelect.appendChild(option);
  });
}
