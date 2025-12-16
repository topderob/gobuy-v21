/* GoBuy Chatbot FAQ Module */

const chatbotFAQ = {
  faqDatabase: [
    {
      id: 1,
      question: "Hoe lang duurt verzending?",
      keywords: ["verzending", "duur", "hoe lang", "levertijd", "dagen"],
      answer:
        "Verzending duurt meestal 7-30 dagen, afhankelijk van de locatie en de verkoper. EU-verzending is sneller (5-14 dagen). Je ziet de exacte levertijd bij het afrekenen! 📦",
    },
    {
      id: 2,
      question: "Wat zijn de verzendkosten?",
      keywords: ["verzend", "kosten", "prijs", "gratis"],
      answer:
        "Veel items hebben **gratis verzending**! Als niet gratis, zijn de kosten laag en worden getoond voordat je betaalt. EU-verzending is altijd goedkoper. 💳",
    },
    {
      id: 3,
      question: "Kan ik producten retourneren?",
      keywords: ["retour", "terug", "terugsturen", "geld terug", "refund"],
      answer:
        "Ja! Je hebt **30 dagen retourrecht** op alle aankopen. Gratis retouren naar het EU-magazijn. Geef een reden op en we regelen het rest. ✅",
    },
    {
      id: 4,
      question: "Welke betaalmethoden accepteren jullie?",
      keywords: ["betaal", "payment", "kaart", "paypal", "creditcard", "iDEAL"],
      answer:
        "We accepteren **alle geldige betaalmethoden**:\n• Creditcard (Visa/Mastercard)\n• PayPal\n• iDEAL\n• Bankoverschrijving\n\nAlles wordt via onze veilige checkout verwerkt. 🔒",
    },
    {
      id: 5,
      question: "Is mijn bestelling veilig?",
      keywords: ["veilig", "beveiliging", "ssl", "encryptie", "privé"],
      answer:
        "Ja! We gebruiken **SSL-encryptie** en PCI-compliance voor alle transacties. Uw gegevens zijn 100% beveiligd. We delen nooit uw betaalgegevens. 🔐",
    },
    {
      id: 6,
      question: "Kan ik mijn bestelling volgen?",
      keywords: ["volgen", "track", "tracking", "waar is", "pakket"],
      answer:
        "Ja! Na verzending ontvang je een **tracking-link**. Je kunt je bestelling real-time volgen via het EU-magazijn totdat het aankomt. 📍",
    },
    {
      id: 7,
      question: "Wat als mijn product niet aankomt?",
      keywords: ["niet aankomst", "vermist", "verloren", "damage", "kapot"],
      answer:
        "Geen zorgen! We hebben **kopersbescherming**. Als je product niet aankomt of beschadigd is, openen we een geschil en je krijgt je geld terug. 💪",
    },
    {
      id: 8,
      question: "Hoe kan ik mijn account verwijderen?",
      keywords: ["account", "verwijderen", "wissen", "delete"],
      answer:
        "Ga naar je accountinstellingen en klik op 'Account verwijderen'. Alle persoonlijke gegevens worden gewist (bestellingen blijven voor administratie). ⚙️",
    },
    {
      id: 9,
      question: "Hebben jullie een fysieke winkel?",
      keywords: ["winkel", "fysiek", "locatie", "kantoor", "bezoeken"],
      answer:
        "We zijn volledig online! Geen fysieke winkels, maar je kunt 24/7 online winkelen. Geen openingstijden, geen wachtrijen! 🌐",
    },
    {
      id: 10,
      question: "Hoe kan ik contact met jullie opnemen?",
      keywords: ["contact", "help", "support", "email", "telefoon"],
      answer:
        "Je kunt me hier via chat bereiken! Ik antwoord op vragen over producten, verzending, retouren. Voor andere zaken: support@gobuy.local 💬",
    },
    {
      id: 11,
      question: "Zijn er kortingen of promoties?",
      keywords: ["korting", "promo", "aanbieding", "sale", "discount"],
      answer:
        "Ja! Many products have **discounts** (tot 60% korting). Veel items hebben ook **free shipping**. Check de categoriepagina's voor hot deals! 🔥",
    },
    {
      id: 12,
      question: "Werken jullie samen met AliExpress?",
      keywords: ["aliexpress", "partner", "samenwerking", "bron"],
      answer:
        "Onze producten zijn van vertrouwde leveranciers, meestal dezelfde als op AliExpress. We controleren alles op kwaliteit en authenticiteit. ✔️",
    },
  ],

  /**
   * Check if message is an FAQ question
   */
  isFAQQuestion: function (message) {
    const msg = message.toLowerCase();

    // Check for common FAQ trigger words
    if (
      msg.match(
        /faq|vraag|hoe|wat|waar|waarom|wanneer|kan|is er|hebben|betaal|verzend|retour|contact|volg|veilig/i
      )
    ) {
      return true;
    }

    // Check if any FAQ keywords match
    return this.faqDatabase.some((faq) =>
      faq.keywords.some((keyword) => msg.includes(keyword))
    );
  },

  /**
   * Find relevant FAQ answers
   */
  searchFAQ: function (query) {
    const q = query.toLowerCase();
    const keywords = q.split(/\s+/).filter((k) => k.length > 2);

    if (keywords.length === 0) {
      return [];
    }

    // Score FAQs by keyword match relevance
    const results = this.faqDatabase
      .map((faq) => {
        let score = 0;

        // Check question match
        keywords.forEach((keyword) => {
          if (faq.question.toLowerCase().includes(keyword)) score += 3;
          if (faq.answer.toLowerCase().includes(keyword)) score += 1;
          faq.keywords.forEach((k) => {
            if (k.includes(keyword) || keyword.includes(k)) score += 2;
          });
        });

        return { faq, score };
      })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((result) => result.faq);

    return results;
  },

  /**
   * Format FAQ answer
   */
  formatFAQAnswer: function (faqs) {
    if (faqs.length === 0) {
      return null;
    }

    let message = "📚 **Veelgestelde vragen:**\n\n";

    faqs.forEach((faq, i) => {
      message += `**${i + 1}. ${faq.question}**\n${faq.answer}\n\n`;
    });

    message += "Heb je nog meer vragen? Je kunt me altijd aanspreken! 💬";
    return message;
  },

  /**
   * Get FAQ response
   */
  getFAQResponse: function (message) {
    if (!this.isFAQQuestion(message)) {
      return null;
    }

    const faqs = this.searchFAQ(message);
    return this.formatFAQAnswer(faqs);
  },
};

// Export
window.chatbotFAQ = chatbotFAQ;
