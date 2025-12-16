// Vercel serverless function: Create Stripe PaymentIntent (for Stripe Elements)
// POST /api/payments/create-intent
// Body: { currency: "EUR", lineItems: [{ quantity, price_data: { unit_amount, currency } }] }

export default async function handler(req, res) {
  // Basic CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { lineItems = [], currency = "EUR" } = req.body || {};

    // Compute amount safely on server
    const amount = (Array.isArray(lineItems) ? lineItems : []).reduce(
      (sum, item) => {
        const qty = Math.max(1, parseInt(item.quantity || 1, 10));
        const pd = item.price_data || {};
        const amt = Math.max(0, parseInt(pd.unit_amount || 0, 10));
        return sum + qty * amt;
      },
      0
    );

    const sk = process.env.STRIPE_SECRET_KEY;
    if (!sk) {
      // Demo mode: return mock client secret-like value
      return res
        .status(200)
        .json({
          clientSecret: `pi_mock_${Date.now()}_secret_demo`,
          demo: true,
        });
    }

    const stripe = (await import("stripe")).default;
    const client = new stripe(sk, { apiVersion: "2024-06-20" });
    const intent = await client.paymentIntents.create({
      amount: Math.max(50, amount), // minimal guard: >= €0.50
      currency: (currency || "EUR").toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: { source: "gobuy-elements" },
    });

    return res.status(200).json({ clientSecret: intent.client_secret });
  } catch (e) {
    console.error("/api/payments/create-intent error", e);
    return res.status(500).json({ error: e.message || "Internal error" });
  }
}
