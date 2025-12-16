# GoBuy Dropshipping Architectuur (Basis)

Doel: GoBuy als frontend voor leveranciers (AliExpress/CJ/Spocket), met echte checkout en order doorzetting. Minimalistisch, vendor-neutraal, en stap-voor-stap uit te rollen.

## Componenten

- Frontend (bestaand): Vanilla JS + localStorage state
- Backend (nieuw, dunne laag): serverless functies (`/api/*`), bv. Netlify Functions, Vercel Functions of Firebase Functions
- Database: Firestore/Supabase (orders, klanten, import logs)
- Betalingen: Stripe/Mollie (Stripe voorbeeld hieronder)
- Integrators: AliExpress/CJ/Spocket adapter(s) die product-sync + orderfulfillment afhandelen

## Datastroom

1. Product Sync

- Scheduler (cron) triggert `/api/syncProducts?provider=aliexpress`
- Adapter haalt producten/prijzen/voorraad op, mapt naar `Product` en bewaart in DB
- Frontend haalt producten via `/api/products` (of build-time JSON dump)

Quick-start zonder backend:

- CSV/JSON import in `debug.html` (handmatig) → parse naar `Product` en voeg toe aan `ALL`
- Bron lokaal opslaan (localStorage) of als JSON downloaden; later eenvoudig te migreren naar server-endpoints

2. Checkout

- Frontend (cart) -> `/api/checkout/session` (items, prijzen, klant)
- Server maakt Stripe Checkout Session -> `sessionId` terug
- Frontend redirect via Stripe.js `redirectToCheckout`

3. Fulfillment

- Stripe webhook `/api/webhooks/stripe` -> order betaald
- Server zet orderstatus=paid, roept provider adapter aan om order te plaatsen
- Tracking terugschrijven in DB -> frontend toont status

## Data modellen (indicatief)

Product:

- id, name, description, images[], price, currency, sku/vendorSku, stock, attributes{}, vendor{provider, vendorId}

Order:

- id, items[{productId, qty, price}], customer{email, name, address}, totals{subtotal, shipping, tax}, status, providerMeta{}

## Endpoints (server)

- POST `/api/checkout/session` -> { sessionId }
- POST `/api/orders` -> maakt order (pre-checkout of COD), return { orderId }
- GET `/api/products` -> lijst producten (met filters/paginatie)
- POST `/api/syncProducts` -> protected; start sync job
- POST `/api/webhooks/stripe` -> webhook handler

## Vendor adapters

- `AliExpressAdapter`: sync, placeOrder, fetchStatus
- `CJAdapter` / `SpocketAdapter`: idem

Belangrijk: Vanwege CORS/keys niet direct vanuit browser naar AliExpress/Stripe gaan. Altijd via serverless functie.

## Uitrol-fases

Fase 1 (MVP)

- Stripe Checkout + Orders in Firestore
- Handmatige fulfillment (admin pakt orders en bestelt bij leverancier)

Fase 2

- Vendor adapter automatiseren (auto-place, tracking terugschrijven)
- Product sync via cron

Fase 3

- Multi-provider, pricing rules (marge, BTW, verzendkosten), voorraadbewaking

## Beveiliging & BTW

- Secret keys alleen server-side
- Webhooks verifiëren
- BTW: prijzen incl. 21% tonen (front-end doet dit al), server rekent definitief

## Frontend integratiepunten

- `js/backend.js` (fetch wrappers)
- `js/payments.js` (Stripe redirect)
- Optionele admin/debug UI voor import
  - CSV kolommen: name, price, image, type, vendorSku, stock
  - JSON schema = Product model hierboven
