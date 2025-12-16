/* Language & Currency Selector */

const translations = {
  nl: {
    Sorteren: "Sorteren",
    Slim: "Slim",
    "Prijs ↑": "Prijs ↑",
    "Prijs ↓": "Prijs ↓",
    Populair: "Populair",
    Nieuw: "Nieuw",
    "Per pagina": "Per pagina",
    "Gratis verzending": "Gratis verzending",
    Lokaal: "Lokaal",
    Prijs: "Prijs",
    Merk: "Merk",
    "Min. rating": "Min. rating",
    "Alle merken": "Alle merken",
    Alle: "Alle",
    Elektronica: "Elektronica",
    Keuken: "Keuken",
    "Sport & Gezondheid": "Sport & Gezondheid",
    Wonen: "Wonen",
    Mode: "Mode",
    "In mand": "In mand",
    "Dagdeal: gigantische kortingen": "Dagdeal: gigantische kortingen",
    "Profiteer van EUR-only prijzen en snelle verzending":
      "Profiteer van prijzen en snelle verzending",
    "Geen producten gevonden.": "Geen producten gevonden.",
    Winkelwagen: "Winkelwagen",
    Wishlist: "Wishlist",
    Vergelijken: "Vergelijken",
    "Schrijf review": "Schrijf review",
    "Product details": "Product details",
    Reviews: "Reviews",
    "Ook interessant": "Ook interessant",
    orders: "bestellingen",
    "Gratis verzending": "Gratis verzending",
    "Lokaal magazijn": "Lokaal magazijn",
    Totaal: "Totaal",
    Afrekenen: "Afrekenen",
  },
  de: {
    Sorteren: "Sortieren",
    Slim: "Intelligent",
    "Prijs ↑": "Preis ↑",
    "Prijs ↓": "Preis ↓",
    Populair: "Beliebt",
    Nieuw: "Neu",
    "Per pagina": "Pro Seite",
    "Gratis verzending": "Kostenloser Versand",
    Lokaal: "Lokal",
    Prijs: "Preis",
    Merk: "Marke",
    "Min. rating": "Min. Bewertung",
    "Alle merken": "Alle Marken",
    Alle: "Alle",
    Elektronica: "Elektronik",
    Keuken: "Küche",
    "Sport & Gezondheid": "Sport & Gesundheit",
    Wonen: "Wohnen",
    Mode: "Mode",
    "In mand": "In den Warenkorb",
    "Dagdeal: gigantische kortingen": "Tagesangebot: riesige Rabatte",
    "Profiteer van prijzen en snelle verzending":
      "Genießen Sie Preise und schnelle Lieferung",
    "Geen producten gevonden.": "Keine Produkte gefunden.",
    Winkelwagen: "Warenkorb",
    Wishlist: "Wunschliste",
    Vergelijken: "Vergleichen",
    "Schrijf review": "Bewertung schreiben",
    "Product details": "Produktdetails",
    Reviews: "Bewertungen",
    "Ook interessant": "Auch interessant",
    orders: "Bestellungen",
    "Gratis verzending": "Kostenloser Versand",
    "Lokaal magazijn": "Lokales Lager",
    Totaal: "Gesamt",
    Afrekenen: "Kasse",
  },
  fr: {
    Sorteren: "Trier",
    Slim: "Intelligent",
    "Prijs ↑": "Prix ↑",
    "Prijs ↓": "Prix ↓",
    Populair: "Populaire",
    Nieuw: "Nouveau",
    "Per pagina": "Par page",
    "Gratis verzending": "Livraison gratuite",
    Lokaal: "Local",
    Prijs: "Prix",
    Merk: "Marque",
    "Min. rating": "Note min.",
    "Alle merken": "Toutes les marques",
    Alle: "Tous",
    Elektronica: "Électronique",
    Keuken: "Cuisine",
    "Sport & Gezondheid": "Sport & Santé",
    Wonen: "Habitation",
    Mode: "Mode",
    "In mand": "Ajouter au panier",
    "Dagdeal: gigantische kortingen": "Offre du jour: réductions géantes",
    "Profiteer van prijzen en snelle verzending":
      "Profitez des prix et de la livraison rapide",
    "Geen producten gevonden.": "Aucun produit trouvé.",
    Winkelwagen: "Panier",
    Wishlist: "Liste de souhaits",
    Vergelijken: "Comparer",
    "Schrijf review": "Écrire un avis",
    "Product details": "Détails du produit",
    Reviews: "Avis",
    "Ook interessant": "Aussi intéressant",
    orders: "commandes",
    "Gratis verzending": "Livraison gratuite",
    "Lokaal magazijn": "Entrepôt local",
    Totaal: "Total",
    Afrekenen: "Passer la commande",
  },
  en: {
    Sorteren: "Sort",
    Slim: "Smart",
    "Prijs ↑": "Price ↑",
    "Prijs ↓": "Price ↓",
    Populair: "Popular",
    Nieuw: "New",
    "Per pagina": "Per page",
    "Gratis verzending": "Free shipping",
    Lokaal: "Local",
    Prijs: "Price",
    Merk: "Brand",
    "Min. rating": "Min. rating",
    "Alle merken": "All brands",
    Alle: "All",
    Elektronica: "Electronics",
    Keuken: "Kitchen",
    "Sport & Gezondheid": "Sports & Health",
    Wonen: "Home",
    Mode: "Fashion",
    "In mand": "Add to cart",
    "Dagdeal: gigantische kortingen": "Daily Deal: huge discounts",
    "Profiteer van prijzen en snelle verzending":
      "Enjoy great prices and fast shipping",
    "Geen producten gevonden.": "No products found.",
    Winkelwagen: "Shopping Cart",
    Wishlist: "Wishlist",
    Vergelijken: "Compare",
    "Schrijf review": "Write review",
    "Product details": "Product details",
    Reviews: "Reviews",
    "Ook interessant": "Also interesting",
    orders: "orders",
    "Gratis verzending": "Free shipping",
    "Lokaal magazijn": "Local warehouse",
    Totaal: "Total",
    Afrekenen: "Checkout",
  },
};

