async function loadCart() {
  const res = await fetch('/api/cart');
  if (res.status === 401) {
    document.getElementById('cart-items').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔒</div>
        <h3>Please log in</h3>
        <p><a href="/login" style="color:var(--accent-dk)">Login</a> to view your bag.</p>
      </div>`;
    return;
  }

  const data = await res.json();
  const fmt  = n => `₹${Number(n).toLocaleString('en-IN')}`;

  if (!data.items.length) {
    document.getElementById('cart-items').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛍️</div>
        <h3>Your bag is empty</h3>
        <p><a href="/" style="color:var(--accent-dk)">Continue shopping</a></p>
      </div>`;
    document.getElementById('checkout-btn').disabled = true;
    return;
  }

  document.getElementById('cart-items').innerHTML = data.items.map(item => `
    <div class="cart-item" id="item-${item.cart_id}">
      <div class="cart-item-img">
        <img src="${item.image_url}" alt="${item.name}" />
      </div>
      <div>
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-meta">Size: ${item.selected_size} &nbsp;·&nbsp; ${item.category}</p>
        <div class="cart-qty">
          <button onclick="updateQty('${item.cart_id}', ${item.quantity - 1})">−</button>
          <span>${item.quantity}</span>
          <button onclick="updateQty('${item.cart_id}', ${item.quantity + 1})">+</button>
        </div>
      </div>
      <div class="cart-item-right">
        <p class="cart-item-price">${fmt(item.subtotal)}</p>
        <button class="remove-btn" onclick="removeItem('${item.cart_id}')">✕ Remove</button>
      </div>
    </div>
  `).join('');

  document.getElementById('s-subtotal').textContent = fmt(data.total);
  document.getElementById('s-total').textContent    = fmt(data.total);
  document.getElementById('cart-count').textContent = data.count;
}

async function updateQty(cartId, qty) {
  if (qty < 1) { removeItem(cartId); return; }
  await fetch(`/api/cart/${cartId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity: qty })
  });
  loadCart();
}

async function removeItem(cartId) {
  await fetch(`/api/cart/${cartId}`, { method: 'DELETE' });
  showToast('Item removed');
  loadCart();
  updateCartCount();
}

async function placeOrder() {
  const address = document.getElementById('shipping-address').value.trim();
  if (!address) { showToast('Please enter a shipping address', 'error'); return; }

  const btn    = document.getElementById('checkout-btn');
  btn.disabled = true;
  btn.textContent = 'Placing order…';

  const res  = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipping_address: address })
  });
  const data = await res.json();

  if (res.ok) {
    showToast(`Order placed! 🎉 Total: ₹${data.total}`);
    setTimeout(() => { loadCart(); updateCartCount(); }, 1500);
  } else {
    showToast(data.error || 'Order failed', 'error');
    btn.disabled    = false;
    btn.textContent = 'Place Order';
  }
}

loadCart();
