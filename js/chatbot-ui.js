/* GoBuy Chatbot UI - DOM & Interface */

/**
 * Initialize chatbot UI - create widget and attach listeners
 */
function initChatbot() {
  // Create widget HTML
  const widget = document.createElement("div");
  widget.id = "chat-widget";
  widget.className = "chat-widget";
  widget.innerHTML = `
    <div class="chat-header">
      <span class="chat-title">🤖 GoBuy Bot</span>
      <button class="chat-close" id="chat-close-btn">✕</button>
    </div>
    <div class="chat-messages" id="chat-messages">
      <div class="chat-bubble bot">
        <strong>GoBuy Bot:</strong><br>
        Hallo! Hoe kan ik je helpen met onze producten? 👋<br><br>
        💡 <strong>Tips:</strong><br>
        • Zeg "zoek [product]" om producten te vinden<br>
        • Zeg "bekijk product 1" voor details<br>
        • Zeg "ja" om toe te voegen aan winkelwagen<br>
        • Vragen over verzending, retouren, betaling?
      </div>
    </div>
    <div class="chat-input-area">
      <input
        type="text"
        id="chat-input"
        placeholder="Type je bericht..."
        class="chat-input"
      />
      <button id="chat-send-btn" class="chat-send">→</button>
    </div>
  `;
  document.body.appendChild(widget);

  // Load chat history
  loadChatHistory();

  // Attach event listeners
  document
    .getElementById("chat-close-btn")
    .addEventListener("click", closeChat);
  document
    .getElementById("chat-send-btn")
    .addEventListener("click", sendMessage);
  document.getElementById("chat-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Make draggable
  makeChatDraggable();

  console.log("✅ Chatbot UI initialized");
}

/**
 * Toggle chat visibility
 */
function toggleChat() {
  const widget = document.getElementById("chat-widget");
  const toggle = document.getElementById("chat-toggle-btn");

  if (!widget) {
    initChatbot();
  }

  // Toggle using CSS class (not display property)
  widget.classList.toggle("active");
  toggle.classList.toggle("active");

  if (widget.classList.contains("active")) {
    const messages = document.getElementById("chat-messages");
    setTimeout(() => {
      messages.scrollTop = messages.scrollHeight;
    }, 100);
  }
}

/**
 * Close chat
 */
function closeChat() {
  const widget = document.getElementById("chat-widget");
  if (widget) widget.classList.remove("active");

  const toggle = document.getElementById("chat-toggle-btn");
  if (toggle) toggle.classList.remove("active");
}

/**
 * Send message and get response
 */
async function sendMessage() {
  const input = document.getElementById("chat-input");
  const message = input.value.trim();

  if (!message) return;

  // Check if chatbot logic is available
  if (!window.chatbotLogic) {
    console.error("ERROR: Chatbot logic not loaded!");
    addMessage(
      "❌ Chatbot kon niet starten. Vernieuw de pagina alstublieft.",
      "bot"
    );
    return;
  }

  // Add user message
  addMessage(message, "user");
  input.value = "";

  // Show typing indicator
  addMessage("", "typing");

  // Get response
  try {
    let response = window.chatbotLogic.getResponse(message);

    // Handle async responses (like waiting for products)
    if (response instanceof Promise) {
      response = await response;
    }

    // Remove typing indicator
    const typingBubble = document.querySelector(".chat-bubble.typing");
    if (typingBubble) typingBubble.remove();

    // Add bot response
    addMessage(response, "bot");
  } catch (error) {
    console.error("ERROR in chatbot response:", error);
    const typingBubble = document.querySelector(".chat-bubble.typing");
    if (typingBubble) typingBubble.remove();
    addMessage("Sorry, er ging iets mis. Probeer het opnieuw. 😅", "bot");
  }

  // Save history
  saveChatHistory();
}

/**
 * Add message to chat
 */
function addMessage(text, sender = "bot") {
  const messagesDiv = document.getElementById("chat-messages");
  if (!messagesDiv) return;

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;

  if (sender === "typing") {
    bubble.innerHTML =
      '<span class="chat-typing"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span>';
  } else if (sender === "user") {
    bubble.textContent = text;
  } else if (typeof text === "object" && text.type === "productCards") {
    // Render product cards
    let html = `<strong>GoBuy Bot:</strong><br>${text.message}<br><br>`;
    html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-top: 12px;">`;

    text.products.slice(0, 6).forEach((p, i) => {
      const price = (p.price * 1.21).toFixed(2);
      html += `
        <div style="background: var(--card); border: 1px solid var(--border); padding: 10px; border-radius: 8px; cursor: pointer; text-align: center; transition: transform 0.2s;" 
             onmouseover="this.style.transform='scale(1.05)'" 
             onmouseout="this.style.transform='scale(1)'"
             onclick="openProductModal(ALL.find(x => x.id === '${p.id}'))">
          <img src="${
            p.image
          }" style="width: 100%; height: 100px; object-fit: cover; border-radius: 6px; margin-bottom: 8px; background: var(--bg);" />
          <div style="font-size: 11px; font-weight: 600; margin-bottom: 4px; line-height: 1.2;">${p.name.substring(
            0,
            20
          )}...</div>
          <div style="font-size: 13px; font-weight: 700; color: var(--primary);">€${price}</div>
          <div style="font-size: 10px; color: var(--muted);">⭐ ${p.rating.toFixed(
            1
          )}</div>
        </div>
      `;
    });

    html += `</div>`;
    bubble.innerHTML = html;
  } else {
    // Format bot message with markdown-like formatting
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
    bubble.innerHTML = `<strong>GoBuy Bot:</strong><br>${formatted}`;
  }

  messagesDiv.appendChild(bubble);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // Keep chat history in sync (skip product cards)
  if (
    sender !== "typing" &&
    !(typeof text === "object" && text.type === "productCards")
  ) {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    chatHistory.push({
      sender,
      text: typeof text === "string" ? text : JSON.stringify(text),
      timestamp: Date.now(),
    });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }
}

/**
 * Save chat history to localStorage
 */
function saveChatHistory() {
  const messagesDiv = document.getElementById("chat-messages");
  if (!messagesDiv) return;

  const messages = [];
  messagesDiv
    .querySelectorAll(".chat-bubble:not(.typing)")
    .forEach((bubble) => {
      const isUser = bubble.classList.contains("user");
      const isBot = bubble.classList.contains("bot");

      if (isUser || isBot) {
        messages.push({
          sender: isUser ? "user" : "bot",
          text: isUser
            ? bubble.textContent
            : bubble.innerHTML.replace(/^<strong>GoBuy Bot:<\/strong><br>/, ""),
          timestamp: Date.now(),
        });
      }
    });

  // Keep only last 50 messages
  if (messages.length > 50) {
    messages.splice(0, messages.length - 50);
  }

  localStorage.setItem("chatHistory", JSON.stringify(messages));
}

/**
 * Load chat history from localStorage
 */
function loadChatHistory() {
  const messagesDiv = document.getElementById("chat-messages");
  if (!messagesDiv) return;

  const stored = localStorage.getItem("chatHistory");
  if (!stored) return;

  try {
    const history = JSON.parse(stored);
    // Keep first greeting, remove others
    const bubbles = messagesDiv.querySelectorAll(".chat-bubble");
    if (bubbles.length > 1) {
      bubbles.forEach((b, i) => {
        if (i > 0) b.remove();
      });
    }

    // Load last 20 messages
    history.slice(-20).forEach((msg) => {
      const bubble = document.createElement("div");
      bubble.className = `chat-bubble ${msg.sender}`;

      if (msg.sender === "user") {
        bubble.textContent = msg.text;
      } else {
        let formatted = msg.text
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\n/g, "<br>");
        bubble.innerHTML = `<strong>GoBuy Bot:</strong><br>${formatted}`;
      }

      messagesDiv.appendChild(bubble);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  } catch (e) {
    console.error("Error loading chat history:", e);
  }
}

/**
 * Make chat widget draggable
 */
function makeChatDraggable() {
  const widget = document.getElementById("chat-widget");
  const header = document.querySelector(".chat-header");

  if (!widget || !header) return;

  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  header.addEventListener("mousedown", dragStart);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", dragEnd);

  function dragStart(e) {
    initialX = e.clientX - widget.offsetLeft;
    initialY = e.clientY - widget.offsetTop;
    isDragging = true;
    widget.style.transition = "none";
  }

  function drag(e) {
    if (!isDragging) return;

    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;

    // Constrain to viewport
    const maxX = window.innerWidth - widget.offsetWidth;
    const maxY = window.innerHeight - widget.offsetHeight;

    currentX = Math.max(0, Math.min(currentX, maxX));
    currentY = Math.max(0, Math.min(currentY, maxY));

    widget.style.left = currentX + "px";
    widget.style.top = currentY + "px";
  }

  function dragEnd() {
    isDragging = false;
    widget.style.transition = "transform 0.3s ease";
  }
}

// Export functions (for modular architecture)
window.chatbotUI = {
  initChatbot,
  toggleChat,
  closeChat,
  sendMessage,
  addMessage,
  saveChatHistory,
  loadChatHistory,
  makeChatDraggable,
};
