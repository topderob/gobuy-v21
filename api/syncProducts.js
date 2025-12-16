// Vercel serverless function: Sync products into Supabase
// POST /api/syncProducts { provider: string, payload: Array|{items:Array} }

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res
      .status(500)
      .json({ error: "Supabase env vars missing (SUPABASE_URL/KEY)" });
  }

  try {
    const { provider, payload } = req.body || {};
    const items = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.items)
      ? payload.items
      : [];
    if (!items.length)
      return res.status(400).json({ error: "No products in payload" });

    const rows = items.map((p) => ({
      id: p.id || null,
      name: p.name || null,
      price: toNum(p.price),
      type: p.type || null,
      image: p.image || null,
      images: Array.isArray(p.images) ? p.images : null,
      features: Array.isArray(p.features) ? p.features : null,
      description: p.description || null,
      rating: toNum(p.rating),
      orders: toInt(p.orders),
      discount: toInt(p.discount),
      original_price: toNum(p.originalPrice),
      seller: p.seller || null,
      ship_from: p.shipFrom || null,
      free_ship: !!p.freeShip,
      local: !!p.local,
      product_url: p.productUrl || null,
      created_at: new Date().toISOString(),
      source: provider || null,
    }));

    const chunkSize = 500;
    let imported = 0;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const batch = rows.slice(i, i + chunkSize);
      const url = `${SUPABASE_URL}/rest/v1/products?on_conflict=id`;
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: "return=minimal,resolution=merge-duplicates",
        },
        body: JSON.stringify(batch),
      });
      if (!r.ok) {
        const text = await r.text();
        return res.status(500).json({
          error: "Supabase upsert failed",
          status: r.status,
          detail: text,
        });
      }
      imported += batch.length;
    }

    return res.status(200).json({ ok: true, imported });
  } catch (e) {
    console.error("/api/syncProducts error", e);
    return res.status(500).json({ error: e.message || "Internal error" });
  }
}

function toNum(v) {
  const n = parseFloat(
    String(v ?? "")
      .toString()
      .replace(",", ".")
  );
  return Number.isFinite(n) ? n : null;
}
function toInt(v) {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) ? n : null;
}
