/* Event Listeners & Wiring */

function wire() {
  document.querySelectorAll(".cat").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.cat = btn.dataset.cat;
      state.page = 1;
      apply(true);
    });
  });

  document.getElementById("search-btn")?.addEventListener("click", () => {
    state.search = document.getElementById("search").value.trim().toLowerCase();
    state.page = 1;
    apply(true);
  });

  document.getElementById("search")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      state.search = document
        .getElementById("search")
        .value.trim()
        .toLowerCase();
      state.page = 1;
      apply(true);
    }
  });

  document.getElementById("sort")?.addEventListener("change", (e) => {
    state.sort = e.target.value;
    state.page = 1;
    apply(true);
  });

  const ps = document.getElementById("page-size");
  if (ps) {
    ps.value = String(state.pageSize);
    ps.addEventListener("change", () => {
      state.pageSize = parseInt(ps.value, 10) || 15;
      localStorage.setItem("pageSize", String(state.pageSize));
      state.page = 1;
      apply(true);
    });
  }

  document.getElementById("flt-free")?.addEventListener("change", (e) => {
    state.free = !!e.target.checked;
    state.page = 1;
    apply(true);
  });

  document.getElementById("flt-local")?.addEventListener("change", (e) => {
    state.local = !!e.target.checked;
    state.page = 1;
    apply(true);
  });

  document.getElementById("rating-select")?.addEventListener("change", (e) => {
    state.minRating = parseFloat(e.target.value) || 0;
    state.page = 1;
    apply(true);
  });

  document.getElementById("brand-select")?.addEventListener("change", (e) => {
    const options = Array.from(e.target.selectedOptions);
    state.brands = options.map((o) => o.value).filter((v) => v !== "");
    state.page = 1;
    apply(true);
  });
}

function wireCartWishlist() {
  document
    .querySelector(".actions .act:nth-child(3)")
    ?.addEventListener("click", openCart);
  document
    .querySelector(".actions .act:nth-child(1)")
    ?.addEventListener("click", openWishlist);
  document
    .querySelector(".actions .act:nth-child(2)")
    ?.addEventListener("click", openProfile);
  const modal = document.getElementById("product-modal");
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

function showSearchSuggestions(query) {
  let container = document.getElementById("search-suggestions");
  if (!container) {
    container = document.createElement("div");
    container.id = "search-suggestions";
    container.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid var(--border);
      border-radius: 0 0 8px 8px;
      max-height: 300px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    document.querySelector(".search")?.appendChild(container);
  }

  const suggestions = [
    ...new Set(
      ALL.filter((p) => p.name.toLowerCase().includes(query))
        .map((p) => p.name)
        .slice(0, 8)
    ),
  ];

  if (suggestions.length === 0) {
    container.innerHTML =
      '<div style="padding: 12px; color: var(--muted); text-align: center;">Geen resultaten</div>';
    return;
  }

  container.innerHTML = suggestions
    .map(
      (sug) =>
        `<div style="padding: 10px 15px; cursor: pointer; border-bottom: 1px solid var(--border); hover: background: var(--bg);" onclick="document.getElementById('search').value = '${sug}'; state.search = '${sug}'.toLowerCase(); state.page = 1; hideSearchSuggestions(); apply(true);">🔍 ${sug}</div>`
    )
    .join("");
}

function hideSearchSuggestions() {
  const container = document.getElementById("search-suggestions");
  if (container) container.innerHTML = "";
}
