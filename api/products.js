// Vercel serverless function: List products from Supabase
// GET /api/products

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  console.log("[/api/products] Env check:", {
    SUPABASE_URL: !!SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
  });
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "[/api/products] Missing env vars! SUPABASE_URL:",
      !!SUPABASE_URL,
      "KEY:",
      !!SUPABASE_SERVICE_ROLE_KEY
    );
    return res.status(200).json({
      items: [],
      debug: {
        missingEnv: true,
        hasUrl: !!SUPABASE_URL,
        hasKey: !!SUPABASE_SERVICE_ROLE_KEY,
      },
    });
  }

  try {
    const limit = Math.min(parseInt(req.query.limit || "500", 10) || 500, 1000);
    // Remove the limit from URL query — Supabase uses it as URL param, not query
    const url = `${SUPABASE_URL}/rest/v1/products?limit=${limit}`;
    console.log("[/api/products] Fetching from:", url);

    let r = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    // If service role is blocked by RLS, try anon key
    if (!r.ok && r.status === 403) {
      const anonKey = process.env.SUPABASE_ANON_KEY;
      if (anonKey) {
        console.log("[/api/products] 403 with service role, trying anon key");
        r = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
        });
      }
    }

    if (!r.ok) {
      const txt = await r.text();
      console.error("[/api/products] Fetch failed", r.status, txt);
      return res.status(200).json({
        items: [],
        debug: { status: r.status, detail: txt.slice(0, 200) },
      });
    }

    const rawText = await r.text();
    console.log(
      "[/api/products] Raw response text (first 500 chars):",
      rawText.slice(0, 500)
    );
    let rows = [];
    try {
      rows = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("[/api/products] JSON parse error:", parseErr.message);
      return res.status(200).json({
        items: [],
        debug: { parseError: parseErr.message, raw: rawText.slice(0, 200) },
      });
    }

    if (!Array.isArray(rows)) {
      console.error(
        "[/api/products] Response is not array, type:",
        typeof rows
      );
      return res.status(200).json({
        items: [],
        debug: {
          error: "response is not array",
          got: typeof rows,
          value: rows,
        },
      });
    }

    console.log("[/api/products] Got", rows.length, "rows from Supabase");
    const items = rows.map(mapRowToProduct);
    return res.status(200).json({ items, count: items.length });
  } catch (e) {
    console.error("[/api/products] Exception:", e.message, e.stack);
    return res
      .status(200)
      .json({ items: [], error: e.message, stack: e.stack });
  }
}

function mapRowToProduct(row) {
  return {
    id: row.id || undefined,
    name: row.name || "",
    price: toNum(row.price) ?? 0,
    type: row.type || "all",
    image: row.image || null,
    images: Array.isArray(row.images) ? row.images : [],
    features: Array.isArray(row.features) ? row.features : [],
    description: row.description || "",
    rating: toNum(row.rating) ?? 0,
    orders: toInt(row.orders) ?? 0,
    discount: toInt(row.discount) ?? 0,
    originalPrice: toNum(row.original_price) ?? undefined,
    seller: row.seller || "",
    shipFrom: row.ship_from || "",
    freeShip: !!row.free_ship,
    local: !!row.local,
    productUrl: row.product_url || "",
    createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
  };
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
