// Lightweight backend client (stubs + real endpoints ready)
// Use with serverless functions under /api/*

const BACKEND = (function () {
  const cfg = {
    baseUrl: "",
    devMock: true, // stays true until health check confirms backend
  };

  // Pick up config from APP_CONFIG if present
  try {
    if (window.APP_CONFIG) {
      cfg.baseUrl = window.APP_CONFIG.backendBaseUrl || "";
      if (cfg.baseUrl) cfg.devMock = false;
    }
  } catch (_) {}

  function buildUrl(p) {
    try {
      const raw = (cfg.baseUrl || "").trim();
      const base =
        !raw || raw === "/" || raw === "./" ? window.location.origin : raw;
      return new URL(p, base).toString();
    } catch (_) {
      const origin =
        window.location && window.location.origin ? window.location.origin : "";
      return origin + p;
    }
  }
  function isSameOrigin(urlStr) {
    try {
      const u = new URL(urlStr);
      return u.origin === window.location.origin;
    } catch (_) {
      return false;
    }
  }

  let healthChecked = false;
  let healthOk = false;
  async function ensureHealth() {
    if (healthChecked) return healthOk;
    healthChecked = true;
    // Try probing orders endpoint to detect serverless presence
    const raw = (cfg.baseUrl || "").trim();
    try {
      const url = buildUrl("/api/orders?stats=1");
      const res = await fetch(url, { method: "GET" });
      healthOk = res.ok; // 200 when our GET handler exists
      cfg.devMock = !healthOk;
    } catch (_) {
      healthOk = false;
      cfg.devMock = true;
    }
    return healthOk;
  }

  async function post(path, body) {
    // Run health check once to avoid noisy errors in dev
    if (!healthChecked) await ensureHealth();
    if (cfg.devMock) return mockPost(path, body);
    const url = buildUrl(path);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) {
      // Fallback to mock when same-origin backend isn't present
      if (isSameOrigin(url)) return mockPost(path, body);
      throw new Error(`API ${path} failed (${res.status})`);
    }
    return res.json();
  }

  async function get(path) {
    if (!healthChecked) await ensureHealth();
    if (cfg.devMock) return mockGet(path);
    const url = buildUrl(path);
    const res = await fetch(url);
    if (!res.ok) {
      if (isSameOrigin(url)) return mockGet(path);
      throw new Error(`API ${path} failed (${res.status})`);
    }
    return res.json();
  }

  // Public
  return {
    config: cfg,
    // Products
    listProducts: (params) => get("/api/products"),
    syncProducts: (provider, payload) =>
      post("/api/syncProducts", { provider, payload }),
    // Orders
    createOrder: (order) => post("/api/orders", order),
    getOrderStats: () => get("/api/orders?stats=1"),
    // Payments
    createCheckoutSession: (payload) => post("/api/checkout/session", payload),
    createPaymentIntent: (payload) =>
      post("/api/payments/create-intent", payload),
  };

  // -------- DEV MOCKS ---------
  function mockDelay(ms = 350) {
    return new Promise((r) => setTimeout(r, ms));
  }
  async function mockPost(path, body) {
    await mockDelay();
    switch (path) {
      case "/api/checkout/session":
        return { sessionId: "sess_mock_123" };
      case "/api/orders":
        return { orderId: "ord_mock_" + Date.now(), status: "created" };
      case "/api/syncProducts":
        return { ok: true, imported: 42 };
      default:
        return { ok: true };
    }
  }
  async function mockGet(path) {
    await mockDelay();
    if (path === "/api/products") return { items: ALL || [] };
    if (path.startsWith("/api/orders"))
      return {
        ok: true,
        orders: {
          count: 128,
          revenue: 12450.32,
          freeShipPercent: 62,
        },
      };
    return { ok: true };
  }
})();
