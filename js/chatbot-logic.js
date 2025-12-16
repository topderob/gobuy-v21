/* GoBuy Chatbot Logic - AI & Responses */

// Global context variables
let chatHistory = [];
let lastSearchResults = [];
let lastViewedProduct = null;
let lastReturnQuery = false; // Track if we asked about returns

// Response templates
const chatbotResponses = {
  greetings: [
    "Hallo! 👋 Hoe kan ik je helpen met GoBuy?",
    "Welkom bij GoBuy! Wat kan ik voor je doen?",
    "Hoi! Heb je vragen over onze producten?",
  ],
  products: [
    "We hebben meer dan 50 producten in 10 categorieën: Elektronica, Keuken, Sport, Mode, Speelgoed, Beauty, Tuin, Auto, Baby en meer!",
    "Je kunt alle producten bekijken via de categorieën bovenaan. Heb je interesse in een specifieke categorie?",
  ],
  shipping: [
    "We verzenden snel en veilig uit Nederland, Polen en andere EU-landen. Gratis verzending op geselecteerde items!",
    "Verzendkosten en levertijd hangen af van je locatie en de verkoper. Check bij het afrekenen voor exacte info.",
  ],
  returns: [
    "Je hebt 30 dagen retourrecht op alle aankopen. Gratis retouren!",
    "Niet tevreden? Geen probleem - je kunt alles retourneren binnen 30 dagen.",
  ],
  payment: [
    "We accepteren alle geldige betaalmethoden via onze veilige checkout.",
    "Je kan betalen met kaart, PayPal en andere veilige methoden.",
  ],
  account: [
    "Je kunt je winkelwagen en wishlist opslaan. Alles wordt automatisch bijgehouden!",
    "Log in om je bestellingen en voorkeuren te beheren.",
  ],
  default: [
    "Dat begrijp ik niet helemaal. Kan je meer details geven?",
    "Interessante vraag! Waar kan ik je nog mee helpen?",
    "Ik ben hier voor vragen over producten, verzending, retouren en bestellingen.",
  ],
};

/**
 * Detect user intent from message
 */
function detectIntent(message) {
  const msg = message.toLowerCase();

  if (msg.match(/hallo|hi|hey|goedemorgen|goedemiddag|goedenavond/))
    return "greetings";
  if (msg.match(/bekijk product|toon product|product \d+|nummer \d+/))
    return "viewProduct";

  // Context-aware "Ja" - can be addToCart, returnYes, or default
  if (
    msg.match(
      /^(ja|ja graag|voeg toe|toevoegen|winkelwagen|wil ik|doe maar|ja graag ik wil|prima)$/
    )
  ) {
    if (lastViewedProduct) {
      return "addToCart";
    } else if (lastReturnQuery) {
      return "returnYes";
    } else {
      return "default";
    }
  }

  // "Nee" - can be returnNo
  if (msg.match(/^(nee|nein|nope|nee hoor|nee dank je)$/)) {
    if (lastReturnQuery) {
      return "returnNo";
    } else {
      return "default";
    }
  }

  if (
    msg.match(
      /zoek|vind|toon|wat heb|ik wil|ik zoek|beschikbaar|hoe zit het met/
    )
  )
    return "search";
  if (msg.match(/verzend|lever|shipping|bezorg|kosten|hoe lang/))
    return "shipping";

  // Return address / return process questions
  if (msg.match(/retour.*adres|adres.*retour|waar.*retour|retouradres/))
    return "returnAddress";

  if (msg.match(/retour|terug|geld terug|niet goed|product terug/))
    return "returns";

  if (msg.match(/betaal|payment|kaart|paypal|prijs/)) return "payment";
  if (msg.match(/account|login|mijn|bestelling|order|wachtwoord/))
    return "account";

  // If message doesn't contain common words, treat as product search
  if (!msg.match(/hoe|waarom|wat is|kun je|kan je|help|vraag|problem|issue/)) {
    if (typeof ALL !== "undefined" && ALL && ALL.length > 0) {
      const results = searchProducts(msg);
      if (results.length > 0) {
        return "search";
      }
    }
  }

  return "default";
}

/**
 * Search products by query
 */