// Fallback rates (used if API is unavailable)
const fallbackRates = {
  EUR: 1.0,
  USD: 1.1,
  GBP: 0.86,
};

let exchangeRates = { ...fallbackRates };

const currencySymbols = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

let currentLanguage = "nl";
let currentCurrency = "EUR";

// Fetch real-time exchange rates
async function fetchExchangeRates() {
  try {
    // Using exchangerate-api.com free tier (no authentication required)
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/EUR",
      { method: "GET", headers: { Accept: "application/json" } }
    );

    if (!response.ok) throw new Error("API request failed");

    const data = await response.json();
    const rates = data.rates;

    // Update exchange rates with real-time data
    if (rates.USD) exchangeRates.USD = parseFloat(rates.USD.toFixed(4));
    if (rates.GBP) exchangeRates.GBP = parseFloat(rates.GBP.toFixed(4));

    // Save to localStorage with timestamp
    localStorage.setItem(
      "exchangeRates",
      JSON.stringify({
        rates: exchangeRates,
        timestamp: Date.now(),
      })
    );

    console.log("✓ Real-time exchange rates loaded:", exchangeRates);
    return true;
  } catch (error) {
    console.warn("⚠ Could not fetch real-time rates, using fallback:", error);

    // Try to use cached rates if available
    const cached = localStorage.getItem("exchangeRates");
    if (cached) {
      try {
        const { rates } = JSON.parse(cached);
        exchangeRates = rates;
        console.log("✓ Using cached rates from localStorage");
        return true;
      } catch (e) {
        console.warn("Cached rates invalid, using fallback");
      }
    }

    // Use fallback rates
    exchangeRates = { ...fallbackRates };
    return false;
  }
}

