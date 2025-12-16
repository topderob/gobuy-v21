/* GoBuy Chatbot - Main Orchestrator */

// Wait for page to be ready and products to load
document.addEventListener("DOMContentLoaded", initializeChatbot);

/**
 * Initialize chatbot when products are available
 */
function initializeChatbot() {
  // Wait for products to be loaded (from state.js)
  let attempts = 0;
  const maxAttempts = 100; // 10 seconds (100 * 100ms)

  function checkProductsAndInit() {
    attempts++;

    if (typeof ALL !== "undefined" && ALL && ALL.length > 0) {
      // Products loaded!
      console.log("✓ " + ALL.length + " products available for search");

      // Initialize UI
      if (window.chatbotUI && window.chatbotUI.initChatbot) {
        window.chatbotUI.initChatbot();
      } else {
        console.error(
          "ERROR: Chatbot UI module not loaded. Check script order in index.html"
        );
      }

      return;
    }

    if (attempts >= maxAttempts) {
      console.error(
        "WARNING: Products did not load after 10 seconds. Initializing chatbot anyway."
      );
      if (window.chatbotUI && window.chatbotUI.initChatbot) {
        window.chatbotUI.initChatbot();
      }
      return;
    }

    setTimeout(checkProductsAndInit, 100);
  }

  checkProductsAndInit();

  // Attach toggle button listener
  const toggleBtn = document.getElementById("chat-toggle-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      if (window.chatbotUI && window.chatbotUI.toggleChat) {
        window.chatbotUI.toggleChat();
      }
    });
  }
}