function searchProducts(query) {
  if (typeof ALL === "undefined" || !ALL || ALL.length === 0) {
    console.log("DEBUG: ALL array empty or not found");
    return [];
  }

  const q = query.toLowerCase().trim();
  const keywords = q.split(/\s+/).filter((k) => k.length > 1);

  if (keywords.length === 0) return [];

  const results = ALL.filter((p) => {
    const name = p.name.toLowerCase();
    const desc = p.description.toLowerCase();
    const features = (p.features || []).join(" ").toLowerCase();
    const seller = (p.seller || "").toLowerCase();
    const searchText = `${name} ${desc} ${features} ${seller}`;

    return keywords.some((keyword) => searchText.includes(keyword));
  });

  // Sort by relevance
  return results
    .sort((a, b) => {
      const aText = a.name.toLowerCase();
      const bText = b.name.toLowerCase();
      const exactA = aText === q ? 1 : 0;
      const exactB = bText === q ? 1 : 0;
      if (exactA !== exactB) return exactB - exactA;

      const matchesA = keywords.filter(
        (k) => aText.includes(k) || a.description.toLowerCase().includes(k)
      ).length;
      const matchesB = keywords.filter(
        (k) => bText.includes(k) || b.description.toLowerCase().includes(k)
      ).length;
      return matchesB - matchesA;
    })
    .slice(0, 5);
}

/**
 * Format product search results
 */
function formatProductResult(products) {
  if (products.length === 0) {
    return "Sorry, geen producten gevonden met die zoekopdracht. Probeer een ander woord? 🔍";
  }

  lastSearchResults = products;

  // Return a special marker so the UI knows to render product cards
  return {
    type: "productCards",
    products: products,
    message: `Ik vond ${products.length} product${
      products.length > 1 ? "en" : ""
    } voor je:`,
  };
}

/**
 * Get chatbot response based on intent
 */
