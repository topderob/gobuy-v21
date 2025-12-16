# Serverless API (Vercel/Netlify) – Quick Start

Deze repo bevat minimale serverless stubs zodat je snel Stripe + Orders kunt testen zonder je frontend te breken.

## Mappen/Bestanden

- `api/checkout/session.js` – maakt een Stripe Checkout Session aan (of mockt als er geen STRIPE key is)
- `api/orders.js` – maakt een order (skeleton, zonder DB)
- `api/webhooks/stripe.js` – Stripe webhook (raw body, signature verify)

## Vereiste omgevingsvariabelen

- `STRIPE_SECRET_KEY` – je Stripe secret, bv. `sk_test_...`
- `CHECKOUT_SUCCESS_URL` – URL waarnaar Stripe terugkeert na betaling
- `CHECKOUT_CANCEL_URL` – URL voor geannuleerde betaling
- `STRIPE_WEBHOOK_SECRET` – (optioneel, voor webhooks)

Als `STRIPE_SECRET_KEY` ontbreekt, retourneert `/api/checkout/session` een mock `sessionId` (begint met `sess_mock_`) zodat de frontend veilig blijft functioneren.

## Deploy – Vercel

1. Push repo naar GitHub
2. Importeer in Vercel
3. Zet env vars in Vercel Project Settings → Environment Variables
4. Deploy

## Deploy – Netlify (alternatief)

Gebruik Netlify Functions (andere padstructuur). Deze stubs zijn Vercel-georiënteerd. Ik kan ze desgewenst omzetten voor Netlify (`netlify/functions/*`).

## Frontend integratie

- Frontend roept `BACKEND.createCheckoutSession(payload)` aan (zie `js/payments.js`).
- Als een echte `sessionId` terugkomt en `window.Stripe` is aanwezig, redirect de gebruiker naar Stripe Checkout.

## Lokaal testen (voorbeeld curl)

```bash
# Maak een (mock of echte) sessie aan
curl -X POST http://localhost:3000/api/checkout/session \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"p1","qty":2}],"currency":"EUR"}'

# Maak order (skeleton)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"p1","qty":2}],"customer":{"email":"a@b.com"}}'
```

## Volgende stappen

- DB toevoegen (Firestore/Supabase) voor orders en productcatalogus
- Prijslookup in `/api/checkout/session` vervangen door server-side prijsberekening
- Fulfillment-adapter aanroepen in webhook `checkout.session.completed`
