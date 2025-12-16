/* Address Book */

function getAddressBookKey() {
  return currentUser?.email
    ? `addressBook:${currentUser.email}`
    : "addressBook";
}

function loadAddresses() {
  try {
    return JSON.parse(localStorage.getItem(getAddressBookKey()) || "[]");
  } catch (_) {
    return [];
  }
}

function saveAddresses(addresses) {
  localStorage.setItem(getAddressBookKey(), JSON.stringify(addresses));
}

function ensureLoggedInForAddresses() {
  if (currentUser) return true;
  showToast("Inloggen vereist", "Log in om adressen te beheren", "info");
  openLogin();
  return false;
}

function userAddressKeys() {
  const suffix = currentUser?.email ? `:${currentUser.email}` : "";
  return {
    addressKey: `userAddress${suffix}`,
    cityKey: `userCity${suffix}`,
    zipKey: `userZip${suffix}`,
  };
}

async function openAddressBook() {
  if (!ensureLoggedInForAddresses()) return;

  const modal = document.getElementById("product-modal");
  if (!modal) return;

  modal.innerHTML = `
    <div class="content" style="max-width:600px">
      <div class="header">
        <h2>📍 Adressenboek</h2>
        <button class="close" onclick="closeModal()">✕</button>
      </div>
      <div class="body" style="display:block;padding:20px" id="addressbook-body">
        <div style="margin-bottom:20px">
          <button class="btn primary" onclick="openAddAddressForm()" style="width:100%;padding:12px">+ Nieuw Adres</button>
        </div>
        <div style="text-align:center;color:var(--muted);padding:40px">Laden…</div>
      </div>
    </div>`;

  modal.classList.remove("hidden");

  const addresses = await fetchAddresses();
  const body = document.getElementById("addressbook-body");
  if (!body) return;

  if (!addresses || addresses.length === 0) {
    body.innerHTML = `
      <div style="margin-bottom:20px">
        <button class="btn primary" onclick="openAddAddressForm()" style="width:100%;padding:12px">+ Nieuw Adres</button>
      </div>
      <div style="text-align:center;color:var(--muted);padding:40px">Geen adressen opgeslagen</div>`;
    return;
  }

  body.innerHTML = `
    <div style="margin-bottom:20px">
      <button class="btn primary" onclick="openAddAddressForm()" style="width:100%;padding:12px">+ Nieuw Adres</button>
    </div>
    <div style="display:grid;gap:12px">
      ${addresses
        .map(
          (addr, idx) => `
        <div style="border:1px solid var(--border);border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:start">
          <div>
            <div style="font-weight:600;margin-bottom:4px">
              ${addr.name}
              ${
                addr.is_default
                  ? '<span style="margin-left:8px;padding:2px 8px;border:1px solid var(--border);border-radius:12px;font-size:11px;color:var(--muted)">Standaard</span>'
                  : ""
              }
            </div>
            <div style="font-size:13px;color:var(--muted);margin-bottom:8px">${
              addr.address
            }</div>
            <div style="font-size:13px;color:var(--muted)">${addr.zip} ${
            addr.city
          }</div>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn" onclick="useAddress(${idx})" style="padding:6px 10px;font-size:12px">Gebruiken</button>
            <button class="btn" onclick="setDefaultAddress(${idx})" style="padding:6px 10px;font-size:12px">⭐</button>
            <button class="btn" onclick="deleteAddress(${idx})" style="padding:6px 10px;font-size:12px">🗑️</button>
          </div>
        </div>`
        )
        .join("")}
    </div>`;
}

function supabaseReady() {
  return !!window.supabaseClient && !!currentUser && !!currentUser.id;
}

async function fetchAddresses() {
  if (supabaseReady()) {
    try {
      const { data, error } = await window.supabaseClient
        .from("addresses")
        .select("id,name,address,city,zip,is_default,created_at")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn("[addresses] Supabase fetch failed:", e.message);
    }
  }
  return loadAddresses();
}

