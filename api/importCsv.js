// Server-side CSV import: fetches /import.csv and upserts to Supabase
// GET /api/importCsv

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res
      .status(500)
      .json({ error: "Supabase env vars missing (SUPABASE_URL/KEY)" });
  }

  try {
    const origin = req.headers["x-forwarded-host"]
      ? `https://${req.headers["x-forwarded-host"]}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "";
    const csvUrl = `${origin}/import.csv`;
    const csvRes = await fetch(csvUrl);
    if (!csvRes.ok)
      return res.status(404).json({ error: "import.csv not found" });
    const text = await csvRes.text();
    const rows = parseCSV(text);
    if (!rows.length) return res.status(400).json({ error: "CSV empty" });

    // CSV has no header - hardcoded columns: name,price,description,category,image1,image2,image3,seller,orders
    const items = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r[0]) continue; // skip empty rows
      const id = `csv-${i + 1}`;
      const obj = {
        name: r[0],
        price: r[1],
        description: r[2],
        category: r[3],
        image: r[4],
        image2: r[5],
        image3: r[6],
        seller: r[7],
        orders: r[8],
      };
      items.push(mapCsvToRow(obj, id));
    }

    // Upsert to Supabase
    const chunkSize = 500;
    let imported = 0;
    for (let i = 0; i < items.length; i += chunkSize) {
      const batch = items.slice(i, i + chunkSize);
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
        const txt = await r.text();
        return res.status(500).json({ error: "upsert failed", detail: txt });
      }
      imported += batch.length;
    }

    return res.status(200).json({ ok: true, imported });
  } catch (e) {
    console.error("/api/importCsv error", e);
    return res.status(500).json({ error: e.message || "Internal error" });
  }
}

function mapCsvToRow(obj, id) {
  const price = toNum(obj.price);
  const orders = toInt(obj.orders);
  const images = [obj.image, obj.image2, obj.image3].filter(Boolean);

  // Generate random metadata
  const rating = 3.8 + Math.random() * 1.2;
  const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 60) : 0;
  const original_price = discount ? price * (1 + discount / 100) : null;

  return {
    id,
    name: obj.name || id,
    price,
    type: mapCategory(obj.category) || "all",
    image: obj.image || null,
    images: images.length > 1 ? images : null,
    features: null,
    description: obj.description || null,
    rating: Math.round(rating * 10) / 10,
    orders: orders || Math.floor(50 + Math.random() * 500),
    discount,
    original_price,
    seller: obj.seller || "GoBuy Store",
    ship_from: ["NL", "DE", "PL", "ES"][Math.floor(Math.random() * 4)],
    free_ship: Math.random() > 0.5,
    local: Math.random() > 0.6,
    product_url: null,
    created_at: new Date().toISOString(),
    source: "csv",
  };
}

function normalizeBool(v) {
  if (typeof v === "boolean") return v;
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "y";
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
function mapCategory(raw) {
  if (!raw) return null;
  const s = String(raw).toLowerCase();
  const m = {
    elektronica: "elektronica",
    electronics: "elektronica",
    kitchen: "keuken",
    keuken: "keuken",
    sport: "sportengezondheid",
    health: "sportengezondheid",
    wonen: "wonenenzo",
    home: "wonenenzo",
    mode: "mode",
    fashion: "mode",
    speelgoed: "speelgoed",
    toys: "speelgoed",
    beauty: "beauty",
    tuin: "tuin",
    garden: "tuin",
    auto: "automotor",
    automotor: "automotor",
    car: "automotor",
    baby: "babykind",
  };
  return m[s] || s;
}

// Basic CSV parser (same as frontend)
function parseCSV(text) {
  const rows = [];
  let i = 0,
    field = "",
    row = [],
    inQuotes = false;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    if (ch === "\r") {
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  row.push(field);
  rows.push(row);
  while (
    rows.length &&
    rows[rows.length - 1].length === 1 &&
    rows[rows.length - 1][0] === ""
  )
    rows.pop();
  return rows;
}
