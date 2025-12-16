/* Auto-translation via DeepL proxy (/api/translate) */

const TRANSLATE_API = "/api/translate";
const translationCache = {};

// Load cache from localStorage
try {
  const cached = localStorage.getItem("translationCache");
  if (cached) Object.assign(translationCache, JSON.parse(cached));
} catch (e) {
  console.warn("Translation cache load failed", e);
}

// Save cache periodically
function saveCache() {
  try {
    localStorage.setItem("translationCache", JSON.stringify(translationCache));
  } catch (e) {
    console.warn("Translation cache save failed", e);
  }
}

// Hash text for cache key
function hashText(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Translate text via backend (DeepL proxy)
async function translateBatch(texts, targetLang) {
  if (targetLang === "nl") return texts;
  const clean = texts.map((t) => t ?? "");

  // use cache
  const cached = [];
  const toTranslate = [];
  const mapIdx = [];
  clean.forEach((t, idx) => {
    const key = `${targetLang}_${hashText(t)}`;
    if (translationCache[key]) {
      cached[idx] = translationCache[key];
    } else {
      mapIdx.push(idx);
      toTranslate.push(t);
    }
  });

  if (toTranslate.length === 0) return cached;

  try {
    const res = await fetch(TRANSLATE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: toTranslate, targetLang }),
    });
    if (!res.ok) throw new Error("Translation API error");
    const data = await res.json();
    const translated = data.translations || toTranslate;
    translated.forEach((tr, i) => {
      const origIdx = mapIdx[i];
      const origText = clean[origIdx];
      const key = `${targetLang}_${hashText(origText)}`;
      translationCache[key] = tr;
      cached[origIdx] = tr;
    });
    saveCache();
    return cached;
  } catch (e) {
    console.warn("Translation failed:", e.message);
    // fallback to originals
    mapIdx.forEach((idx) => (cached[idx] = clean[idx]));
    return cached;
  }
}

async function translateText(text, targetLang) {
  const arr = await translateBatch([text], targetLang);
  return arr[0];
}

// Translate product object (keep product name as-is per requirement)
async function translateProduct(product, targetLang) {
  if (targetLang === "nl") return product;

  const description = product.description
    ? await translateText(product.description, targetLang)
    : null;

  return { ...product, description };
}

// Translate all products
async function translateProducts(products, targetLang) {
  if (targetLang === "nl") return products;

  const translated = await Promise.all(
    products.map((p) => translateProduct(p, targetLang))
  );

  return translated;
}

// Translate visible page text nodes (excluding product titles / no-translate)
async function translatePageText(targetLang) {
  if (targetLang === "nl") return;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const text = node.nodeValue.trim();
        if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest(".title")) return NodeFilter.FILTER_REJECT; // keep product titles
        if (parent.closest("[data-no-translate]"))
          return NodeFilter.FILTER_REJECT;
        if (/^[0-9€$£.,\s-]+$/.test(text)) return NodeFilter.FILTER_REJECT; // numbers/prices
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const nodes = [];
  const texts = [];
  const seen = new Map();
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const t = node.nodeValue.trim();
    if (!seen.has(t)) {
      seen.set(t, []);
      texts.push(t);
    }
    seen.get(t).push(node);
  }

  if (!texts.length) return;

  const translated = await translateBatch(texts, targetLang);
  translated.forEach((tr, idx) => {
    const orig = texts[idx];
    const nodesForText = seen.get(orig) || [];
    nodesForText.forEach((n) => (n.nodeValue = tr));
  });
}
