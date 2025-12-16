// Vercel serverless function: Create Stripe Checkout Session (skeleton)
// POST /api/checkout/session
// Body: { items: [{ id, qty }], currency: "EUR" }

export default async function handler(req, res) {
  // Basic CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const { items = [], lineItems = [], currency = "EUR" } = req.body || {};

    // If Stripe not configured, return mock (keeps frontend working)
    const sk = process.env.STRIPE_SECRET_KEY;
    if (!sk) {
      return res
        .status(200)
        .json({ sessionId: "sess_mock_" + Date.now(), demo: true });
    }

    // Prefer client-provided lineItems when present, else fallback placeholder
    const fallbackLineItems = items.map((it) => ({
      quantity: Math.max(1, parseInt(it.qty || 1, 10)),
      price_data: {
        currency,
        product_data: { name: `Product ${it.id}` },
        unit_amount: 500,
      },
    }));
    const li =
      Array.isArray(lineItems) && lineItems.length
        ? lineItems
        : fallbackLineItems;

    const origin =
      req.headers.origin || process.env.APP_ORIGIN || "https://example.com";
    const success_url =
      process.env.CHECKOUT_SUCCESS_URL || `${origin}/offline.html#success`;
    const cancel_url =
      process.env.CHECKOUT_CANCEL_URL || `${origin}/offline.html#cancel`;

    let sessionId = null;
    try {
      const stripe = (await import("stripe")).default;
      const client = new stripe(sk, { apiVersion: "2024-06-20" });
      const session = await client.checkout.sessions.create({
        mode: "payment",
        line_items: li,
        success_url,
        cancel_url,
      });
      sessionId = session.id;
    } catch (sdkErr) {
      // Fallback to REST API if SDK isn't available
      try {
        const form = new URLSearchParams();
        form.append("mode", "payment");
        form.append("success_url", success_url);
        form.append("cancel_url", cancel_url);
        li.forEach((item, idx) => {
          form.append(
            `line_items[${idx}][quantity]`,
            String(item.quantity || 1)
          );
          const pd = item.price_data || {};
          const cur = pd.currency || currency || "EUR";
          const name =
            (pd.product_data && pd.product_data.name) || `Product ${idx + 1}`;
          const amt = pd.unit_amount || 500;
          form.append(`line_items[${idx}][price_data][currency]`, cur);
          form.append(
            `line_items[${idx}][price_data][product_data][name]`,
            name
          );
          form.append(
            `line_items[${idx}][price_data][unit_amount]`,
            String(amt)
          );
        });
        const resp = await fetch(
          "https://api.stripe.com/v1/checkout/sessions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sk}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: form.toString(),
          }
        );
        if (!resp.ok) throw new Error(`Stripe REST failed: ${resp.status}`);
        const data = await resp.json();
        sessionId = data.id;
      } catch (restErr) {
        console.error("Stripe SDK+REST failed", restErr);
        throw restErr;
      }
    }

    return res.status(200).json({ sessionId });
  } catch (e) {
    console.error("/api/checkout/session error", e);
    return res.status(500).json({ error: e.message || "Internal error" });
  }
}
