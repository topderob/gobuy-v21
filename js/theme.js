(function () {
  const KEY = "theme";
  const root = document.documentElement;

  function setButtonIcon(theme) {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
    btn.title = theme === "dark" ? "Schakel naar licht" : "Schakel naar donker";
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      root.classList.add("theme-dark");
    } else {
      root.classList.remove("theme-dark");
    }
    setButtonIcon(theme);
  }

  function initTheme() {
    const saved = localStorage.getItem(KEY) || "light";
    applyTheme(saved);

    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", () => {
        const next = root.classList.contains("theme-dark") ? "light" : "dark";
        localStorage.setItem(KEY, next);
        applyTheme(next);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }
})();