function getResponse(message) {
  // Check FAQ first (before intent detection)
  if (typeof window.chatbotFAQ !== "undefined") {
    const faqResponse = window.chatbotFAQ.getFAQResponse(message);
    if (faqResponse) {
      return faqResponse;
    }
  }

  const intent = detectIntent(message);

  if (intent === "viewProduct") {
    const match = message.match(/\d+/);
    if (!match) {
      return "Welk product wil je bekijken? Zeg bijvoorbeeld: 'bekijk product 1' 🔢";
    }

    const productNum = parseInt(match[0], 10);

    if (lastSearchResults.length === 0) {
      return "Zoek eerst naar producten voordat je er één kunt bekijken! 🔍";
    }

    if (productNum < 1 || productNum > lastSearchResults.length) {
      return `Product nummer ${productNum} bestaat niet. Kies een nummer tussen 1 en ${lastSearchResults.length} 👆`;
    }

    const product = lastSearchResults[productNum - 1];
    lastViewedProduct = product;

    const price = (product.price * 1.21).toFixed(2);
    const originalPrice = product.originalPrice
      ? (product.originalPrice * 1.21).toFixed(2)
      : null;

    let details = `**${product.name}**\n\n`;
    details += `💰 Prijs: €${price}`;
    if (originalPrice && product.discount) {
      details += ` (was €${originalPrice}, **${product.discount}% korting!**)\n`;
    } else {
      details += `\n`;
    }
    details += `⭐ ${product.rating.toFixed(1)}/5.0 (${
      product.orders
    } bestellingen)\n`;
    details += `🏪 Verkoper: ${product.seller}\n`;
    details += `📦 Verzenden vanaf: ${product.shipFrom}\n`;
    if (product.freeShip) details += `✅ Gratis verzending!\n`;
    if (product.local) details += `🇳🇱 Lokaal magazijn\n`;
    details += `\n📝 ${product.description}\n\n`;

    if (product.features && product.features.length > 0) {
      details += `**Features:**\n`;
      product.features.slice(0, 3).forEach((f) => {
        details += `• ${f}\n`;
      });
    }

    details += `\n💬 Wil je dit product toevoegen aan je winkelwagen?\nZeg "ja" of "toevoegen" om het toe te voegen! 🛒`;
    return details;
  }

  if (intent === "addToCart") {
    if (!lastViewedProduct) {
      return "Bekijk eerst een product voordat je het kunt toevoegen! 🔍";
    }

    if (typeof addToCart === "function") {
      addToCart(lastViewedProduct);
      const price = (lastViewedProduct.price * 1.21).toFixed(2);
      const response = `✅ **${lastViewedProduct.name}** is toegevoegd aan je winkelwagen!\n💰 Prijs: €${price}\n\nWil je nog meer producten zoeken? 🔍`;
      lastViewedProduct = null;
      return response;
    } else {
      return "Sorry, er ging iets mis. Probeer het product handmatig toe te voegen. 😅";
    }
  }

  if (intent === "returnAddress") {
    // Check if user is logged in
    const isLoggedIn =
      typeof window.currentUser !== "undefined" &&
      window.currentUser &&
      window.currentUser.id;

    lastReturnQuery = true; // Set context for "ja" response

    if (isLoggedIn) {
      return `📦 **Retouren regelen:**\nJe bent ingelogd! Zal ik de retourpagina voor je openen?\n\nZeg "ja" en ik open je retouroverzicht waar je alle retourdetails en het retouradres kunt vinden. 🔄`;
    } else {
      return `📦 **Retouren regelen:**\nWil je een product retouren?\n\n**Stappen:**\n1️⃣ Log in in je account\n2️⃣ Ga naar "Mijn bestellingen"\n3️⃣ Klik op "Retouren" bij het product\n4️⃣ Volg de instructies (je ziet het retouradres)\n\nHeb je een account? Zeg "ja" als je wilt dat ik je helpt met inloggen! 🔐`;
    }
  }

  if (intent === "returnYes") {
    lastReturnQuery = false; // Reset context
    const isLoggedIn =
      typeof window.currentUser !== "undefined" &&
      window.currentUser &&
      window.currentUser.id;

    if (isLoggedIn) {
      // Call function to open returns page
      if (typeof openReturnsPage === "function") {
        openReturnsPage();
        return `✅ **Retourpagina geopend!**\n\nJe ziet nu:\n📋 Je openstaande retourvragen\n📮 **Retouradres:** Netherlands Warehouse\nStapelstraat 50, 2132 PN Hoofddorp\n\n💡 Selecteer het product en volg de retourinstructies. Gratis retourneren! 🎁`;
      } else {
        return `✅ **Prima!**\n\nGa naar je account en klik op "Mijn bestellingen" → "Retouren"\n\n📮 **Retouradres:**\nNetherlands Warehouse\nStapelstraat 50\n2132 PN Hoofddorp\n\nGratis terugsturen! 🎁`;
      }
    } else {
      return `✅ **Oké!** Laten we je helpen inloggen.\n\n1. Ga naar "Mijn Account" (bovenaan)\n2. Voer je email en wachtwoord in\n3. Ga vervolgens naar "Mijn bestellingen" → "Retouren"\n\n📮 **Retouradres:**\nNetherlands Warehouse\nStapelstraat 50\n2132 PN Hoofddorp`;
    }
  }

  if (intent === "returnNo") {
    lastReturnQuery = false; // Reset context
    return `✅ **Prima!**\n\nJe kunt mij altijd bellen voor vragen over retouren. Heb je nog andere vragen? 😊`;
  }

  if (intent === "search") {
    let query = message
      .replace(
        /zoek|vind|toon|wat heb|ik wil|ik zoek|beschikbaar|hoe zit het met/gi,
        ""
      )
      .trim();

    if (!query || query.length < 1) {
      query = message.trim();
    }

    // Wait for products with exponential backoff
    if (typeof ALL === "undefined" || !ALL || ALL.length === 0) {
      return new Promise((resolve) => {
        let attempts = 0;
        const checkAgain = setInterval(() => {
          attempts++;

          if (typeof ALL !== "undefined" && ALL && ALL.length > 0) {
            clearInterval(checkAgain);
            const results = searchProducts(query);
            console.log(
              `DEBUG: Searched for "${query}", found ${results.length} results after wait`
            );

            if (results.length === 0) {
              resolve(
                `Sorry, geen producten gevonden voor "${query}". Probeer een ander woord? 🔍`
              );
            } else {
              resolve(formatProductResult(results));
            }
          } else if (attempts > 50) {
            clearInterval(checkAgain);
            resolve(
              "Producten kunnen niet geladen worden. Vernieuw de pagina alstublieft."
            );
          }
        }, 100);
      });
    }

    const results = searchProducts(query);
    console.log(
      `DEBUG: Searched for "${query}", found ${results.length} results`
    );

    if (results.length === 0) {
      return `Sorry, geen producten gevonden voor "${query}". Probeer een ander woord? 🔍`;
    }

    return formatProductResult(results);
  }

  const responses = chatbotResponses[intent];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Export functions (for modular architecture)
window.chatbotLogic = {
  detectIntent,
  searchProducts,
  formatProductResult,
  getResponse,
  chatbotResponses,
};