function openAddAddressForm() {
  if (!ensureLoggedInForAddresses()) return;

  const modal = document.getElementById("product-modal");
  if (!modal) return;

  modal.innerHTML = `
    <div class="content" style="max-width:500px">
      <div class="header">
        <h2>➕ Adres Toevoegen</h2>
        <button class="close" onclick="openAddressBook()">←</button>
      </div>
      <div class="body" style="display:block;padding:20px">
        <form id="address-form" style="display:grid;gap:12px">
          <input type="text" id="addr-name" placeholder="Naam (bv. Thuis, Werk)" required style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px" />
          <input type="text" id="addr-address" placeholder="Straat + Huisnummer" required style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px" />
          <input type="text" id="addr-city" placeholder="Plaats" required style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px" />
          <input type="text" id="addr-zip" placeholder="Postcode" pattern="[0-9]{4}[A-Za-z]{2}" required style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px" />
          <button type="submit" class="btn primary" style="width:100%;padding:12px">Adres Opslaan</button>
        </form>
      </div>
    </div>
  `;

  document
    .getElementById("address-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await saveNewAddress();
    });

  modal.classList.remove("hidden");
}

async function saveNewAddress() {
  if (!ensureLoggedInForAddresses()) return;

  const newAddr = {
    name: document.getElementById("addr-name").value,
    address: document.getElementById("addr-address").value,
    city: document.getElementById("addr-city").value,
    zip: document.getElementById("addr-zip").value,
  };

  if (supabaseReady()) {
    try {
      const { error } = await window.supabaseClient.from("addresses").insert({
        user_id: currentUser.id,
        ...newAddr,
        is_default: false,
      });
      if (error) throw error;
      showToast(
        "Adres opgeslagen",
        "Opgeslagen in je online profiel",
        "success"
      );
      return openAddressBook();
    } catch (e) {
      console.warn("[addresses] insert failed:", e.message);
    }
  }
  // Fallback local
  let addresses = loadAddresses();
  addresses.push(newAddr);
  saveAddresses(addresses);
  showToast("Adres opgeslagen", "Lokaal opgeslagen", "success");
  openAddressBook();
}

async function useAddress(idx) {
  if (!ensureLoggedInForAddresses()) return;

  let addresses = await fetchAddresses();
  const addr = addresses[idx];

  const { addressKey, cityKey, zipKey } = userAddressKeys();
  localStorage.setItem(addressKey, addr.address);
  localStorage.setItem(cityKey, addr.city);
  localStorage.setItem(zipKey, addr.zip);
  // Legacy keys for backward compatibility
  localStorage.setItem("userAddress", addr.address);
  localStorage.setItem("userCity", addr.city);
  localStorage.setItem("userZip", addr.zip);

  // Also set default online if available
  if (supabaseReady() && addr.id) {
    try {
      // unset others
      await window.supabaseClient
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", currentUser.id);
      await window.supabaseClient
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addr.id)
        .eq("user_id", currentUser.id);
    } catch (e) {
      console.warn("[addresses] set default failed:", e.message);
    }
  }

  showToast(
    "Standaard adres",
    "Dit adres is nu je standaard bezorgadres",
    "success"
  );
  closeModal();
}

async function setDefaultAddress(idx) {
  if (!ensureLoggedInForAddresses()) return;
  if (!supabaseReady()) return useAddress(idx);
  const addresses = await fetchAddresses();
  const addr = addresses[idx];
  if (!addr || !addr.id) return;
  try {
    await window.supabaseClient
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", currentUser.id);
    await window.supabaseClient
      .from("addresses")
      .update({ is_default: true })
      .eq("id", addr.id)
      .eq("user_id", currentUser.id);
    showToast("Standaard adres", "Standaard adres ingesteld", "success");
    openAddressBook();
  } catch (e) {
    showToast("Fout", e.message || "Kon standaard niet instellen", "error");
  }
}

async function deleteAddress(idx) {
  if (!ensureLoggedInForAddresses()) return;
  if (!confirm("Dit adres verwijderen?")) return;

  if (supabaseReady()) {
    const addresses = await fetchAddresses();
    const addr = addresses[idx];
    if (addr && addr.id) {
      try {
        const { error } = await window.supabaseClient
          .from("addresses")
          .delete()
          .eq("id", addr.id)
          .eq("user_id", currentUser.id);
        if (error) throw error;
        return openAddressBook();
      } catch (e) {
        console.warn("[addresses] delete failed:", e.message);
      }
    }
  }
  // Fallback local
  let addresses = loadAddresses();
  addresses.splice(idx, 1);
  saveAddresses(addresses);
  openAddressBook();
}
