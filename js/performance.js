/* Performance Monitoring & Analytics */

// ====================
// PERFORMANCE METRICS
// ====================
const perfMetrics = {
  pageLoadTime: 0,
  firstPaint: 0,
  firstContentfulPaint: 0,
  domInteractive: 0,
  domComplete: 0,
  resourceLoadTime: 0,
  apiCallCount: 0,
  errorCount: 0,
};

// Capture performance metrics
window.addEventListener("load", () => {
  setTimeout(() => {
    if (performance.timing) {
      const timing = performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      perfMetrics.pageLoadTime = loadTime > 0 ? loadTime : Date.now() - performance.timing.navigationStart;
      perfMetrics.domInteractive = timing.domInteractive - timing.navigationStart;
      perfMetrics.domComplete = timing.domComplete - timing.navigationStart;
      perfMetrics.resourceLoadTime = timing.responseEnd - timing.requestStart;
    }
  }, 100);
  
  if (performance.timing) {
    const timing = performance.timing;
    perfMetrics.domInteractive = timing.domInteractive - timing.navigationStart;
    perfMetrics.domComplete = timing.domComplete - timing.navigationStart;
  }

  // Paint Timing API
  if (performance.getEntriesByType) {
    const paintEntries = performance.getEntriesByType("paint");
    paintEntries.forEach((entry) => {
      if (entry.name === "first-paint") {
        perfMetrics.firstPaint = entry.startTime;
      }
      if (entry.name === "first-contentful-paint") {
        perfMetrics.firstContentfulPaint = entry.startTime;
      }
    });
  }

  // Log to console in dev mode
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    console.log("📊 Performance Metrics:", perfMetrics);
    logPerformanceGrade();
  }
});

function logPerformanceGrade() {
  const fcp = perfMetrics.firstContentfulPaint;
  let grade = "A+";
  let emoji = "🚀";

  if (fcp > 3000) {
    grade = "D";
    emoji = "🐌";
  } else if (fcp > 2000) {
    grade = "C";
    emoji = "😐";
  } else if (fcp > 1500) {
    grade = "B";
    emoji = "👍";
  } else if (fcp > 1000) {
    grade = "A";
    emoji = "⚡";
  }

  console.log(
    `%c ${emoji} Performance Grade: ${grade} (FCP: ${fcp.toFixed(0)}ms)`,
    "font-size: 16px; font-weight: bold; color: #ff6a00;"
  );
}

// ====================
// ERROR TRACKING
// ====================
window.addEventListener("error", (event) => {
  perfMetrics.errorCount++;
  console.error("❌ Error caught:", {
    message: event.message,
    filename: event.filename,
    line: event.lineno,
    col: event.colno,
    stack: event.error?.stack,
  });

  // In production, send to analytics service
  // trackError({ message: event.message, ... });
});

window.addEventListener("unhandledrejection", (event) => {
  perfMetrics.errorCount++;
  console.error("❌ Unhandled Promise Rejection:", event.reason);

  // In production, send to analytics service
  // trackError({ message: event.reason, type: 'unhandledRejection' });
});

// ====================
// USER INTERACTION TRACKING
// ====================
const userMetrics = {
  clicks: 0,
  scrollDepth: 0,
  timeOnPage: 0,
  productsViewed: 0,
  cartAdditions: 0,
  searchQueries: 0,
};

let startTime = Date.now();

// Track clicks
document.addEventListener("click", (e) => {
  userMetrics.clicks++;

  // Track specific interactions
  if (e.target.closest(".card")) {
    userMetrics.productsViewed++;
  }

  if (
    e.target.closest('button[onclick*="addToCart"]') ||
    e.target.closest(".quick-add")
  ) {
    userMetrics.cartAdditions++;
  }
});

// Track scroll depth
let maxScroll = 0;
window.addEventListener(
  "scroll",
  () => {
    const scrollPercent =
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
      100;
    maxScroll = Math.max(maxScroll, scrollPercent);
    userMetrics.scrollDepth = Math.round(maxScroll);
  },
  { passive: true }
);

// Track search queries
const searchInput = document.getElementById("search");
if (searchInput) {
  searchInput.addEventListener("input", () => {
    if (searchInput.value.length > 2) {
      userMetrics.searchQueries++;
    }
  });
}

// Track time on page
setInterval(() => {
  userMetrics.timeOnPage = Math.round((Date.now() - startTime) / 1000);
}, 1000);

// Log user metrics before leaving
window.addEventListener("beforeunload", () => {
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    console.log("👤 User Metrics:", userMetrics);
  }

  // In production, send to analytics
  // sendAnalytics({ ...perfMetrics, ...userMetrics });
});

// ====================
// RESOURCE TIMING
// ====================
function analyzeResourceTiming() {
  if (!performance.getEntriesByType) return;

  const resources = performance.getEntriesByType("resource");
  const analysis = {
    total: resources.length,
    slowest: [],
    totalSize: 0,
    byType: {},
  };

  resources.forEach((resource) => {
    const duration = resource.duration;
    const type = resource.initiatorType;

    if (!analysis.byType[type]) {
      analysis.byType[type] = { count: 0, totalDuration: 0 };
    }

    analysis.byType[type].count++;
    analysis.byType[type].totalDuration += duration;

    if (resource.transferSize) {
      analysis.totalSize += resource.transferSize;
    }

    // Track slowest resources
    if (duration > 500) {
      analysis.slowest.push({
        name: resource.name,
        duration: Math.round(duration),
        type: resource.initiatorType,
      });
    }
  });

  // Sort by duration
  analysis.slowest.sort((a, b) => b.duration - a.duration);
  analysis.slowest = analysis.slowest.slice(0, 5);

  return analysis;
}

