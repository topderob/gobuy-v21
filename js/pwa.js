/* PWA Features - Progressive Web App */

// ====================
// SERVICE WORKER REGISTRATION
// ====================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("✅ Service Worker registered:", registration.scope);
      })
      .catch((error) => {
        console.log("❌ Service Worker registration failed:", error);
      });
  });
}

// ====================
// INSTALL PROMPT
// ====================
let deferredPrompt;
let installButton;

window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent default install prompt
  e.preventDefault();
  deferredPrompt = e;

  // Show custom install button
  showInstallPromotion();
});

function showInstallPromotion() {
  // Create install banner
  const banner = document.createElement("div");
  banner.id = "install-banner";
  banner.className = "install-banner";
  banner.innerHTML = `
    <div class="install-content">
      <div class="install-icon">📱</div>
      <div class="install-text">
        <div class="install-title">Installeer GoBuy</div>
        <div class="install-subtitle">Krijg snelle toegang vanaf je startscherm</div>
      </div>
      <button class="install-btn" id="install-btn">Installeren</button>
      <button class="install-close" onclick="dismissInstallBanner()">✕</button>
    </div>
  `;

  // Don't show if dismissed recently
  const dismissed = localStorage.getItem("install-dismissed");
  if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
    return;
  }

  document.body.appendChild(banner);

  // Animate in
  setTimeout(() => banner.classList.add("visible"), 100);

  // Install button handler
  document.getElementById("install-btn").addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("✅ User installed the app");
      showToast("App geïnstalleerd! 🎉");
    } else {
      console.log("❌ User dismissed install prompt");
    }

    deferredPrompt = null;
    dismissInstallBanner();
  });
}

function dismissInstallBanner() {
  const banner = document.getElementById("install-banner");
  if (banner) {
    banner.classList.remove("visible");
    setTimeout(() => banner.remove(), 300);
  }
  localStorage.setItem("install-dismissed", Date.now().toString());
}

// ====================
// OFFLINE DETECTION
// ====================
let offlineBanner;

window.addEventListener("online", () => {
  hideOfflineBanner();
  showToast("✅ Verbinding hersteld");
  // Sync data if needed
  syncOfflineData();
});

window.addEventListener("offline", () => {
  showOfflineBanner();
  showToast("⚠️ Geen internetverbinding");
});

function showOfflineBanner() {
  if (offlineBanner) return;

  offlineBanner = document.createElement("div");
  offlineBanner.className = "offline-banner";
  offlineBanner.innerHTML = `
    <div class="offline-content">
      <span class="offline-icon">📡</span>
      <span>Je bent offline. Sommige functies zijn beperkt.</span>
    </div>
  `;
  document.body.appendChild(offlineBanner);
  setTimeout(() => offlineBanner.classList.add("visible"), 100);
}

function hideOfflineBanner() {
  if (offlineBanner) {
    offlineBanner.classList.remove("visible");
    setTimeout(() => {
      offlineBanner.remove();
      offlineBanner = null;
    }, 300);
  }
}

// ====================
// OFFLINE DATA SYNC
// ====================
function syncOfflineData() {
  // Check if there's offline data to sync
  const offlineActions = JSON.parse(
    localStorage.getItem("offline-actions") || "[]"
  );

  if (offlineActions.length > 0) {
    console.log("🔄 Syncing offline data...", offlineActions);

    // Process each offline action
    offlineActions.forEach((action) => {
      switch (action.type) {
        case "addToCart":
          addToCart(action.product);
          break;
        case "addToWishlist":
          addToWishlist(action.product);
          break;
        case "removeFromCart":
          removeFromCart(action.productId);
          break;
      }
    });

    // Clear offline actions
    localStorage.removeItem("offline-actions");
    console.log("✅ Offline data synced");
  }
}

// Queue offline actions
function queueOfflineAction(action) {
  const actions = JSON.parse(localStorage.getItem("offline-actions") || "[]");
  actions.push({
    ...action,
    timestamp: Date.now(),
  });
  localStorage.setItem("offline-actions", JSON.stringify(actions));
}

// ====================
// PUSH NOTIFICATIONS (optional)
// ====================
async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("Browser doesn't support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

function showNotification(title, options = {}) {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

// ====================
// APP UPDATE DETECTION
// ====================
let updateAvailable = false;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (updateAvailable) {
      showUpdateBanner();
    }
  });

  // Check for updates
  setInterval(() => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "CHECK_UPDATE" });
    }
  }, 60 * 60 * 1000); // Check every hour
}

function showUpdateBanner() {
  const banner = document.createElement("div");
  banner.className = "update-banner";
  banner.innerHTML = `
    <div class="update-content">
      <span class="update-icon">🎉</span>
      <span>Er is een nieuwe versie beschikbaar!</span>
      <button class="update-btn" onclick="reloadApp()">Vernieuwen</button>
    </div>
  `;
  document.body.appendChild(banner);
  setTimeout(() => banner.classList.add("visible"), 100);
}

function reloadApp() {
  window.location.reload();
}

// ====================
// SHARE API
// ====================
async function shareProduct(product) {
  if (!navigator.share) {
    // Fallback to copy link
    const url = `${window.location.origin}?product=${product.id}`;
    await navigator.clipboard.writeText(url);
    showToast("Link gekopieerd! 📋");
    return;
  }

  try {
    await navigator.share({
      title: product.name,
      text: `Check dit product op GoBuy: ${product.name}`,
      url: `${window.location.origin}?product=${product.id}`,
    });
    console.log("✅ Product shared");
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Share failed:", error);
    }
  }
}

// ====================
// APP INSTALLATION STATUS
// ====================
function isAppInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

if (isAppInstalled()) {
  console.log("📱 App is running in standalone mode");
  document.body.classList.add("pwa-standalone");
}

// ====================
// CACHE MANAGEMENT
// ====================
async function clearAppCache() {
  if ("caches" in window) {
    const names = await caches.keys();
    await Promise.all(names.map((name) => caches.delete(name)));
    console.log("✅ Cache cleared");
    showToast("Cache gewist");
  }
}

// Expose to window for debugging
window.clearAppCache = clearAppCache;

// ====================
// INITIALIZE PWA FEATURES
// ====================
console.log("📱 PWA Features Loaded");
