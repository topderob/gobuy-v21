/* Address Book */

function openAddressBook() {
  let addresses = JSON.parse(localStorage.getItem("addressBook") || "[]");
  const modal = document.getElementById("product-modal");
  if (!modal) return;

  modal.innerHTML = `
    <div class="content" style="max-width:600px">
      <div class="header">
        <h2>📍 Adressenboek</h2>
        <button class="close" onclick="closeModal()">✕</button>
      </div>
      <div class="body" style="display:block;padding:20px">
        <div style="margin-bottom:20px">
          <button class="btn primary" onclick="openAddAddressForm()" style="width:100%;padding:12px">+ Nieuw Adres</button>
        </div>
        
        ${
          addresses.length === 0
            ? '<div style="text-align:center;color:var(--muted);padding:40px">Geen adressen opgeslagen</div>'
            : `<div style="display:grid;gap:12px">
            ${addresses
              .map(
                (addr, idx) => `
              <div style="border:1px solid var(--border);border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:start">
                <div>
                  <div style="font-weight:600;margin-bottom:4px">${addr.name}</div>
                  <div style="font-size:13px;color:var(--muted);margin-bottom:8px">${addr.address}</div>
                  <div style="font-size:13px;color:var(--muted)">${addr.zip} ${addr.city}</div>
                </div>
                <div style="display:flex;gap:6px">
                  <button class="btn" onclick="useAddress(${idx})" style="padding:6px 10px;font-size:12px">Gebruiken</button>
                  <button class="btn" onclick="deleteAddress(${idx})" style="padding:6px 10px;font-size:12px">🗑️</button>
                </div>
              </div>
            `
              )
              .join("")}
          </div>`
        }
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
}

function openAddAddressForm() {
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

  document.getElementById("address-form").addEventListener("submit", (e) => {
    e.preventDefault();
    saveNewAddress();
  });

  modal.classList.remove("hidden");
}

function saveNewAddress() {
  let addresses = JSON.parse(localStorage.getItem("addressBook") || "[]");

  const newAddr = {
    name: document.getElementById("addr-name").value,
    address: document.getElementById("addr-address").value,
    city: document.getElementById("addr-city").value,
    zip: document.getElementById("addr-zip").value,
  };

  addresses.push(newAddr);
  localStorage.setItem("addressBook", JSON.stringify(addresses));
  showToast(
    "Adres opgeslagen",
    "Jouw adres is succesvol opgeslagen",
    "success"
  );
  openAddressBook();
}

function useAddress(idx) {
  let addresses = JSON.parse(localStorage.getItem("addressBook") || "[]");
  const addr = addresses[idx];

  localStorage.setItem("userAddress", addr.address);
  localStorage.setItem("userCity", addr.city);
  localStorage.setItem("userZip", addr.zip);

  showToast(
    "Standaard adres",
    "Dit adres is nu je standaard bezorgadres",
    "success"
  );
  closeModal();
}

function deleteAddress(idx) {
  if (!confirm("Dit adres verwijderen?")) return;

  let addresses = JSON.parse(localStorage.getItem("addressBook") || "[]");
  addresses.splice(idx, 1);
  localStorage.setItem("addressBook", JSON.stringify(addresses));
  openAddressBook();
}
