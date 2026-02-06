# Marketing Team Update: Analytics & Tracking Implementation

**Date:** February 6, 2026  
**Subject:** GA4 E-Commerce Tracking, Google Tag Manager & Meta Pixel – Implementation Summary

---

## Executive Summary

We have implemented a complete analytics and marketing tracking setup on the Multifolks website. This enables the marketing team to measure e-commerce funnel performance, retarget visitors, and optimise campaigns based on real user behaviour data.

---

## 1. Google Tag Manager (GTM)

**Status:** ✅ Implemented

**What was done:**
- Added the GTM base code snippet to the website header (Option 1 – raw snippet in `index.html`)
- GTM loads on every page of the site
- Container ID: **GTM-5VQB97RL**

**Benefits:**
- Manage tags (Google Analytics, Meta, etc.) from GTM without code changes
- Central place to add/remove tracking pixels
- Supports A/B testing and conversion tracking

**Location:** `index.html` (in `<head>` and `<body>`)

---

## 2. Meta Pixel (Facebook Pixel)

**Status:** ✅ Implemented

**What was done:**
- Added Meta Pixel base code to the website
- Pixel ID: **758746253778114**
- Automatic PageView event on every page load
- Noscript fallback for users without JavaScript

**Benefits:**
- Track website visitors for Meta Ads retargeting
- Build custom audiences
- Measure ad performance and conversions

**Location:** `index.html` (in `<head>`), noscript fallback in `<body>`

---

## 3. Google Analytics 4 (GA4) E-Commerce Events

**Status:** ✅ Implemented

**What was done:**  
Implemented the standard GA4 e-commerce event tracking across the site. All events are pushed to the `dataLayer` for GTM to forward to GA4.

### Event Summary

| Event             | Trigger                         | Where it fires                    |
|-------------------|----------------------------------|-----------------------------------|
| **view_item_list**| User views a list of products   | Product list pages (/glasses, /glasses/men, /glasses/women) |
| **view_item**     | User views a product detail page| Product detail pages              |
| **add_to_cart**   | User adds item to cart          | Lens selection flows, add-to-cart buttons |
| **begin_checkout**| User clicks "Checkout"          | Cart page (desktop & mobile)      |
| **purchase**      | User completes an order         | Order success / thank-you page    |

### Implementation Details

**Product List Pages (view_item_list):**
- AllProducts page – when products load
- MenCollection page – Men's eyeglasses
- WomenCollection page – Women's eyeglasses

**Product Detail (view_item):**
- ProductPage – when a single product loads

**Add to Cart (add_to_cart):**
- SelectLensColor
- SelectLenses
- SelectLensType
- SelectLensCoatings
- DeliveryPopUp component

**Begin Checkout (begin_checkout):**
- Desktop cart – when "Checkout" button is clicked
- Mobile cart – when "Checkout" button is clicked

**Purchase (purchase):**
- PaymentSuccess page – when user lands on order confirmation

### Data Captured (per event)

- Product ID (SKU)
- Product name
- Brand
- Price
- Quantity
- Currency (GBP)

---

## 4. Technical Architecture

```
Website (React/Vite)
    ↓
dataLayer.push({ event: 'view_item', ecommerce: {...} })
    ↓
Google Tag Manager (GTM-5VQB97RL)
    ↓
GA4 / Meta Pixel / Other Tags
```

The marketing team can configure GTM to:
1. Fire GA4 tags on these e-commerce events
2. Send enhanced e-commerce data to GA4
3. Add or change tracking without developer involvement

---

## 5. Next Steps for Marketing Team

1. **GTM Configuration**
   - Create GA4 tags in GTM that fire on: `view_item_list`, `view_item`, `add_to_cart`, `begin_checkout`, `purchase`
   - Map the `ecommerce` object from the dataLayer to GA4 e-commerce parameters

2. **GA4 Setup**
   - Enable enhanced e-commerce in the GA4 property
   - Create audiences based on these events (e.g. cart abandoners, purchasers)

3. **Meta Pixel**
   - Configure conversion events in Meta Events Manager if needed
   - Set up custom conversions for purchase, add to cart, etc.

4. **Optional: add_shipping_info**
   - The event for “user submits shipping information” can be added when the address form is submitted in the checkout flow. Please confirm if this is required.

---

## 6. Files Modified / Created

| File | Change |
|------|--------|
| `index.html` | GTM snippet, Meta Pixel |
| `utils/analytics.ts` | **New** – GA4 dataLayer helpers |
| `pages/AllProducts.tsx` | trackViewItemList |
| `pages/MenCollection.tsx` | trackViewItemList |
| `pages/WomenCollection.tsx` | trackViewItemList |
| `pages/ProductPage.tsx` | trackViewItem |
| `pages/SelectLensColor.tsx` | trackAddToCart |
| `pages/SelectLenses.tsx` | trackAddToCart |
| `pages/SelectLensType.tsx` | trackAddToCart |
| `pages/SelectLensCoatings.tsx` | trackAddToCart |
| `pages/PaymentSuccess.tsx` | trackPurchase |
| `components/DeliveryPopUp.tsx` | trackAddToCart |
| `components/cart/DesktopCart.tsx` | trackBeginCheckout |
| `components/cart/MobileCart.tsx` | trackBeginCheckout |

---

## 7. Contact

For technical questions about this implementation, please contact the development team.

For questions about GTM configuration, GA4 reports, or Meta Ads setup, please liaise with the marketing team lead.

---

*Document generated: February 6, 2026*
