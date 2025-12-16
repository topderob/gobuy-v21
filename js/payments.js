// Minimal Stripe Checkout integration stub
// Requires a server endpoint to create Checkout Session

const PAYMENTS = (function () {
  function buildSelectedLineItems() {
    const selected = CART.filter((p) => p.selected !== false);
    const items = selected.map((c) => ({ id: c.id, qty: c.quantity || 1 }));
    const lineItems = selected.map((c) => ({
      quantity: Math.max(1, c.quantity || 1),
      price_data: {
        currency: "EUR",
        product_data: { name: c.name || `Product ${c.id}` },
        unit_amount: Math.round(c.price * 1.21 * 100),
      },
    }));
    return { items, lineItems };
  }

  async function startCheckout() {
    try {
      const { items, lineItems } = buildSelectedLineItems();
      const payload = { items, lineItems, currency: "EUR" };
      const { sessionId } = await BACKEND.createCheckoutSession(payload);

      const pk = (window.APP_CONFIG && window.APP_CONFIG.stripePublicKey) || "";
      if (
        window.Stripe &&
        pk &&
        sessionId &&
        !String(sessionId).startsWith("sess_mock_")
      ) {
        const stripe = Stripe(pk);
        await stripe.redirectToCheckout({ sessionId });
        return { redirected: true };
      }
      showToast("Checkout (test)", "Geen echte sessie — demo voltooid", "info");
      return { demo: true };
    } catch (e) {
      console.error(e);
      showToast("Checkout fout", e.message || "Kon niet afrekenen", "error");
      return { error: true, message: e.message };
    }
  }

  async function startElements() {
    try {
      const { lineItems } = buildSelectedLineItems();
      const pk = (window.APP_CONFIG && window.APP_CONFIG.stripePublicKey) || "";
      if (!window.Stripe || !pk) {
        showToast("Stripe Elements", "Demo-modus: geen echte betaling", "info");
        return;
      }
      const { clientSecret } = await BACKEND.createPaymentIntent({
        currency: "EUR",
        lineItems,
      });
      if (!clientSecret || String(clientSecret).startsWith("pi_mock_")) {
        showToast("Stripe Elements", "Demo-modus: geen echte intent", "info");
        return;
      }
      const stripe = Stripe(pk);
      const elements = stripe.elements({
        appearance: { theme: "stripe" },
        clientSecret,
      });
      const modal = document.getElementById("product-modal");
      if (!modal) return;
      modal.innerHTML = `
        <div class="content" style="max-width:520px">
          <div class="header">
            <h2>💳 Betalen met Stripe</h2>
            <button class="close" onclick="closeModal()">✕</button>
          </div>
          <div class="body" style="display:block;padding:16px">
            <div style="margin-bottom:16px;text-align:center">
              <div style="font-size:28px;font-weight:700;color:var(--primary)">GoBuy</div>
              <div style="font-size:13px;color:var(--muted);margin-top:4px">Veilig betalen via Stripe</div>
            </div>
            <form id="elements-form" style="display:grid;gap:12px">
              <div id="payment-element"></div>
              <button class="btn primary" id="elements-submit" type="submit" style="padding:12px;font-weight:600;width:100%">Afronden</button>
              <div id="payment-message" style="color:var(--muted);font-size:12px;text-align:center;min-height:20px"></div>
            </form>
          </div>
        </div>`;
      modal.classList.remove("hidden");
      const pe = elements.create("payment");
      pe.mount("#payment-element");

      const form = document.getElementById("elements-form");
      const submitBtn = document.getElementById("elements-submit");
      const msgDiv = document.getElementById("payment-message");

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        msgDiv.textContent = "Betaling wordt verwerkt...";

        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url:
              (window.APP_CONFIG && window.APP_CONFIG.returnUrl) ||
              window.location.href,
          },
          redirect: "if_required",
        });

        submitBtn.disabled = false;
        if (error) {
          msgDiv.textContent = error.message || "Betaling mislukt";
          msgDiv.style.color = "#ef4444";
          showToast(
            "Betaling",
            error.message || "Kon betaling niet bevestigen",
            "error"
          );
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
          msgDiv.textContent = "✓ Betaling voltooid!";
          msgDiv.style.color = "#10b981";
          modal.innerHTML = `
            <div class="content" style="max-width:520px">
              <div class="header">
                <h2>✅ Betaling voltooid</h2>
                <button class="close" onclick="closeModal()">✕</button>
              </div>
              <div class="body" style="display:block;padding:20px;text-align:center">
                <div style="font-size:48px;margin-bottom:16px">✓</div>
                <h3 style="margin-bottom:8px">Dank u voor uw bestelling!</h3>
                <p style="color:var(--muted);margin-bottom:16px">Uw betaling is verwerkt en u ontvangt spoedig een bevestigingsmail.</p>
                <div style="background:var(--bg);padding:12px;border-radius:8px;margin-bottom:16px;font-size:13px">
                  <div style="color:var(--muted)">Order ID:</div>
                  <div style="font-weight:600;font-family:monospace">${paymentIntent.id}</div>
                </div>
                <button class="btn primary" onclick="closeModal()" style="width:100%;padding:12px">Doorgaan winkelen</button>
              </div>
            </div>`;
          showToast("Betaling", "Betaling voltooid — dank u!", "success");
        }
      });
    } catch (e) {
      console.error(e);
      showToast(
        "Stripe Elements",
        e.message || "Kon Elements niet starten",
        "error"
      );
    }
  }

  const api = { startCheckout, startElements };
  try {
    window.PAYMENTS = api;
  } catch (_) {}
  return api;
})();
