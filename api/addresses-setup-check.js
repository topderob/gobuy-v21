/**
 * Supabase Addresses Setup Check
 * GET /api/addresses-setup-check
 * Checks if the `addresses` table exists and is accessible.
 * Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(200).json({
      ok: false,
      missingEnv: true,
      message: "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel env.",
    });
  }

  const url = `${SUPABASE_URL.replace(
    /\/$/,
    ""
  )}/rest/v1/addresses?select=id&limit=1`;
  try {
    const r = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: "application/json",
      },
    });
    if (r.status === 404) {
      return res
        .status(200)
        .json({ ok: false, table: "addresses", exists: false });
    }
    if (!r.ok) {
      const txt = await r.text();
      return res
        .status(200)
        .json({ ok: false, error: "PostgREST error", detail: txt });
    }
    const data = await r.json();
    return res
      .status(200)
      .json({
        ok: true,
        table: "addresses",
        exists: true,
        sampleCount: Array.isArray(data) ? data.length : 0,
      });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
