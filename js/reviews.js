/* Review Submission System */

function openReviewForm(productId) {
  const p = ALL.find((x) => x.id === productId);
  if (!p) return;

  // Check if user has purchased this product
  if (!hasUserPurchased(productId)) {
    showToast(
      "Review niet mogelijk",
      "Je moet dit product eerst kopen",
      "error"
    );
    return;
  }

  const modal = document.getElementById("product-modal");
  if (!modal) return;

  modal.innerHTML = `
    <div class="content" style="max-width:600px">
      <div class="header">
        <h2>✍️ Review schrijven</h2>
        <button class="close" onclick="closeModal()">✕</button>
      </div>
      <div class="body" style="display:block">
        <div style="display:flex;gap:16px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--border)">
          <img src="${
            p.image
          }" style="width:80px;height:80px;object-fit:cover;border-radius:8px" />
          <div>
            <h3 style="margin:0 0 8px 0">${p.name}</h3>
            <div style="color:var(--muted)">${formatPrice(p.price * 1.21)}</div>
          </div>
        </div>
        <form id="review-form" style="display:grid;gap:16px">
          <div>
            <label style="display:block;margin-bottom:8px;font-weight:600">Jouw naam *</label>
            <input type="text" id="review-name" required placeholder="Voornaam" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px" />
          </div>
          <div>
            <label style="display:block;margin-bottom:8px;font-weight:600">Rating *</label>
            <div class="star-rating" style="font-size:32px;cursor:pointer">
              <span data-rating="1">☆</span>
              <span data-rating="2">☆</span>
              <span data-rating="3">☆</span>
              <span data-rating="4">☆</span>
              <span data-rating="5">☆</span>
            </div>
            <input type="hidden" id="review-rating" value="0" required />
          </div>
          <div>
            <label style="display:block;margin-bottom:8px;font-weight:600">Jouw ervaring *</label>
            <textarea id="review-text" required placeholder="Vertel ons over je ervaring met dit product..." style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;min-height:120px;font-family:inherit" maxlength="500"></textarea>
            <div style="text-align:right;color:var(--muted);font-size:12px;margin-top:4px">
              <span id="review-char-count">0</span>/500 tekens
            </div>
          </div>
          <button type="submit" class="btn primary" style="width:100%;padding:12px">
            📝 Review plaatsen
          </button>
        </form>
      </div>
    </div>
  `;

  // Star rating interaction
  const stars = modal.querySelectorAll(".star-rating span");
  const ratingInput = document.getElementById("review-rating");

  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      const rating = index + 1;
      ratingInput.value = rating;
      stars.forEach((s, i) => {
        s.textContent = i < rating ? "★" : "☆";
      });
    });
    star.addEventListener("mouseenter", () => {
      stars.forEach((s, i) => {
        s.textContent = i <= index ? "★" : "☆";
      });
    });
  });

  modal.querySelector(".star-rating")?.addEventListener("mouseleave", () => {
    const currentRating = parseInt(ratingInput.value, 10);
    stars.forEach((s, i) => {
      s.textContent = i < currentRating ? "★" : "☆";
    });
  });

  // Character counter
  const textarea = document.getElementById("review-text");
  const charCount = document.getElementById("review-char-count");
  textarea?.addEventListener("input", () => {
    if (charCount) charCount.textContent = textarea.value.length;
  });

  // Form submission
  document.getElementById("review-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    submitReview(productId);
  });

  modal.classList.remove("hidden");
}

function submitReview(productId) {
  const name = document.getElementById("review-name")?.value;
  const rating = parseInt(document.getElementById("review-rating")?.value, 10);
  const text = document.getElementById("review-text")?.value;

  if (!name || rating === 0 || !text) {
    showToast("Vul alle velden in");
    return;
  }

  // Store review in localStorage
  const reviews = JSON.parse(localStorage.getItem("userReviews") || "{}");
  if (!reviews[productId]) reviews[productId] = [];

  reviews[productId].push({
    name,
    rating,
    text,
    date: new Date().toLocaleDateString("nl-NL"),
    verified: true, // Always verified since we check hasUserPurchased
  });

  localStorage.setItem("userReviews", JSON.stringify(reviews));

  showToast("Bedankt voor je review!");
  closeModal();

  // Reopen product modal to show new review
  const p = ALL.find((x) => x.id === productId);
  if (p) {
    setTimeout(() => openProductModal(p), 500);
  }
}

function getUserReviews(productId) {
  const reviews = JSON.parse(localStorage.getItem("userReviews") || "{}");
  return reviews[productId] || [];
}
