// Vercel serverless function: Stripe webhook handler (skeleton)
// POST /api/webhooks/stripe
// Set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET in environment.

export const config = {
  api: {
    bodyParser: false, // Stripe requires raw body for signature verification
  },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    readable.on("end", () => resolve(Buffer.concat(chunks)));
    readable.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const sk = process.env.STRIPE_SECRET_KEY;
  const wh = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sk || !wh) {
    // Accept silently in demo mode
    return res.status(200).json({ ok: true, demo: true });
  }

  const stripeLib = (await import("stripe")).default;
  const stripe = new stripeLib(sk, { apiVersion: "2024-06-20" });

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, wh);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event types
  switch (event.type) {
    case "checkout.session.completed":
      // TODO: mark order paid, trigger fulfillment adapter
      break;
    default:
      break;
  }

  res.json({ received: true });
}