function initLanguageCurrency() {
  const langSelect = document.getElementById("lang-select");
  const currencySelect = document.getElementById("currency-select");

  // Load saved preferences
  currentLanguage = localStorage.getItem("userLanguage") || "nl";
  currentCurrency = localStorage.getItem("userCurrency") || "EUR";

  // Fetch real-time exchange rates on initialization
  fetchExchangeRates();

  if (langSelect) {
    const langOptions = {
      nl: "🇳🇱 NL",
      de: "🇩🇪 DE",
      fr: "🇫🇷 FR",
      en: "🇬🇧 EN",
    };
    langSelect.value = langOptions[currentLanguage] || "🇳🇱 NL";

    langSelect.addEventListener("change", (e) => {
      const langCode = Object.keys(langOptions).find(
        (key) => langOptions[key] === e.target.value
      );
      if (langCode) {
        currentLanguage = langCode;
        localStorage.setItem("userLanguage", langCode);
        applyLanguageAndCurrency();
        showToast("Taal gewijzigd", `Taal is nu ${e.target.value}`, "info");
      }
    });
  }

  if (currencySelect) {
    const currencyOptions = {
      EUR: "EUR €",
      USD: "USD $",
      GBP: "GBP £",
    };
    currencySelect.value = currencyOptions[currentCurrency] || "EUR €";

    currencySelect.addEventListener("change", (e) => {
      const currCode = Object.keys(currencyOptions).find(
        (key) => currencyOptions[key] === e.target.value
      );
      if (currCode) {
        currentCurrency = currCode;
        localStorage.setItem("userCurrency", currCode);
        applyLanguageAndCurrency();
        showToast("Valuta gewijzigd", `Valuta is nu ${e.target.value}`, "info");
      }
    });
  }

  applyLanguageAndCurrency();
}

function translate(text) {
  if (currentLanguage === "nl") return text;
  return translations[currentLanguage]?.[text] || text;
}

function convertPrice(priceInEur) {
  const rate = exchangeRates[currentCurrency] || 1;
  return (priceInEur * rate).toFixed(2);
}

function formatPrice(priceInEur) {
  const converted = convertPrice(priceInEur);
  const symbol = currencySymbols[currentCurrency] || "€";
  return `${symbol}${converted}`;
}

async function applyLanguageAndCurrency() {
  // Update static text elements
  document
    .querySelectorAll("label, button:not([onclick]), h1, h2, h3, h4, span")
    .forEach((el) => {
      const originalText = el.textContent?.trim();
      if (originalText && translations[currentLanguage]?.[originalText]) {
        el.textContent = translations[currentLanguage][originalText];
      }
    });

  // Translate product descriptions (keep titles) and re-render
  if (currentLanguage !== "nl" && typeof translateProducts === "function") {
    try {
      const translatedAll = await translateProducts(ALL, currentLanguage);
      ALL = translatedAll;
      VIEW = [...translatedAll];
    } catch (e) {
      console.warn("Product translation failed", e);
    }
  }

  renderAll();

  // Translate remaining page text nodes (excluding product titles)
  if (typeof translatePageText === "function") {
    translatePageText(currentLanguage).catch((e) =>
      console.warn("Page translation failed", e)
    );
  }
}

function renderAll() {
  // Re-render everything to update prices and translated content
  if (typeof renderGrid === "function") {
    renderGrid();
  }
  if (typeof renderHeroDeals === "function") {
    renderHeroDeals();
  }
  if (typeof renderBanners === "function") {
    renderBanners();
  }
  if (typeof renderBestSellers === "function") {
    renderBestSellers();
  }
  if (typeof renderRecentlyViewed === "function") {
    renderRecentlyViewed();
  }
}

// Initialize when state.js is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => initLanguageCurrency(), 100);
  });
} else {
  setTimeout(() => initLanguageCurrency(), 100);
}
