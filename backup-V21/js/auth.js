/* User Authentication System */

let currentUser = null;

// Initialize user from localStorage
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("currentUser");
  if (saved) {
    currentUser = JSON.parse(saved);
    updateAuthUI();
  }
});

function openLogin() {
  const modal = document.getElementById("product-modal");
  if (!modal) return;

  modal.innerHTML = `
    <div class="content" style="max-width:450px">
      <div class="header">
        <h2>🔐 Inloggen</h2>
        <button class="close" onclick="closeModal()">✕</button>
      </div>
      <div class="body" style="display:block;padding:24px">
        <form id="login-form" style="display:grid;gap:16px">
          <div>
            <label style="display:block;margin-bottom:6px;font-weight:600">E-mailadres</label>
            <input type="email" id="login-email" placeholder="jouw@email.nl" required style="width:100%;padding:12px;border:1px solid var(--border);border-radius:8px" />
          </div>
          <div>
            <label style="display:block;margin-bottom:6px;font-weight:600">Wachtwoord</label>
            <input type="password" id="login-password" placeholder="••••••••" required style="width:100%;padding:12px;border:1px solid var(--border);border-radius:8px" />
          </div>
          <button type="submit" class="btn primary" style="width:100%;padding:14px;font-size:16px;font-weight:600">
            Inloggen
          </button>
        </form>
        <div style="text-align:center;margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
          <span style="color:var(--muted)">Nog geen account?</span>
          <button onclick="openRegister()" class="btn" style="margin-left:8px">Registreer</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    processLogin();
  });

  modal.classList.remove("hidden");
}

function processLogin() {
  const email = document.getElementById("login-email")?.value;
  const password = document.getElementById("login-password")?.value;

  // Get registered users
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      joinDate: user.joinDate,
    };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    updateAuthUI();
    closeModal();
    showToast("Welkom terug", `${currentUser.name}! 👋`, "success");
  } else {
    showToast("Login mislukt", "Onjuiste inloggegevens", "error");
  }
}

function openRegister() {
  const modal = document.getElementById("product-modal");
  if (!modal) return;

  modal.innerHTML = `
    <div class="content" style="max-width:450px">
      <div class="header">
        <h2>✨ Registreren</h2>
        <button class="close" onclick="closeModal()">✕</button>
      </div>
      <div class="body" style="display:block;padding:24px">
        <form id="register-form" style="display:grid;gap:16px">
          <div>
            <label style="display:block;margin-bottom:6px;font-weight:600">Volledige naam</label>
            <input type="text" id="register-name" placeholder="Jan Jansen" required style="width:100%;padding:12px;border:1px solid var(--border);border-radius:8px" />
          </div>
          <div>
            <label style="display:block;margin-bottom:6px;font-weight:600">E-mailadres</label>
            <input type="email" id="register-email" placeholder="jouw@email.nl" required style="width:100%;padding:12px;border:1px solid var(--border);border-radius:8px" />
          </div>
          <div>
            <label style="display:block;margin-bottom:6px;font-weight:600">Wachtwoord</label>
            <input type="password" id="register-password" placeholder="Min. 6 tekens" required minlength="6" style="width:100%;padding:12px;border:1px solid var(--border);border-radius:8px" />
          </div>
          <div>
            <label style="display:block;margin-bottom:6px;font-weight:600">Bevestig wachtwoord</label>
            <input type="password" id="register-confirm" placeholder="Herhaal wachtwoord" required style="width:100%;padding:12px;border:1px solid var(--border);border-radius:8px" />
          </div>
          <button type="submit" class="btn primary" style="width:100%;padding:14px;font-size:16px;font-weight:600">
            Account aanmaken
          </button>
        </form>
        <div style="text-align:center;margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
          <span style="color:var(--muted)">Al een account?</span>
          <button onclick="openLogin()" class="btn" style="margin-left:8px">Inloggen</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("register-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    processRegister();
  });

  modal.classList.remove("hidden");
}

