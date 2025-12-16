# GoBuy Testing & Feature Development Plan

## Phase 1: Comprehensive Checkout Flow Testing

### Scenario 1: Basic Cart Flow

- [ ] Add 1 item to cart
- [ ] See toast notification
- [ ] Cart opens automatically
- [ ] Item shows correct price (with VAT)
- [ ] Quantity shows 1
- [ ] Cart badge updates

### Scenario 2: Multiple Items

- [ ] Add 3 different items
- [ ] Verify subtotal = sum of (price × qty × 1.21)
- [ ] Verify shipping cost (€4.95 if < €25, else FREE)
- [ ] Verify total = subtotal + shipping
- [ ] All items appear in cart

### Scenario 3: Duplicate Item Handling

- [ ] Add item A to cart
- [ ] Add item A again
- [ ] Verify quantity increases to 2 (not duplicate entry)
- [ ] Price updates correctly

### Scenario 4: Wishlist to Cart Flow

- [ ] Add item to wishlist (heart icon)
- [ ] Wishlist badge updates
- [ ] Open wishlist modal
- [ ] Increase quantity to 3
- [ ] Click cart button to move to cart
- [ ] Verify 3 items in cart (not just 1)
- [ ] Verify item removed from wishlist
- [ ] Wishlist badge updates down

### Scenario 5: Cart Item Selection

- [ ] Add 5 items to cart
- [ ] Uncheck 2 items
- [ ] Click "Alles deselecteren" (select none)
- [ ] Verify checkout button shows (0/5)
- [ ] Click "Alles selecteren" (select all)
- [ ] Verify checkout button shows (5/5)
- [ ] Try checkout with none selected → shows warning

### Scenario 6: Quantity Management

- [ ] Add item with qty 1
- [ ] Click + button → qty 2
- [ ] Click + again → qty 3
- [ ] Manual input: type "5"
- [ ] Verify total recalculates
- [ ] Click - button → qty 4
- [ ] Click - multiple times → stays at 1 (minimum)

### Scenario 7: Product Image Click

- [ ] Add item to cart
- [ ] Click product image in cart
- [ ] Product detail page opens
- [ ] Close modal, item still in cart
- [ ] Add item to wishlist
- [ ] Click image in wishlist
- [ ] Product page opens

### Scenario 8: Cart Persistence

- [ ] Add 3 items to cart
- [ ] Add 2 items to wishlist
- [ ] Refresh page (F5)
- [ ] Verify all cart items still there
- [ ] Verify all wishlist items still there
- [ ] localStorage keys exist ("cart", "wishlist")

### Scenario 9: Checkout Button States

- [ ] Empty cart → "Je winkelwagen is leeg"
- [ ] Add items, select all
- [ ] Checkout button shows "(5/5)"
- [ ] Click checkout
- [ ] See 2 toasts (demo mode):
  - "Stripe actief: bezig met afrekenen"
  - "Geen echte sessie — demo voltooid"
- [ ] No page navigation (expected in demo)

### Scenario 10: Edge Cases

- [ ] Add 100 items (should handle large quantities)
- [ ] Remove all items one by one
- [ ] Add/remove/add same item repeatedly
- [ ] Modify quantity while modal open
- [ ] Switch between cart and wishlist rapidly

---

## Phase 2: Feature Development

### Feature: Product Reviews (Coming)

- Display star ratings and review count on product cards
- "See reviews" link in product detail
- Add review form (demo only, localStorage)
- Review filtering (5★, 4★, etc.)

### Feature: Advanced Filters (Enhance)

- Price range slider (min/max)
- Brand multi-select
- Rating filter (4+ stars, etc.)
- Stock status (In stock only)
- Shipping method (Free shipping, Local, etc.)

### Feature: Product Comparison

- "Compare" button on cards
- Comparison modal with side-by-side specs
- Remove from comparison
- Compare up to 4 items

### Feature: Search Improvements

- Real-time search as you type
- Search history (recent searches)
- Popular searches suggestion
- Category-specific search

### Feature: Saved Items / Collections

- "Save for later" vs "Add to cart"
- Multiple wishlists (Favorites, Budget, Gifts)
- Share wishlist via URL/link

### Feature: Checkout Enhancements

- Guest checkout
- Account registration option
- Save address for next time
- Multiple payment methods toggle

---

## Test Results Log

| Date       | Test          | Status | Notes                           |
| ---------- | ------------- | ------ | ------------------------------- |
| 2025-12-16 | Badge display | ✅     | Fixed clipping, ripple excluded |
| 2025-12-16 | Page scroll   | ✅     | Scrolls to top on load          |
| 2025-12-16 | Cart flow     | ✅     | All basic functions working     |
