/* Product Database - GoBuy v21 - Main Loader */

async function fetchProductsFromAPI() {
  await new Promise((r) => setTimeout(r, 100));

  // 1) Try Supabase products table via REST (direct anon key fetch)
  try {
    console.log("[fetchProductsFromAPI] Attempting Supabase fetch...");
    const res = await fetch(
      "https://fuwpjhuusvegecvsqhvn.supabase.co/rest/v1/products?limit=500",
      {
        method: "GET",
        headers: {
          apikey:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1d3BqaHV1c3ZlZ2VjdnNxaHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDYwODEsImV4cCI6MjA4MTQ4MjA4MX0.4HbuTRP0DBBcP1_eimOqN5qehvXtEDb78phVtZ3ZwfU",
          Accept: "application/json",
        },
      }
    );
    console.log(
      "[fetchProductsFromAPI] Response ok:",
      res.ok,
      "Status:",
      res.status
    );
    if (res.ok) {
      const items = await res.json();
      console.log(
        "[fetchProductsFromAPI] Got",
        Array.isArray(items) ? items.length : "non-array",
        "from Supabase"
      );
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
      console.log(
        "[fetchProductsFromAPI] Supabase returned empty array, falling back"
      );
    }
  } catch (e) {
    console.error(
      "[fetchProductsFromAPI] Supabase fetch exception:",
      e.message
    );
  }

  // 2) Fallback: CSV + placeholders
  console.log("[fetchProductsFromAPI] Falling back to CSV + placeholders");
  const base = generatePlaceholderProducts(50);
  const importedCsv = await tryImportCSV();
  if (Array.isArray(importedCsv)) {
    window.CSV_IMPORT_COUNT = importedCsv.length;
  }

  // Include optionally imported products from localStorage (via debug import tool)
  try {
    const importedRaw = localStorage.getItem("importedProducts");
    if (importedRaw) {
      const imported = JSON.parse(importedRaw);
      if (Array.isArray(imported) && imported.length) {
        return [...importedCsv, ...base, ...imported];
      }
    }
  } catch (e) {
    console.warn("Failed to read importedProducts:", e);
  }
  return [...importedCsv, ...base];
}

// Generate placeholder catalog with real image URLs (picsum) and sane product fields
function generatePlaceholderProducts(count = 50) {
  const categories = [
    "elektronika",
    "keuken",
    "sport",
    "huis",
    "mode",
    "speelgoed",
    "beauty",
    "tuin",
    "auto",
    "baby",
  ];
  const adjectives = [
    "Premium",
    "Compact",
    "Pro",
    "Smart",
    "Ultra",
    "Eco",
    "Lite",
    "Max",
    "Quick",
    "Fresh",
  ];
  const nouns = [
    "Headphones",
    "Smartwatch",
    "Airfryer",
    "Laptop Stand",
    "USB Hub",
    "LED Strip",
    "Yoga Mat",
    "Running Shoes",
    "Coffee Grinder",
    "Baby Monitor",
    "Robot Mop",
    "Bike Light",
    "Gaming Mouse",
    "Wireless Charger",
    "Powerbank",
    "Hair Dryer",
    "Vacuum Flask",
    "Desk Lamp",
    "Backpack",
    "Drone Mini",
  ];
  const sellers = [
    "GoBuy EU",
    "FastShip NL",
    "PrimeDeals",
    "LocalHub",
    "Outlet24",
  ];
  const shipOrigins = ["NL", "PL", "DE", "ES", "FR"];

  const products = [];
  for (let i = 0; i < count; i += 1) {
    const cat = categories[i % categories.length];
    const name = `${adjectives[i % adjectives.length]} ${
      nouns[i % nouns.length]
    }`;
    const basePrice = 8 + Math.random() * 60; // net price
    const discount = [0, 10, 15, 20, 25, 30][i % 6];
    const originalPrice = discount
      ? Number((basePrice / (1 - discount / 100)).toFixed(2))
      : basePrice;
    const rating = 3.8 + Math.random() * 1.2;
    const orders = 200 + Math.floor(Math.random() * 12000);
    const seed = `gobuy-${i}`;
    products.push({
      id: `p-${i + 1}`,
      name,
      price: Number(basePrice.toFixed(2)),
      type: cat,
      image: `https://picsum.photos/seed/${seed}-1/600/600`,
      images: [
        `https://picsum.photos/seed/${seed}-1/600/600`,
        `https://picsum.photos/seed/${seed}-2/600/600`,
        `https://picsum.photos/seed/${seed}-3/600/600`,
      ],
      features: [
        "Snelle levering",
        "Goede prijs/kwaliteit",
        "Direct leverbaar",
      ],
      description: `${name} met betrouwbare kwaliteit en snelle verzending binnen de EU.`,
      rating: Number(rating.toFixed(1)),
      orders,
      discount,
      originalPrice,
      seller: sellers[i % sellers.length],
      shipFrom: shipOrigins[i % shipOrigins.length],
      freeShip: i % 2 === 0,
      local: i % 3 === 0,
      productUrl: "https://gobuy-v21.vercel.app/",
    });
  }
  return products;
}

