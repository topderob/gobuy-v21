/* Developer Easter Eggs & Console Art */

// ====================
// CONSOLE ART
// ====================
const consoleArt = `
   ██████╗  ██████╗ ██████╗ ██╗   ██╗██╗   ██╗
  ██╔════╝ ██╔═══██╗██╔══██╗██║   ██║╚██╗ ██╔╝
  ██║  ███╗██║   ██║██████╔╝██║   ██║ ╚████╔╝ 
  ██║   ██║██║   ██║██╔══██╗██║   ██║  ╚██╔╝  
  ╚██████╔╝╚██████╔╝██████╔╝╚██████╔╝   ██║   
   ╚═════╝  ╚═════╝ ╚═════╝  ╚═════╝    ╚═╝   
                                              
  🚀 Premium Edition - Built with Vanilla JS
  ⚡ Zero Frameworks • 100% Performance
`;

console.log(
  `%c${consoleArt}`,
  "font-family: monospace; color: #ff6a00; font-weight: bold;"
);

// ====================
// WELCOME MESSAGE
// ====================
console.log(
  "%c👋 Hey Developer!",
  "font-size: 24px; font-weight: bold; color: #ff6a00; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);"
);

console.log(
  "%cWelkom bij GoBuy Premium - De best gecodeerde e-commerce site die je ooit zult zien! 🎉",
  "font-size: 14px; color: #333; margin: 10px 0;"
);

// ====================
// DEVELOPER COMMANDS
// ====================
const devCommands = [
  {
    cmd: "showPerformanceDashboard()",
    desc: "📊 Bekijk gedetailleerde performance metrics",
  },
  {
    cmd: "clearAppCache()",
    desc: "🗑️ Wis alle service worker cache",
  },
  {
    cmd: "shareProduct(ALL[0])",
    desc: "📤 Test de Web Share API",
  },
  {
    cmd: "optimisticAddToCart(ALL[0])",
    desc: "⚡ Test optimistic UI updates",
  },
  {
    cmd: "showInstallPromotion()",
    desc: "📱 Toon PWA install prompt",
  },
  {
    cmd: "monitorMemory()",
    desc: "💾 Check memory usage (Chrome only)",
  },
  {
    cmd: "analyzeResourceTiming()",
    desc: "⏱️ Analyseer resource load times",
  },
  {
    cmd: 'localStorage.setItem("debug", "true")',
    desc: "🐛 Enable debug mode",
  },
];

console.group(
  "%c🛠️ Developer Commands",
  "font-size: 16px; font-weight: bold; color: #2dd4bf;"
);
devCommands.forEach(({ cmd, desc }) => {
  console.log(
    `%c${cmd}%c - ${desc}`,
    "color: #ff6a00; font-weight: bold;",
    "color: #666;"
  );
});
console.groupEnd();

// ====================
// KONAMI CODE
// ====================
let konamiIndex = 0;
const konamiCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

