// In-app developer console overlay: captures logs and errors into a floating panel
(function () {
  if (window.__DEV_CONSOLE__) return;
  window.__DEV_CONSOLE__ = true;

  const panel = document.createElement("div");
  panel.id = "dev-console";
  panel.style.cssText = [
    "position:fixed",
    "right:12px",
    "bottom:12px",
    "width:360px",
    "max-height:40vh",
    "overflow:auto",
    "background:rgba(20,20,20,0.95)",
    "color:#e5e7eb",
    'font:12px/1.4 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    "border:1px solid #374151",
    "border-radius:10px",
    "z-index:100000",
    "display:none",
    "box-shadow:0 10px 30px rgba(0,0,0,.35)",
  ].join(";");
  const header = document.createElement("div");
  header.style.cssText =
    "display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:#111827;border-bottom:1px solid #374151;border-top-left-radius:10px;border-top-right-radius:10px";
  header.innerHTML =
    '<strong style="color:#93c5fd">Dev Console</strong>' +
    '<div><button id="dc-clear" style="margin-right:6px">Clear</button><button id="dc-close">Hide</button></div>';
  const body = document.createElement("div");
  body.id = "dc-body";
  body.style.cssText = "padding:8px;white-space:pre-wrap;word-break:break-word";
  panel.appendChild(header);
  panel.appendChild(body);
  document.addEventListener("DOMContentLoaded", () =>
    document.body.appendChild(panel)
  );

  const toggle = document.createElement("button");
  toggle.textContent = "🛠️";
  toggle.title = "Toggle Dev Console (Ctrl+~)";
  toggle.style.cssText =
    "position:fixed;right:12px;bottom:12px;width:36px;height:36px;border-radius:999px;border:1px solid #d1d5db;background:#fff;z-index:100001;cursor:pointer;opacity:.85";
  document.addEventListener("DOMContentLoaded", () =>
    document.body.appendChild(toggle)
  );

  function show() {
    panel.style.display = "block";
  }
  function hide() {
    panel.style.display = "none";
  }
  function addLine(type, args) {
    const div = document.createElement("div");
    const ts = new Date().toISOString().split("T")[1].replace("Z", "");
    const color =
      type === "error" ? "#fecaca" : type === "warn" ? "#fde68a" : "#c7d2fe";
    const text = Array.from(args)
      .map((a) => {
        try {
          return typeof a === "string" ? a : JSON.stringify(a);
        } catch (_) {
          return String(a);
        }
      })
      .join(" ");
    div.innerHTML = `<span style="color:#9ca3af">[${ts}]</span> <span style="color:${color}">[${type}]</span> ${text}`;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  const orig = { log: console.log, warn: console.warn, error: console.error };
  console.log = (...a) => {
    addLine("log", a);
    orig.log.apply(console, a);
  };
  console.warn = (...a) => {
    addLine("warn", a);
    orig.warn.apply(console, a);
  };
  console.error = (...a) => {
    addLine("error", a);
    orig.error.apply(console, a);
  };
  window.addEventListener("error", (e) =>
    addLine("error", [e.message || "Error", e.filename || "", e.lineno || ""])
  );
  window.addEventListener("unhandledrejection", (e) =>
    addLine("error", [
      "Unhandled rejection",
      e.reason && (e.reason.message || e.reason),
    ])
  );

  toggle.addEventListener("click", () => {
    panel.style.display === "none" ? show() : hide();
  });
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "`") {
      e.preventDefault();
      panel.style.display === "none" ? show() : hide();
    }
  });
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "dc-clear") {
      body.innerHTML = "";
    }
    if (e.target && e.target.id === "dc-close") {
      hide();
    }
  });
})();
