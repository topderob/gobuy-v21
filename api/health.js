// Simple health check for serverless deployment
// GET /api/health

export default async function handler(req, res) {
  // Basic CORS for cross-origin health checks
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const hasStripe = !!process.env.STRIPE_SECRET_KEY;
    return res.status(200).json({ ok: true, stripeConfigured: hasStripe });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: e.message || "Internal error" });
  }
}