// ====================
// MEMORY MONITORING (Chrome only)
// ====================
function monitorMemory() {
  if (performance.memory) {
    const memory = performance.memory;
    const used = (memory.usedJSHeapSize / 1048576).toFixed(2);
    const total = (memory.totalJSHeapSize / 1048576).toFixed(2);
    const limit = (memory.jsHeapSizeLimit / 1048576).toFixed(2);

    return {
      used: `${used} MB`,
      total: `${total} MB`,
      limit: `${limit} MB`,
      percentage:
        ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1) +
        "%",
    };
  }
  return null;
}

// ====================
// LIGHTHOUSE SIMULATION
// ====================
function simulateLighthouseScore() {
  const scores = {
    performance: 0,
    accessibility: 0,
    bestPractices: 0,
    seo: 0,
  };

  // Performance score (based on FCP)
  const fcp = perfMetrics.firstContentfulPaint;
  if (fcp < 1000) scores.performance = 100;
  else if (fcp < 1500) scores.performance = 90;
  else if (fcp < 2000) scores.performance = 80;
  else if (fcp < 3000) scores.performance = 70;
  else scores.performance = 50;

  // Accessibility (basic checks)
  const hasAltTags = document.querySelectorAll("img:not([alt])").length === 0;
  const hasMetaViewport = !!document.querySelector('meta[name="viewport"]');
  const hasLang = !!document.documentElement.lang;
  scores.accessibility =
    (hasAltTags ? 40 : 0) + (hasMetaViewport ? 30 : 0) + (hasLang ? 30 : 0);

  // Best Practices
  const hasHTTPS = window.location.protocol === "https:";
  const hasMetaDescription = !!document.querySelector(
    'meta[name="description"]'
  );
  const hasNoErrors = perfMetrics.errorCount === 0;
  scores.bestPractices =
    (hasHTTPS ? 40 : 30) +
    (hasMetaDescription ? 30 : 0) +
    (hasNoErrors ? 30 : 0);

  // SEO
  const hasTitle = !!document.title && document.title.length > 0;
  const hasMeta = !!document.querySelector('meta[name="description"]');
  const hasH1 = document.querySelectorAll("h1").length > 0;
  scores.seo = (hasTitle ? 40 : 0) + (hasMeta ? 30 : 0) + (hasH1 ? 30 : 0);

  return scores;
}

// ====================
// PERFORMANCE DASHBOARD
// ====================
function showPerformanceDashboard() {
  const resourceAnalysis = analyzeResourceTiming();
  const memoryInfo = monitorMemory();
  const lighthouseScores = simulateLighthouseScore();

  console.log(
    "%c📊 GoBuy Performance Dashboard",
    "font-size: 20px; font-weight: bold; color: #ff6a00; background: #fff3e0; padding: 10px; border-radius: 8px;"
  );

  console.group("⚡ Load Metrics");
  console.table({
    "First Paint": `${perfMetrics.firstPaint.toFixed(0)}ms`,
    "First Contentful Paint": `${perfMetrics.firstContentfulPaint.toFixed(
      0
    )}ms`,
    "DOM Interactive": `${perfMetrics.domInteractive}ms`,
    "DOM Complete": `${perfMetrics.domComplete}ms`,
    "Page Load Time": `${perfMetrics.pageLoadTime}ms`,
  });
  console.groupEnd();

  if (resourceAnalysis) {
    console.group("📦 Resources");
    console.log(`Total Resources: ${resourceAnalysis.total}`);
    console.log(
      `Total Transfer Size: ${(resourceAnalysis.totalSize / 1024).toFixed(
        2
      )} KB`
    );
    console.table(resourceAnalysis.byType);
    if (resourceAnalysis.slowest.length > 0) {
      console.warn("🐌 Slowest Resources:");
      console.table(resourceAnalysis.slowest);
    }
    console.groupEnd();
  }

  if (memoryInfo) {
    console.group("💾 Memory Usage");
    console.table(memoryInfo);
    console.groupEnd();
  }

  console.group("👤 User Engagement");
  console.table(userMetrics);
  console.groupEnd();

  console.group("🎯 Lighthouse Scores (Estimated)");
  console.table(lighthouseScores);
  console.groupEnd();

  console.log(
    "%cRun showPerformanceDashboard() anytime to see updated metrics",
    "color: #666; font-style: italic;"
  );
}

// Expose to window
window.perfMetrics = perfMetrics;
window.userMetrics = userMetrics;
window.showPerformanceDashboard = showPerformanceDashboard;
window.analyzeResourceTiming = analyzeResourceTiming;
window.monitorMemory = monitorMemory;

// Auto-show dashboard after 5 seconds (dev mode only)
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  setTimeout(() => {
    console.log(
      "%cType showPerformanceDashboard() to see performance metrics 📊",
      "font-size: 14px; color: #ff6a00; font-weight: bold;"
    );
  }, 3000);
}

console.log("📈 Performance monitoring initialized");
