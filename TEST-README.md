# MySellKit Widget v1.1.18 - Test Files

This folder contains test HTML files to verify the new button trigger features.

## Quick Start

1. Replace `XXX` or `PRODUCT1`/`PRODUCT2` with your actual MySellKit product IDs in each test file
2. Open the test files in a browser to verify functionality
3. Check the browser console for debug logs (all tests have `data-debug="true"`)

## Test Files

### Test 1: Button ID with Popup Mode
**File:** `test-1-button-popup.html`

Tests the new `data-button-id` attribute with default popup display mode.

**Features tested:**
- `data-trigger="manual"`
- `data-button-id="test1"`
- Button click opens popup in modal mode

**Expected:** Clicking the button opens the widget in a centered popup.

---

### Test 2: Button ID with Fullscreen Mode
**File:** `test-2-button-fullscreen.html`

Tests the new `data-button-id` attribute with fullscreen display mode.

**Features tested:**
- `data-trigger="manual"`
- `data-button-id="test2"`
- `data-display="fullscreen"`
- Button click opens fullscreen view

**Expected:** Clicking the button opens the widget in fullscreen mode.

---

### Test 3: Data-Attribute Checkout
**File:** `test-3-data-checkout.html`

Tests the new `data-mysellkit-checkout` attribute for direct checkout.

**Features tested:**
- Button with `data-mysellkit-checkout="XXX"`
- Auto-attach click listener
- Direct redirect to Stripe checkout (no popup)

**Expected:** Clicking the button goes directly to checkout without showing the widget.

---

### Test 4: Multiple Data-Attribute Buttons
**File:** `test-4-multiple-checkout.html`

Tests multiple products with data-attribute checkout on the same page.

**Features tested:**
- Multiple buttons with different product IDs
- Each button independently triggers its product checkout
- No conflicts between multiple products

**Expected:** Each button checks out its respective product directly.

---

### Test 5: Button Not Found Warning
**File:** `test-5-button-not-found.html`

Tests error handling when the specified button ID doesn't exist.

**Features tested:**
- `data-button-id="nonexistent"`
- Warning message in console
- Graceful error handling

**Expected:** Console warning: `MySellKit: Button #nonexistent not found on page`

---

### Test 6: Version Number in Debug Badge
**File:** `test-6-version-badge.html`

Verifies the version number fix in the debug badge.

**Features tested:**
- Debug badge displays correct version
- Version updated from v1.1.17 to v1.1.18

**Expected:** Debug badge in bottom-left shows `🔧 TEST MODE v1.1.18`

---

## Feature Summary

### New Attributes

#### `data-button-id` (for manual triggers)
Automatically attaches the widget to a button on your page by ID.

```html
<script src="widget.js"
        data-product="YOUR_PRODUCT_ID"
        data-trigger="manual"
        data-button-id="buy-now"></script>

<button id="buy-now">Buy Now</button>
```

#### `data-mysellkit-checkout` (for direct checkout)
Converts any button into a direct checkout button without showing the popup.

```html
<script src="widget.js"></script>

<button data-mysellkit-checkout="YOUR_PRODUCT_ID">Buy Now</button>
```

### Display Modes

When using `data-button-id`, you can control the display mode:

- **Popup (default):** Centered modal
```html
<script data-display="popup" ...></script>
```

- **Fullscreen:** Full-page product view
```html
<script data-display="fullscreen" ...></script>
```

## Debugging

All test files include `data-debug="true"` which enables:
- Debug badge in bottom-left corner
- Console logs for all widget actions
- Test mode indicators

## Browser Console Commands

You can also trigger the widget manually from the browser console:

```javascript
// Open popup for a product
MySellKit.open('PRODUCT_ID');

// Open in fullscreen mode
MySellKit.open('PRODUCT_ID', { display: 'fullscreen' });

// Direct checkout
MySellKit.checkout('PRODUCT_ID');
```

## Common Issues

### Widget doesn't load
- Check that `data-product` attribute is set (except for data-attribute checkout)
- Verify the product ID is correct
- Check browser console for errors

### Button doesn't respond
- Verify the button ID matches `data-button-id`
- Check that `data-trigger="manual"` is set
- Ensure button exists when widget initializes (use DOM ready events if needed)

### Version still shows v1.1.17
- Clear browser cache
- Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Check you're loading the correct widget.js file
