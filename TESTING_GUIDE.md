# 🚀 How to Test the Language & Currency Feature

## Quick Start

### 1. Open the Application

- Open `index.html` in your web browser
- Or navigate to `http://localhost:8000` if running a local server

### 2. Find the Language & Currency Selectors

Look at the **top right corner** of the page (in the topbar):

- **Language dropdown** - Shows 🇳🇱 Nederlands, 🇩🇪 Deutsch, 🇫🇷 Français, 🇬🇧 English
- **Currency dropdown** - Shows € Euro, $ Dollar, £ Pound

## Test Scenarios

### ✅ Test 1: Basic Language Switching

1. **Action**: Click language dropdown and select "Deutsch" (German)
2. **Expected**:

   - Product sorting option changes to "Sortieren"
   - Category names may translate (if in dictionary)
   - Button labels update to German

3. **Action**: Switch back to Dutch (Nederlands)
4. **Expected**: All text returns to Dutch

### ✅ Test 2: Basic Currency Conversion

1. **Action**: Click currency dropdown and select "$ Dollar"
2. **Expected**:

   - All € symbols change to $
   - All prices are approximately **10% higher** (multiply by 1.1)
   - Example: €100 becomes $110

3. **Action**: Select "£ Pound"
4. **Expected**:
   - All € symbols change to £
   - All prices are approximately **14% lower** (multiply by 0.86)
   - Example: €100 becomes £86

### ✅ Test 3: Product Cards Grid

1. **Action**: Look at any product card
   - Default shows: €99.99 (for example)
2. **Action**: Change currency to USD
   - Should show: $109.99 (99.99 × 1.1)
3. **Action**: Change currency to GBP
   - Should show: £85.99 (99.99 × 0.86)

### ✅ Test 4: Hero Deals Section

1. **Action**: Look at the "Dagdeal" (Daily Deals) section at top

   - All deal prices should be displayed

2. **Action**: Change currency
   - All deal prices should instantly convert
   - No page reload needed

### ✅ Test 5: Shopping Cart

1. **Action**: Click on a product and add to cart
2. **Action**: Click the shopping cart icon (🛒) in topbar
3. **Expected**:
   - Individual item price shows in selected currency
   - Cart total shows in selected currency
4. **Action**: Change currency while cart is open
5. **Expected**:
   - All prices update immediately
   - Total recalculates

### ✅ Test 6: Checkout Flow

1. **Action**: Add some items to cart
2. **Action**: Click "💳 Afrekenen" (Checkout) button
3. **Expected**:
   - Subtotal shows in selected currency
   - Shipping cost shows in selected currency (or "Gratis" if free)
   - Final total shows in selected currency
4. **Action**: Change currency
5. **Expected**:
   - All prices update
   - Button text updates

### ✅ Test 7: Product Details Modal

1. **Action**: Click on any product to open details
2. **Expected**:
   - Current price shows in selected currency
   - Original price (if discounted) shows in selected currency
   - Related items prices show in selected currency
3. **Action**: Change currency while modal is open
4. **Expected**:
   - All prices in modal update

### ✅ Test 8: Product Comparison

1. **Action**: Add 2-4 products to compare (click ⚖️ button on cards)
2. **Action**: Click the compare button (appears when items are selected)
3. **Expected**:
   - Comparison table shows all prices in selected currency
4. **Action**: Change currency
5. **Expected**:
   - All prices in comparison table convert

### ✅ Test 9: Persistence (localStorage)

1. **Action**: Select German language and USD currency
2. **Action**: Refresh the page (press F5)
3. **Expected**:
   - Language stays German
   - Currency stays USD
   - No need to select again
4. **Action**: Close browser completely and reopen
5. **Expected**:
   - Settings still saved (German, USD)
   - Preferences persist!

### ✅ Test 10: Order Confirmation

1. **Action**: Complete a full checkout
   - Fill in all form fields
   - Submit order
2. **Expected**:
   - Order confirmation page shows
   - "Totaal betaald:" shows amount in selected currency
   - Number of items displays correctly

## Example Test Flow

```
1. Open application
   └─ Default: Dutch + Euro

2. Look at hero deals
   └─ Prices show as €99.99, €49.99, etc.

3. Change currency to USD
   └─ Prices now show as $109.99, $54.99, etc.

4. Change language to English
   └─ Button labels translate

5. Add item to cart
   └─ Item price shows in USD

6. Open cart
   └─ Total shows in USD

7. Refresh page
   └─ Still English + USD

8. Change to GBP
   └─ All prices drop by ~14%

9. Complete checkout
   └─ Order total in GBP
```

## Price Verification Examples

### €100 Product with 21% VAT = €121

| Currency | Formula    | Result  | Symbol |
| -------- | ---------- | ------- | ------ |
| **EUR**  | 121 × 1.0  | €121.00 | €      |
| **USD**  | 121 × 1.1  | $133.10 | $      |
| **GBP**  | 121 × 0.86 | £104.06 | £      |

**How to verify**:

- Take any product price (e.g., €50)
- Add 21% VAT = €60.50
- Change to USD: should be $66.55 (60.50 × 1.1)
- Change to GBP: should be £52.03 (60.50 × 0.86)

## What Should Update Automatically

✅ All € symbols → $ or £  
✅ All prices recalculate  
✅ Cart totals update  
✅ Checkout totals update  
✅ Order confirmation amount updates  
✅ Product modal prices update  
✅ Comparison table prices update  
✅ Hero deals prices update  
✅ Grid card prices update

## What Should NOT Update

❌ Page doesn't need to reload  
❌ Cart items don't disappear  
❌ Wishlist items don't change  
❌ Comparison selections don't reset  
❌ Form data doesn't clear

## Troubleshooting

### Issue: Prices don't show currency symbol

- **Solution**: Check that `language.js` is loaded (check browser console for errors)
- **Verify**: Open browser Developer Tools (F12) → Console
- **Should see**: No errors, prices formatted with $ or £

### Issue: Prices don't convert when currency changes

- **Solution**: Ensure `formatPrice()` function is called
- **Check**: In browser console, type `currentCurrency` - should return "EUR", "USD", or "GBP"

### Issue: Language selections don't persist

- **Solution**: Check that localStorage is enabled in browser
- **Verify**:
  ```javascript
  localStorage.setItem("test", "works");
  localStorage.getItem("test"); // Should return "works"
  ```

### Issue: Text doesn't translate

- **Solution**: Check that the text exists in translation dictionary
- **Verify**: Open `js/language.js` and search for the text in `translations` object

## Console Debugging

Open Browser Developer Tools (F12) and try these commands:

```javascript
// Check current language
console.log(currentLanguage); // "nl", "de", "fr", or "en"

// Check current currency
console.log(currentCurrency); // "EUR", "USD", or "GBP"

// Test price formatting
formatPrice(121); // Should return formatted price

// Test translation
translate("Sorteren"); // Should return translated text

// Test currency conversion
convertPrice(121); // Should return converted price
```

## Success Indicators ✓

✓ Opening page loads in Dutch + Euro by default  
✓ Language dropdown changes UI text  
✓ Currency dropdown converts all prices  
✓ Cart shows prices in selected currency  
✓ Checkout shows totals in selected currency  
✓ Product details modal prices convert  
✓ Comparison table prices convert  
✓ Settings persist after refresh  
✓ Settings persist after closing browser  
✓ No JavaScript errors in console

---

## 🎉 You're Ready to Test!

The language and currency system is fully functional. Enjoy testing the multi-language, multi-currency experience!

If you find any issues, check the browser console (F12) for error messages.
