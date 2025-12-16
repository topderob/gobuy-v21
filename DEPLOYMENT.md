# GoBuy Vercel Deployment Guide

## Quick Deploy (5 minutes)

### 1. Prepare for Vercel

```bash
# Install Vercel CLI globally (if you haven't)
npm install -g vercel

# Navigate to your GoBuy project
cd "c:\Users\topde\Desktop\GoBuy v21"

# Deploy to Vercel
vercel
```

### 2. Set Environment Variables in Vercel Dashboard

After first deploy, go to https://vercel.com/dashboard → Select your project → Settings → Environment Variables

Add these:

- `STRIPE_SECRET_KEY`: Your Stripe secret key (sk*test*...)
- `VERCEL_URL`: Auto-populated (your-app.vercel.app)

### 3. Update Frontend Config

Once deployed, update `js/config.js`:

```javascript
window.APP_CONFIG = {
  // Set to your Vercel domain
  backendBaseUrl: "https://your-app.vercel.app",
  useElements: true,
  stripePublicKey:
    "pk_test_51SendqJAOiRYDWq96KqR4Jzd4wtg0gKTqMQtQYrQrONP53T8s7PaYITUikG4Z05LsC0fwCDHERrt2yzdtG3NcPqF00O3Y7ENXy",
  returnUrl: "https://your-app.vercel.app",
};
```

### 4. Deploy Again

```bash
vercel --prod
```

## Architecture

- **Frontend**: Static HTML/CSS/JS (served by Vercel edge)
- **API**: Serverless functions in `/api/` directory
  - `/api/checkout/session.js` - Stripe Checkout Session
  - `/api/payments/create-intent.js` - Stripe PaymentIntent (for Elements)
  - `/api/orders` - Order management (stub)
  - `/api/webhooks/stripe.js` - Webhook handler (stub)

## Testing Live Payment Flow

1. **Elements Form**: Add to cart → Checkout → Payment form appears in modal
2. **Card Testing**: Use Stripe test cards:
   - Success: `4242 4242 4242 4242` + any future date + any CVC
   - Decline: `4000 0000 0000 0002` + any future date + any CVC
3. **Webhook**: Set up in Stripe Dashboard → Webhooks:
   - URL: `https://your-app.vercel.app/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `charge.failed`

## Local Testing (Before Deploy)

Run local Stripe webhook forwarder:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Then use the signing secret in environment variables.

## Troubleshooting

**"Failed to create PaymentIntent"**

- Check STRIPE_SECRET_KEY is set in Vercel env vars
- Verify API endpoint is accessible

**"CORS error"**

- API includes CORS headers automatically
- Ensure backendBaseUrl matches Vercel domain exactly

**"Demo mode keeps showing"**

- Verify stripePublicKey is set in js/config.js
- Check Network tab → /api/payments/create-intent returns clientSecret

## Next Steps

1. Deploy to Vercel
2. Test Elements checkout with Stripe test cards
3. Implement order persistence (database)
4. Set up real fulfillment integration (AliExpress/CJ)
