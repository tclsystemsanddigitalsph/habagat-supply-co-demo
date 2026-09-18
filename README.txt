# Habagat Supply Co. — TCL Systems & Digitals PH Demo

A complete, runnable demo project for the **Online Shop + Admin — ₱8,999** package.

## How to run

No build step, no server, no dependencies.

**Option 1 — open directly**
Double-click `index.html` (or drag it into a browser window).

**Option 2 — serve locally (recommended)**
```
cd habagat-supply-co
python3 -m http.server 8000
```
Then open http://localhost:8000

Either method works. All data is stored in your browser's localStorage.

## Pages

### Customer storefront
| File | Purpose |
|---|---|
| `index.html` | Home — hero, featured products, categories, introduction, ordering steps |
| `shop.html` | Full catalog, category filter, search, sort |
| `product.html?id=...` | Product detail with variation selection and quantity |
| `cart.html` | Quantity updates, remove item, order summary |
| `checkout.html` | Customer details, delivery/pickup, manual payment, proof upload |
| `confirmation.html?ref=...` | Reference number and what happens next |
| `about.html` | Business story, store details, package scope |
| `contact.html` | Contact details and enquiry form |

### Demo admin
| File | Purpose |
|---|---|
| `admin.html` | **DEMO ADMIN** — dashboard, products, orders, store settings |

## Try the demo flow

1. Add a couple of products to the cart from `shop.html`.
2. Complete checkout — the confirmation page gives you an order reference.
3. Open `admin.html` → **Orders**. Your order is listed.
4. Click **Open** to see customer details, items, totals and the demo payment proof.
5. Click **Mark payment verified**. The status moves to Confirmed.
6. Change the order status with the dropdown (Pending → Confirmed → Processing → Ready → Completed).
7. Go to **Products** → **Edit** a product, change its name or price, save.
8. Switch back to the storefront — the change is already live.
9. Click **Reset demo data** in the admin header to restore everything.

## Data and reset

- Seeded with 10 products (4 categories), 3 sample orders and default store settings.
- Stored under `habagat.*` keys in localStorage.
- **Reset demo data** restores the original seed. Clearing site data does the same.

## Package scope

**Included in the ₱8,999 tier** — professional storefront, product catalog, product pages, product variations, shopping cart, checkout and order submission, manual payment options (GCash / QR Ph / Bank Transfer), payment proof submission, admin dashboard, product management, order management, manual payment verification, order status management, basic store settings, responsive storefront and admin.

**₱5,999 Basic Online Shop** — the same customer storefront without the admin dashboard.

**Available through Custom Quote** — automated payment gateway, customer accounts, membership system, loyalty points, subscriptions, referral system, advanced inventory automation, ERP/accounting integration, complex shipping API, advanced analytics, multiple admin roles, custom business workflows.

## Notes

- This is a demonstration. No payment is collected, no goods are shipped, and nothing leaves your browser.
- The admin has no authentication by design — it is a product demonstration, not a live system.
- Product imagery is original inline SVG artwork so the project has zero external dependencies.

---

Powered by **TCL Systems & Digitals PH**
