/**
 * Serverless DeepL proxy
 * POST /api/translate
 * Body: { text?: string, texts?: string[], targetLang: 'DE'|'FR'|'EN'|..., sourceLang?: 'NL' }
 */

const DEEPL_API = "https://api-free.deepl.com/v2/translate";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { DEEPL_API_KEY } = process.env;
  const { text, texts, targetLang, sourceLang = "NL" } = req.body || {};

  if (!DEEPL_API_KEY) {
    // No key set: passthrough originals
    const payload = Array.isArray(texts) ? texts : text ? [text] : [];
    return res.status(200).json({ translations: payload });
  }

  if (!targetLang || (!text && !texts)) {
    return res.status(400).json({ error: "Missing text(s) or targetLang" });
  }

  const list = Array.isArray(texts) ? texts : [text];

  try {
    const params = new URLSearchParams();
    params.append("auth_key", DEEPL_API_KEY);
    params.append("target_lang", String(targetLang).toUpperCase());
    params.append("source_lang", String(sourceLang).toUpperCase());
    list.forEach((t) => params.append("text", t));

    const deeplRes = await fetch(DEEPL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!deeplRes.ok) {
      const errText = await deeplRes.text();
      return res
        .status(502)
        .json({ error: "DeepL request failed", detail: errText });
    }

    const data = await deeplRes.json();
    const translations = (data.translations || []).map((t) => t.text || "");
    return res.status(200).json({ translations });
  } catch (e) {
    console.error("/api/translate error", e);
    return res.status(500).json({ error: e.message || "Translation error" });
  }
}