function processRegister() {
  const name = document.getElementById("register-name")?.value;
  const email = document.getElementById("register-email")?.value;
  const password = document.getElementById("register-password")?.value;
  const confirm = document.getElementById("register-confirm")?.value;

  if (password !== confirm) {
    showToast(
      "Registratie mislukt",
      "Wachtwoorden komen niet overeen",
      "error"
    );
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "[]");

  if (users.find((u) => u.email === email)) {
    showToast("Registratie mislukt", "E-mailadres al in gebruik", "error");
    return;
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    joinDate: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  currentUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    joinDate: newUser.joinDate,
  };
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  updateAuthUI();
  closeModal();
  showToast("Account aangemaakt", `Welkom ${name}! 🎉`, "success");
}

function openProfile() {
  if (!currentUser) {
    openLogin();
    return;
  }

  const userOrders = ORDERS.filter((o) => true); // All orders for now
  const totalSpent = userOrders.reduce((sum, o) => sum + o.totalEur, 0);

  const modal = document.getElementById("product-modal");
  if (!modal) return;

  modal.innerHTML = `
    <div class="content" style="max-width:600px">
      <div class="header">
        <h2>👤 Mijn Profiel</h2>
        <button class="close" onclick="closeModal()">✕</button>
      </div>
      <div class="body" style="display:block;padding:24px">
        <div style="text-align:center;margin-bottom:24px">
          <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg, var(--accent), var(--primary));display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:36px;color:white">
            ${currentUser.name.charAt(0).toUpperCase()}
          </div>
          <h3 style="margin:8px 0">${currentUser.name}</h3>
          <p style="color:var(--muted);margin:4px 0">${currentUser.email}</p>
          <p style="color:var(--muted);font-size:13px">Lid sinds ${new Date(
            currentUser.joinDate
          ).toLocaleDateString("nl-NL")}</p>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px">
          <div style="background:var(--bg);padding:16px;border-radius:8px;text-align:center">
            <div style="font-size:24px;font-weight:700;color:var(--primary)">${
              userOrders.length
            }</div>
            <div style="color:var(--muted);font-size:13px">Bestellingen</div>
          </div>
          <div style="background:var(--bg);padding:16px;border-radius:8px;text-align:center">
            <div style="font-size:24px;font-weight:700;color:var(--primary)">${
              WISHLIST.length
            }</div>
            <div style="color:var(--muted);font-size:13px">Wishlist</div>
          </div>
          <div style="background:var(--bg);padding:16px;border-radius:8px;text-align:center">
            <div style="font-size:24px;font-weight:700;color:var(--primary)">${formatPrice(
              totalSpent
            )}</div>
            <div style="color:var(--muted);font-size:13px">Besteed</div>
          </div>
        </div>

        <div style="display:grid;gap:12px">
          <button class="btn" onclick="closeModal();setTimeout(openOrderHistory,300)" style="width:100%;padding:12px;text-align:left;display:flex;align-items:center;gap:12px">
            <span>📦</span>
            <span style="flex:1">Mijn Bestellingen</span>
            <span style="color:var(--muted)">→</span>
          </button>
          <button class="btn" onclick="closeModal();openWishlist()" style="width:100%;padding:12px;text-align:left;display:flex;align-items:center;gap:12px">
            <span>❤️</span>
            <span style="flex:1">Mijn Wishlist</span>
            <span style="color:var(--muted)">→</span>
          </button>
          <button class="btn" onclick="closeModal();openAddressBook()" style="width:100%;padding:12px;text-align:left;display:flex;align-items:center;gap:12px">
            <span>📍</span>
            <span style="flex:1">Adressenboek</span>
            <span style="color:var(--muted)">→</span>
          </button>
          <button class="btn" onclick="logout()" style="width:100%;padding:12px;color:#ef4444;border-color:#ef4444">
            🚪 Uitloggen
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  updateAuthUI();
  closeModal();
  showToast("Uitgelogd", "Tot ziens!", "info");
}

function updateAuthUI() {
  const profileBtn = document.querySelector(".actions .act:nth-child(2)");
  if (!profileBtn) return;

  if (currentUser) {
    profileBtn.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px">
        <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg, var(--accent), var(--primary));display:flex;align-items:center;justify-content:center;font-size:14px;color:white;font-weight:600">
          ${currentUser.name.charAt(0).toUpperCase()}
        </div>
      </div>
    `;
  } else {
    profileBtn.innerHTML = "👤";
  }
}
