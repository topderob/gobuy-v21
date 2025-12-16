/**
 * Email sending function via Resend
 * Triggered after order creation to send confirmation email
 *
 * ENV VARS:
 * RESEND_API_KEY - Your Resend API key from https://resend.com
 * FROM_EMAIL - Sender email (e.g., orders@gobuy.nl)
 */

import { Resend } from "resend";
import { generateOrderConfirmationEmail } from "./order-confirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { order } = req.body;

  if (!order || !order.customer || !order.customer.email) {
    return res.status(400).json({ error: "Missing order or customer email" });
  }

  const fromEmail = process.env.FROM_EMAIL || "orders@gobuy.nl";

  try {
    // Generate HTML email
    const htmlContent = generateOrderConfirmationEmail(order);

    // Send via Resend
    const response = await resend.emails.send({
      from: fromEmail,
      to: order.customer.email,
      subject: `✅ Bestelling bevestigd - #${order.id}`,
      html: htmlContent,
    });

    return res.status(200).json({
      ok: true,
      emailId: response.data?.id,
      message: "Order confirmation email sent successfully",
    });
  } catch (error) {
    console.error("Email sending error:", error);

    // In development/demo, mock success
    if (!process.env.RESEND_API_KEY) {
      return res.status(200).json({
        ok: true,
        mock: true,
        message: "Demo mode: Email would be sent to " + order.customer.email,
      });
    }

    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to send email",
    });
  }
}
