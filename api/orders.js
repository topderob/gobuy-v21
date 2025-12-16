// Vercel serverless function: Create order and store in Supabase via REST
// POST /api/orders
// Body: { items, customer, totals, paymentStatus }

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method === "GET") return handleGet(req, res);
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (req.query && req.query.debug === "1") {
    return res.status(200).json({
      envPresent: {
        SUPABASE_URL: !!SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
      },
    });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res
      .status(500)
      .json({ error: "Supabase env vars missing (SUPABASE_URL/KEY)" });
  }

  try {
    const body = req.body || {};
    const items = Array.isArray(body.items) ? body.items : [];
    const customer = body.customer || {};
    const totals = body.totals || {};
    const paymentStatus = body.paymentStatus || "pending";

    if (!items.length) return res.status(400).json({ error: "items required" });
    if (!customer.email || !customer.name)
      return res.status(400).json({ error: "customer name/email required" });

    const orderId = `ord_${Date.now()}`;
    const payload = {
      order_id: orderId,
      status: paymentStatus,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone || null,
      customer_address: customer.address || null,
      customer_city: customer.city || null,
      customer_zip: customer.zip || null,
      customer_country: customer.country || null,
      items,
      subtotal: totals.subtotal || 0,
      shipping: totals.shipping || 0,
      total: totals.total || 0,
      vat: totals.vat || null,
      created_at: new Date().toISOString(),
    };

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify([payload]),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.error("Supabase insert failed", insertRes.status, errText);
      return res.status(500).json({
        error: "Supabase insert failed",
        status: insertRes.status,
        detail: errText,
      });
    }

    const [saved] = await insertRes.json();
    return res.status(200).json({ orderId: saved.order_id, status: "created" });
  } catch (e) {
    console.error("/api/orders error", e);
    return res.status(500).json({ error: e.message || "Internal error" });
  }
}

async function handleGet(req, res) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res
      .status(500)
      .json({ error: "Supabase env vars missing (SUPABASE_URL/KEY)" });
  }

  const limit = 500; // cap to keep payload light; enough for vibe stats
  const url = `${SUPABASE_URL}/rest/v1/orders?select=total,shipping,created_at&order=created_at.desc&limit=${limit}`;
  try {
    const supRes = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "count=exact",
      },
    });

    if (!supRes.ok) {
      const errText = await supRes.text();
      console.error("Supabase fetch orders failed", supRes.status, errText);
      return res.status(500).json({
        error: "Supabase fetch orders failed",
        status: supRes.status,
        detail: errText,
      });
    }

    const contentRange = supRes.headers.get("content-range") || ""; // e.g., 0-49/123
    const totalStr = contentRange.split("/")[1];
    const totalOrders = totalStr ? parseInt(totalStr, 10) : null;
    const rows = await supRes.json();
    const count = Number.isFinite(totalOrders) ? totalOrders : rows.length;
    const revenue = rows.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
    const freeShipCount = rows.filter((r) => Number(r.shipping) === 0).length;
    const freeShipPercent = count
      ? Math.round((freeShipCount / count) * 100)
      : 0;

    return res.status(200).json({
      ok: true,
      orders: {
        count,
        revenue,
        freeShipPercent,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.error("/api/orders GET error", e);
    return res
      .status(500)
      .json({ error: e.message || "Internal error while reading orders" });
  }
}