// --- CSV import helper ---
async function tryImportCSV() {
  try {
    const res = await fetch("/import.csv", { cache: "no-store" });
    if (!res.ok) return [];
    const text = await res.text();
    if (!text || text.trim().length === 0) return [];
    const rows = parseCSV(text);
    if (!rows.length) return [];

    const header = rows[0].map((h) => h.trim().toLowerCase());
    const out = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      const obj = {};
      header.forEach((h, idx) => {
        obj[h] = row[idx];
      });
      const id = obj.id || `csv-${i}`;
      const name = obj.name || obj.title || `Product ${i}`;
      const price =
        parseFloat(String(obj.price || obj.netprice || 0).replace(",", ".")) ||
        0;
      const originalPrice =
        parseFloat(
          String(obj.originalprice || obj.msrp || 0).replace(",", ".")
        ) || undefined;
      const rating =
        parseFloat(String(obj.rating || obj.stars || 0).replace(",", ".")) || 0;
      const orders =
        parseInt(obj.orders || obj.sold || obj.sales || "0", 10) || 0;
      const discount = parseInt(obj.discount || obj.off || "0", 10) || 0;
      const typeRaw = (obj.type || obj.category || obj.cat || "").toLowerCase();
      const type = mapCategory(typeRaw) || "all";
      const image =
        obj.image ||
        obj.imageurl ||
        obj.image_url ||
        "https://picsum.photos/seed/csv-" + i + "/600/600";
      const images = (obj.images || "")
        .split(/[;|,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (images.length === 0) images.push(image);
      const seller = obj.seller || obj.brand || obj.merchant || "Imported";
      const shipFrom = obj.shipfrom || obj.origin || "NL";
      const freeShip = normalizeBool(obj.freeship || obj.free_shipping);
      const local = normalizeBool(obj.local || obj.eu || obj.warehouse_eu);
      const productUrl = obj.url || obj.link || "";

      out.push({
        id,
        name,
        price: Number(price.toFixed(2)),
        type,
        image,
        images,
        features: ["Geïmporteerd product"],
        description: obj.description || obj.desc || name,
        rating: Number(isNaN(rating) ? 0 : Number(rating.toFixed(1))),
        orders,
        discount,
        originalPrice,
        seller,
        shipFrom,
        freeShip: !!freeShip,
        local: !!local,
        productUrl,
      });
    }
    window.CSV_IMPORT_HEADERS = header;
    // Fire-and-forget sync to backend (Supabase upsert)
    try {
      if (out.length && window.BACKEND && BACKEND.syncProducts) {
        BACKEND.syncProducts("csv", { items: out }).catch((e) =>
          console.warn("syncProducts failed", e)
        );
      }
    } catch (_) {}
    return out;
  } catch (e) {
    console.warn("CSV import failed:", e);
    return [];
  }
}

function normalizeBool(v) {
  if (typeof v === "boolean") return v;
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "y";
}

function mapCategory(raw) {
  if (!raw) return null;
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
  return m[raw] || raw;
}

// basic CSV parser supporting quoted cells
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
  // flush
  row.push(field);
  rows.push(row);
  // trim trailing empty row if file ends with newline
  while (
    rows.length &&
    rows[rows.length - 1].length === 1 &&
    rows[rows.length - 1][0] === ""
  )
    rows.pop();
  return rows;
}
