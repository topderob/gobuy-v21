# GoBuy — Deals & Discovery

A modern single-page deals platform built with vanilla JavaScript (no frameworks required).

## Features

- **Hero Deals** — Top 8 discounted products with dynamic sorting
- **Smart Filters** — Category chips, free shipping, local warehouse filters
- **Product Details** — Full modal with specs, reviews, and related items
- **Cart & Wishlist** — Persistent shopping cart and wishlist with localStorage
- **Toast Notifications** — User feedback for all actions (add to cart, wishlist updates)
- **Responsive Grid** — Dense 6→4→2 column product layout
- **Lazy Loading** — Images load on demand with placeholder fallbacks
- **Pagination** — Smooth navigation with customizable page sizes

## Quick Start

Open [index.html](index.html) directly in your browser, or start a local server:

```powershell
python -m http.server 8080
# Open http://localhost:8080/
```

## How It Works

- **All data** is mocked in [js/products.js](js/products.js) — no backend required
- **Cart & Wishlist** persist via localStorage
- **Images** lazy load with `via.placeholder.com` fallbacks for missing photos
- **Page size** preferences are saved per user

## Tech Stack

- Vanilla JavaScript (ES6+)
- CSS Grid & Flexbox
- localStorage for state persistence
- Unsplash images with placeholder fallbacks

## Key Files

- [index.html](index.html) — Main page structure
- [js/app.js](js/app.js) — All application logic (554 lines: filters, cart, modals, etc.)
- [js/products.js](js/products.js) — Mock product database (50+ items)
- [css/app.css](css/app.css) — Complete styling

## What's Next

- Checkout flow with form validation and order confirmation
- Advanced filters (price range slider, brand selector, rating filter)
- Product comparison tool
- User review submission system
- Image zoom and gallery navigation in product modal

- Lazy-load images, skeletons, micro-animations

Later (Milestone 2): improve chatbot relevance and integrate softly in the marketplace.

Notes

- All data is mocked in js/products.js
- No external APIs are required
- Page size preferences persist via localStorage
