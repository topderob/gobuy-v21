/**
 * Email template generator for order confirmation
 * Generates HTML email matching GoBuy website styling
 */

export function generateOrderConfirmationEmail(order) {
  const itemsHTML = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e9e9e9;">
        <img src="${item.image}" alt="${
        item.name
      }" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;" />
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e9e9e9;">
        <div style="font-weight: 600; color: #141414;">${item.name}</div>
        <div style="font-size: 13px; color: #666; margin-top: 4px;">Qty: ${
          item.quantity || 1
        }</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e9e9e9; text-align: right;">
        <div style="font-weight: 600; color: #141414;">€${(
          item.price *
          1.21 *
          (item.quantity || 1)
        ).toFixed(2)}</div>
      </td>
    </tr>
  `
    )
    .join("");

  const shippingColor = order.shipping === 0 ? "#10b981" : "#141414";
  const shippingText =
    order.shipping === 0 ? "GRATIS" : `€${order.shipping.toFixed(2)}`;

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bestelling bevestiging - GoBuy</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: #e5e5e5;
      color: #141414;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #ff6a00 0%, #ff8533 100%);
      color: #fff;
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 32px;
    }
    .section {
      margin-bottom: 32px;
    }
    .section h2 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 700;
      color: #141414;
      border-bottom: 2px solid #2dd4bf;
      padding-bottom: 12px;
    }
    .order-number {
      background: #e5e5e5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .order-number span {
      font-weight: 700;
      color: #ff6a00;
      font-size: 18px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e9e9e9;
      font-size: 14px;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #666;
      font-weight: 500;
    }
    .info-value {
      color: #141414;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .total-section {
      background: #e5e5e5;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .total-row.grand-total {
      font-size: 18px;
      font-weight: 700;
      border-top: 2px solid #d1d5db;
      padding-top: 12px;
      margin-top: 12px;
      color: #ff6a00;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
      color: #fff;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 16px 0;
    }
    .footer {
      background: #f8f8f8;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #e9e9e9;
    }
    .footer a {
      color: #ff6a00;
      text-decoration: none;
    }
    .payment-method {
      background: #f0fdf4;
      padding: 12px;
      border-left: 4px solid #10b981;
      border-radius: 4px;
      margin: 12px 0;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>✅ Bestelling geplaatst!</h1>
      <p>Bedankt voor je aankoop bij GoBuy</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Greeting -->
      <p style="margin-top: 0; font-size: 16px;">
        Hallo <strong>${order.customer.name}</strong>,
      </p>
      <p style="color: #666; line-height: 1.6;">
        We hebben je bestelling ontvangen en zetten deze direct in behandeling. Je ontvangt een tracking-link zodra het pakket wordt verzonden!
      </p>

      <!-- Order Number -->
      <div class="order-number">
        <div style="font-size: 12px; color: #666;">Bestelnummer</div>
        <span>#${order.id}</span>
        <div style="font-size: 12px; color: #666; margin-top: 8px;">Geplaatst: ${
          order.date
        }</div>
      </div>

      <!-- Items Section -->
      <div class="section">
        <h2>📦 Jouw bestelling</h2>
        <table>
          ${itemsHTML}
        </table>
      </div>

      <!-- Pricing Summary -->
      <div class="total-section">
        <div class="total-row">
          <span class="info-label">Subtotaal:</span>
          <span>€${order.subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span class="info-label">Verzending (${order.shippingCountry}):</span>
          <span style="color: ${shippingColor}; font-weight: 700;">${shippingText}</span>
        </div>
        <div class="total-row grand-total">
          <span>TOTAAL BETAALD:</span>
          <span>€${order.totalEur.toFixed(2)}</span>
        </div>
      </div>

      <!-- Shipping Address -->
      <div class="section">
        <h2>📍 Verzendadres</h2>
        <div style="padding: 16px; background: #f8f8f8; border-radius: 8px; line-height: 1.8;">
          <strong>${order.customer.name}</strong><br>
          ${order.customer.address}<br>
          ${order.customer.zip} ${order.customer.city}<br>
          ${order.customer.country}
        </div>
      </div>

      <!-- Billing Address (if different) -->
      ${
        order.billingAddress
          ? `
      <div class="section">
        <h2>💳 Factuuradres</h2>
        <div style="padding: 16px; background: #f8f8f8; border-radius: 8px; line-height: 1.8;">
          ${order.billingAddress.address}<br>
          ${order.billingAddress.zip} ${order.billingAddress.city}
        </div>
      </div>
      `
          : ""
      }

      <!-- Payment Method -->
      <div class="section">
        <h2>💰 Betaalmethode</h2>
        <div class="payment-method">
          <strong>${getPaymentMethodLabel(order.paymentMethod)}</strong><br>
          Status: <strong style="color: #10b981;">✅ Betaald</strong>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://gobuy-v21.vercel.app/orders" class="cta-button">
          📦 Volg je bestelling
        </a>
      </div>

      <!-- Support Info -->
      <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 32px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; font-size: 13px; color: #92400e;">
          <strong>❓ Vragen?</strong> Neem contact op met onze klantenservice via het chatbot onderaan onze website, of stuur een email naar <strong>support@gobuy.nl</strong>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 8px 0;">
        © 2025 GoBuy - The Ultimate Shopping Experience
      </p>
      <p style="margin: 0;">
        <a href="https://gobuy-v21.vercel.app/">Terug naar winkel</a> | 
        <a href="https://gobuy-v21.vercel.app/orders">Mijn bestellingen</a> | 
        <a href="https://gobuy-v21.vercel.app/">Contact</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
function getPaymentMethodLabel(method) {
  const labels = {
    ideal: "🏦 iDEAL",
    klarna: "✨ Klarna",
    visa: "💳 Visa / Mastercard",
    paypal: "🅿️ PayPal",
    transfer: "🏦 Bankoverschrijving",
  };
  return labels[method] || method;
}
