# GoBuy Developer Guide

## Architecture Overview

**GoBuy** is a vanilla JavaScript e-commerce platform with zero frameworks or build tools. The entire app runs client-side with mock data and localStorage persistence.

### Core Philosophy

- **No bundlers, no transpilers** — ES6+ features only, runs directly in browser
- **Single global state** — Four mutable arrays (`ALL`, `VIEW`, `CART`, `WISHLIST`) and one `state` object
- **Procedural render pattern** — State mutations trigger manual `render*()` function calls
- **localStorage as database** — Cart, wishlist, and preferences persist across sessions

### File Structure & Responsibilities

```
index.html          Single-page markup with semantic structure
js/app.js           All application logic (658 lines) — filtering, rendering, modals
js/products.js      Mock product database (~50 items) via fetchProductsFromAPI()
css/app.css         Complete styling with CSS Grid/Flexbox, no utility classes
```

## Critical Data Flow

### Initialization Sequence

1. **DOMContentLoaded** → Load `pageSize` from localStorage → Parse `CART` and `WISHLIST`
2. **load()** → Fetch mock products → Augment with random metadata (ratings, shipping) → Store in `ALL`
3. **wire()** → Attach all event listeners (categories, filters, pagination, search)
4. **apply(true)** → Filter → Sort → Render grid → Render pagination → Auto-scroll

### State Management Pattern

```javascript
// Global mutable state
let state = {
  cat: "all", // Active category filter
  search: "", // Search query
  sort: "smart", // Sort method (smart/price-asc/price-desc/popular/new)
  free: false, // Free shipping filter
  local: false, // Local warehouse filter
  page: 1, // Current page number
  pageSize: 15, // Items per page (persisted in localStorage)
};
```

**Key rule:** Every filter/sort change calls `apply(true)` which:

1. Rebuilds `VIEW` array from `ALL` with active filters
2. Sorts `VIEW` by current sort method
3. Triggers `renderGrid()` and `renderPagination()`
4. Auto-scrolls to grid when scroll=true

### Data Augmentation

Products from `products.js` are augmented at runtime with randomized metadata:

- `rating` (3.8-5.0), `orders` (50-18k), `seller`, `shipFrom` (NL/PL/ES/DE/CN)
- `freeShip`, `local`, `discount` (0-60%), `originalPrice`, `createdAt`

This happens in `augment()` during `load()` — **never modify product structure in products.js without updating augment()**.

## Rendering Patterns

### Render Functions (Manual DOM Construction)

- `renderGrid()` — Creates product cards from `VIEW` slice based on current page
- `renderHeroDeals()` — Top 8 products sorted by discount/orders
- `renderPagination()` — Builds dynamic page numbers with window size of 5
- `card(p)` — Returns single product card element with event listeners attached inline

**Pattern:** Build HTML strings with template literals, assign to `.innerHTML`, then attach event listeners via `.querySelector()`.

### Modal System

Single reusable `#product-modal` div:

- `openProductModal(p)` — Product details with reviews, features, related items
- `openCart()` — Cart summary with checkout button
- `openWishlist()` — Wishlist with "add to cart" actions

Modals use inline onclick handlers (e.g., `onclick="closeModal()"`) for simplicity.

## Development Workflows

### Running Locally

```powershell
# Option 1: Direct file open (recommended for quick edits)
start index.html

# Option 2: Local server (for testing real HTTP behavior)
python -m http.server 8080
# Navigate to http://localhost:8080/
```

No build step required — edit files and refresh browser.

### Testing Changes

1. **Filter/Sort Logic** → Modify `apply()`, `filterBase()`, or `sortData()` → Check `VIEW` array in console
2. **UI Changes** → Edit [css/app.css](css/app.css) → Use responsive design tools to test grid breakpoints
3. **Product Data** → Add items to [js/products.js](js/products.js) → Ensure all required fields match existing structure

### Console Debugging

```javascript
// Inspect global state
console.log(ALL, VIEW, CART, WISHLIST, state);

// Test filter without UI
state.cat = "elektronica";
apply(false);
console.log(VIEW);

// Check localStorage
localStorage.getItem("cart");
localStorage.getItem("wishlist");
```

## Code Conventions

### Naming

- **Global arrays:** UPPERCASE (`ALL`, `VIEW`, `CART`, `WISHLIST`)
- **Functions:** camelCase (`renderGrid`, `openProductModal`)
- **No classes or modules** — All functions are global scope

### Event Handling

- **Declarative:** `wire()` attaches all listeners once on DOMContentLoaded
- **Dynamic cards:** Listeners attached in `card()` function per product
- **Modals:** Mix of inline `onclick` (for simplicity) and programmatic listeners

### Styling Strategy

- **BEM-like classes:** `.hero-deals`, `.hero-left`, `.card`, `.pagination`
- **CSS Grid layouts:** Hero (2fr 1fr), product grid (6 columns → responsive)
- **CSS variables:** `--primary`, `--accent`, `--bg`, `--card`, `--text`, `--muted`, `--border`

### Price Display

**Always multiply by 1.21 for VAT** (21% Dutch tax):

```javascript
const price = (p.price * 1.21).toFixed(2);
```

Prices in `products.js` are pre-tax base prices.

## Adding Features

### New Filter

1. Add checkbox/select to [index.html](index.html) toolbar
2. Add property to `state` object (line 7 in [js/app.js](js/app.js))
3. Wire event listener in `wire()` (line 74)
4. Add filter logic to `filterBase()` (line 133)
5. Call `apply(true)` on change

### New Sort Method

1. Add `<option>` to `#sort` select in [index.html](index.html#L87)
2. Add case to `sortData()` switch (line 146)
3. Sort logic operates on `VIEW` array in-place

### New Product Category

1. Add products with `type: "newcategory"` to [js/products.js](js/products.js)
2. Add `<button class="cat" data-cat="newcategory">` to nav in [index.html](index.html#L47-L52)
3. Auto-wired via `data-cat` attribute — no JS changes needed

## Common Pitfalls

- **Forgetting `apply(true)`** after state changes → UI won't update
- **Direct `ALL` mutation** → Always work with `VIEW` for filters, keep `ALL` immutable after load
- **Missing VAT multiplication** → Always use `(p.price * 1.21).toFixed(2)` for display
- **localStorage JSON errors** → Wrap parse in try-catch (already done in init, line 21-23)
- **Image fallbacks** → Use `onerror="this.src='https://via.placeholder.com/...'` for missing images

## Future Roadmap (README reference)

Planned features require expanding [js/app.js](js/app.js):

- **Checkout flow** → New modal with form validation, order summary
- **Advanced filters** → Price range slider (state.minPrice/maxPrice), brand multi-select
- **Product comparison** → New `COMPARE` array, comparison modal with feature table
- **User reviews** → LocalStorage review submission, append to `generateReviews()`

Keep the vanilla JS philosophy — no frameworks, simple procedural logic, localStorage-first.
