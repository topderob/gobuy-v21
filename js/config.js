// App configuration (frontend-only). Safe defaults keep everything in mock mode.
window.APP_CONFIG = {
  // When deploying serverless endpoints, set your base URL (same origin or full URL)
  // Example: "/" (same origin) or "https://your-vercel-app.vercel.app"
  backendBaseUrl: "/",

  // Use Stripe Elements (in-page) as primary checkout
  useElements: true,

  // Optional: still show a secondary Stripe Checkout button (redirect)
  showStripeButton: false,

  // Optional Stripe public key (for real redirect/Elements). Leave empty to keep in demo mode.
  stripePublicKey:
    "pk_test_51SendqJAOiRYDWq96KqR4Jzd4wtg0gKTqMQtQYrQrONP53T8s7PaYITUikG4Z05LsC0fwCDHERrt2yzdtG3NcPqF00O3Y7ENXy",

  // Optional return URL for Elements confirmation (fallbacks to current page)
  returnUrl: "",
};
