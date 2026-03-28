let selectedSize = '';
let quantity     = 1;

async function loadProduct() {
  try {
    const res     = await fetch(`/api/products/${PRODUCT_ID}`);
    if (!res.ok) throw new Error('Not found');
    const p       = await res.json();
    const sizes   = p.size ? p.size.split(',') : ['S','M','L','XL'];

    document.title = `${p.name} — DRAPE`;
    document.getElementById('detail-wrap').innerHTML = `
      <div class="detail-img-wrap">
        <img src="${p.image_url}" alt="${p.name}" />
      </div>
      <div class="detail-info">
        <p class="detail-cat">${p.category}</p>
        <h1 class="detail-name">${p.name}</h1>
        <p class="detail-price">₹${Number(p.price).toLocaleString('en-IN')}</p>
        <p class="detail-desc">${p.description || 'No description available.'}</p>

        <div>
          <p class="size-label">Select Size</p>
          <div class="size-options" id="size-options">
            ${sizes.map(s => `
              <button class="size-btn" data-size="${s.trim()}"
                onclick="selectSize('${s.trim()}', this)">${s.trim()}</button>
            `).join('')}
          </div>
        </div>

        <div class="qty-row">
          <div class="qty-ctrl">
            <button onclick="changeQty(-1)">−</button>
            <span id="qty-display">1</span>
            <button onclick="changeQty(1)">+</button>
          </div>
          <button class="add-to-cart-btn" onclick="addToCart('${p.id}')">
            Add to Bag
          </button>
        </div>

        <p style="font-size:0.78rem; color:var(--muted)">
          ${p.stock > 10 ? '✅ In stock' : p.stock > 0 ? `⚠️ Only ${p.stock} left` : '❌ Out of stock'}
        </p>
      </div>
    `;
  } catch (e) {
    document.getElementById('detail-wrap').innerHTML =
      `<div class="empty-state"><h3>Product not found</h3></div>`;
  }
}

function selectSize(size, btn) {
  selectedSize = size;
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function changeQty(delta) {
  quantity = Math.max(1, quantity + delta);
  document.getElementById('qty-display').textContent = quantity;
}

async function addToCart(productId) {
  if (!selectedSize) { showToast('Please select a size', 'error'); return; }

  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: productId, size: selectedSize, quantity })
  });

  if (res.status === 401) {
    showToast('Please log in to add items', 'error');
    setTimeout(() => window.location.href = '/login', 1200);
    return;
  }
  const data = await res.json();
  if (res.ok) {
    showToast('Added to your bag! 🛍️');
    updateCartCount();
  } else {
    showToast(data.error || 'Something went wrong', 'error');
  }
}

loadProduct();
