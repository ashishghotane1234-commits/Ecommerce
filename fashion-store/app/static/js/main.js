// ── Toast Notification ────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

// ── Check Session & Update Nav ────────────────────────────
async function initNav() {
  try {
    const res  = await fetch('/api/me');
    const data = await res.json();

    if (data.logged_in) {
      document.getElementById('login-link').style.display    = 'none';
      document.getElementById('user-greeting').style.display = 'flex';
      document.getElementById('user-name-display').textContent = data.name;
    }
    await updateCartCount();
  } catch (e) { console.warn('Nav init error', e); }
}

// ── Cart Count Badge ──────────────────────────────────────
async function updateCartCount() {
  try {
    const res  = await fetch('/api/cart');
    if (!res.ok) return;
    const data = await res.json();
    document.getElementById('cart-count').textContent = data.count || 0;
  } catch (e) {}
}

// ── Logout ────────────────────────────────────────────────
async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  showToast('Logged out. See you soon!');
  setTimeout(() => window.location.href = '/', 1000);
}

// ── Nav Search ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();

  const searchInput = document.getElementById('nav-search');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = searchInput.value.trim();
        if (q) window.location.href = `/?search=${encodeURIComponent(q)}`;
      }
    });
  }
});