document.addEventListener("keydown", (e) => {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      activateKonamiMode();
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

function activateKonamiMode() {
  console.log(
    "%c🎮 KONAMI CODE ACTIVATED!",
    "font-size: 30px; font-weight: bold; color: #ff6a00; background: linear-gradient(90deg, #ff6a00, #2dd4bf); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"
  );

  // Rainbow mode!
  document.body.style.animation = "rainbow 2s linear infinite";

  // Add rainbow animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes rainbow {
      0% { filter: hue-rotate(0deg); }
      100% { filter: hue-rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  showToast("🎮 Konami Code Activated! Rainbow mode ON! 🌈");

  // Disable after 10 seconds
  setTimeout(() => {
    document.body.style.animation = "";
    showToast("Rainbow mode disabled");
  }, 10000);
}

// ====================
// SECRET COMMANDS
// ====================

// Type "gobuy" in console for surprises
window.gobuy = function () {
  console.log(
    "%c🎁 BONUS UNLOCKED!",
    "font-size: 20px; color: white; background: linear-gradient(90deg, #667eea, #764ba2); padding: 20px; border-radius: 10px; font-weight: bold;"
  );

  console.log(
    "%c🚀 Je hebt de geheime developer mode ontgrendeld!",
    "font-size: 16px; color: #ff6a00;"
  );

  console.log(
    "\n%cHier zijn wat extra features:",
    "font-weight: bold; font-size: 14px;"
  );

  console.log("\n🎨 Design System:");
  console.table({
    Primary: "#ff6a00",
    Accent: "#2dd4bf",
    Background: "#e5e5e5",
    Card: "#fff",
    Text: "#141414",
    Muted: "#666",
    Border: "#e9e9e9",
  });

  console.log("\n📊 Tech Stack:");
  console.table({
    JavaScript: "ES6+ Vanilla",
    CSS: "CSS Grid + Flexbox",
    PWA: "Service Workers + Manifest",
    Performance: "Intersection Observer, Lazy Loading",
    Storage: "LocalStorage + IndexedDB ready",
    Frameworks: "None! (That's the point 😎)",
  });

  console.log("\n⚡ Performance Tips:");
  console.log("1. All images use lazy loading");
  console.log("2. Scroll handlers are throttled");
  console.log("3. Search has 200ms debounce");
  console.log("4. Service Worker caches everything");
  console.log("5. Optimistic UI for instant feedback");

  console.log(
    "\n%c💡 Pro Tip: Check out PREMIUM_FEATURES.md for complete documentation!",
    "background: #fff3e0; padding: 10px; border-left: 4px solid #ff6a00; color: #333;"
  );

  return "🎉 Developer mode is always on! Happy coding!";
};

// Type "credits" for team info
window.credits = function () {
  console.log(
    "%c🎬 CREDITS",
    "font-size: 24px; font-weight: bold; color: white; background: #ff6a00; padding: 15px; border-radius: 8px;"
  );

  console.log("\n%c Built with:", "font-weight: bold; font-size: 16px;");
  console.log("❤️  Passion for clean code");
  console.log("⚡ Performance obsession");
  console.log("🎨 Eye for design");
  console.log("🧠 Problem-solving mindset");
  console.log("☕ Lots of coffee");

  console.log("\n%c Technologies:", "font-weight: bold; font-size: 16px;");
  console.log("📱 Progressive Web App");
  console.log("🎯 Vanilla JavaScript (No frameworks!)");
  console.log("🎨 Modern CSS (Grid, Flexbox, Animations)");
  console.log(
    "⚡ Web APIs (Service Workers, Intersection Observer, Share API)"
  );
  console.log("🚀 Performance First Architecture");

  console.log("\n%c Special Features:", "font-weight: bold; font-size: 16px;");
  console.log("✨ Micro-interactions everywhere");
  console.log("🔍 Advanced search with autocomplete");
  console.log("⌨️  Keyboard shortcuts");
  console.log("💰 Smart price slider");
  console.log("📸 Image zoom & gallery");
  console.log("💀 Skeleton loaders");
  console.log("📱 Installable PWA");
  console.log("📡 Offline support");
  console.log("📊 Performance monitoring");

  console.log(
    "\n%c Made for developers who appreciate quality code 👨‍💻👩‍💻",
    "font-style: italic; color: #666;"
  );

  return "Thank you for exploring GoBuy! ⭐";
};

// ====================
// FEATURE HIGHLIGHTS
// ====================
console.group(
  "%c✨ Feature Highlights",
  "font-size: 16px; font-weight: bold; color: #2dd4bf;"
);
console.log(
  "⌨️  Press %c/%c to focus search",
  "background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace;",
  ""
);
console.log(
  "⌨️  Press %c?%c to see all shortcuts",
  "background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace;",
  ""
);
console.log("🔍 Hover over product images for zoom");
console.log("📱 Install as app for offline access");
console.log("⚡ All interactions have optimistic UI");
console.log("🎨 Smooth animations powered by CSS");
console.groupEnd();

// ====================
// STATS
// ====================
setTimeout(() => {
  const stats = {
    "Total Products": ALL.length,
    "Cart Items": CART.length,
    "Wishlist Items": WISHLIST.length,
    Categories: [...new Set(ALL.map((p) => p.type))].length,
    "Loaded in": `${perfMetrics.pageLoadTime}ms`,
  };

  console.group(
    "%c📈 Current Stats",
    "font-size: 14px; font-weight: bold; color: #667eea;"
  );
  console.table(stats);
  console.groupEnd();
}, 2000);

// ====================
// EASTER EGG: SHAKE TO REVEAL
// ====================
let shakeCount = 0;
let lastShake = 0;

window.addEventListener("devicemotion", (e) => {
  const acc = e.accelerationIncludingGravity;
  const threshold = 20;

  if (
    Math.abs(acc.x) > threshold ||
    Math.abs(acc.y) > threshold ||
    Math.abs(acc.z) > threshold
  ) {
    const now = Date.now();
    if (now - lastShake > 1000) {
      shakeCount++;
      lastShake = now;

      if (shakeCount >= 3) {
        console.log("🎉 You found the shake easter egg!");
        showToast("🎉 Shake easter egg activated!");
        shakeCount = 0;

        // Confetti effect
        document.body.style.animation = "shake 0.5s";
        setTimeout(() => (document.body.style.animation = ""), 500);
      }
    }
  }
});

// ====================
// TYPE "HELP" FOR SUPPORT
// ====================
window.help = function () {
  console.log(
    "%c🆘 HELP CENTER",
    "font-size: 20px; font-weight: bold; color: #ff6a00;"
  );
  console.log("\n📚 Documentation: Check PREMIUM_FEATURES.md");
  console.log("🐛 Found a bug? Check console for errors");
  console.log("⚡ Performance issues? Run: showPerformanceDashboard()");
  console.log("💾 Cache issues? Run: clearAppCache()");
  console.log("🔧 Debug mode: localStorage.setItem('debug', 'true')");
  console.log("\n💡 Quick Commands:");
  console.log("  • gobuy() - Show developer info");
  console.log("  • credits() - View credits");
  console.log("  • help() - This message");
  return "Need more help? Read the docs! 📖";
};

// ====================
// LOAD TIME CELEBRATION
// ====================
window.addEventListener("load", () => {
  const loadTime = perfMetrics.pageLoadTime;

  if (loadTime < 1000) {
    console.log(
      "%c🚀 BLAZING FAST! Loaded in " + loadTime + "ms",
      "font-size: 16px; color: #2dd4bf; font-weight: bold;"
    );
  } else if (loadTime < 2000) {
    console.log(
      "%c⚡ Nice! Loaded in " + loadTime + "ms",
      "font-size: 16px; color: #ff6a00; font-weight: bold;"
    );
  } else {
    console.log(
      "%c📊 Loaded in " +
        loadTime +
        "ms - Run analyzeResourceTiming() to find bottlenecks",
      "font-size: 14px; color: #666;"
    );
  }
});

// ====================
// FINAL MESSAGE
// ====================
console.log(
  "\n%c🎯 Type gobuy() or credits() for more info!",
  "font-size: 14px; background: linear-gradient(90deg, #ff6a00, #2dd4bf); color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold;"
);

console.log(
  "%c\n✨ Happy exploring!\n",
  "font-size: 12px; color: #999; font-style: italic;"
);
