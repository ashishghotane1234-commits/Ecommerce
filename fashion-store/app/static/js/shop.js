let activeCategory = '';

// Read URL params on load
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('search'))   document.getElementById('nav-search').value = urlParams.get('search');
if (urlParams.get('category')) activeCategory = urlParams.get('category');

function applyFilters() {
  const search   = document.getElementById('nav-search')?.value.trim() || urlParams.get('search') || '';
  const minPrice = document.getElementById('min-price').value;
  const maxPrice = document.getElementById('max-price').value;
  const sort     = document.getElementById('sort-select').value;

  // Sync filters to URL so users can share/bookmark filtered pages
function syncURL(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
  window.history.replaceState({}, '', params.toString() ? `/?${params}` : '/');
}

// Updated applyFilters to also sync URL
function applyFilters() {
  const search   = document.getElementById('nav-search')?.value.trim() || '';
  const minPrice = document.getElementById('min-price').value;
  const maxPrice = document.getElementById('max-price').value;
  const sort     = document.getElementById('sort-select').value;
  const filters  = { search, category: activeCategory, min_price: minPrice, max_price: maxPrice, sort };

  syncURL(filters);
  loadProducts(filters);
}

// Initial load — read from URL
applyFilters();
}

function renderActivePills(filters) {
  const container = document.getElementById('active-filters');
  const pills = [];

  if (filters.category) pills.push({ label: `Category: ${filters.category}`, clear: () => { activeCategory = ''; applyFilters(); document.querySelectorAll('.filter-btn[data-cat]').forEach(b => b.classList.remove('active')); document.querySelector('.filter-btn[data-cat=""]').classList.add('active'); }});
  if (filters.min_price) pills.push({ label: `Min: ₹${filters.min_price}`, clear: () => { document.getElementById('min-price').value=''; applyFilters(); }});
  if (filters.max_price) pills.push({ label: `Max: ₹${filters.max_price}`, clear: () => { document.getElementById('max-price').value=''; applyFilters(); }});

  container.innerHTML = pills.map((p, i) => `
    <span style="
      background:var(--cream); border-radius:20px;
      padding:5px 12px; font-size:0.75rem; display:flex; align-items:center; gap:6px;
    ">
      ${p.label}
      <button data-pill="${i}" style="
        background:none; border:none; cursor:pointer;
        color:var(--muted); font-size:0.9rem; line-height:1;
      ">✕</button>
    </span>
  `).join('');

  // Attach clear events
  container.querySelectorAll('[data-pill]').forEach(btn => {
    btn.addEventListener('click', () => pills[+btn.dataset.pill].clear());
  });
}

// Category buttons
document.querySelectorAll('.filter-btn[data-cat]').forEach(btn => {
  if (btn.dataset.cat === activeCategory) {
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn[data-cat]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.cat;
    applyFilters();
  });
});

async function loadProducts(filters = {}) {
  renderActivePills(filters);   // ← add this line
  const grid = document.getElementById('product-grid');
  showSkeletons(grid);
  
  const grid = document.getElementById('product-grid');
  showSkeletons(grid);

  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });

  try {
    const res      = await fetch('/api/products?' + params.toString());
    const products = await res.json();

    document.getElementById('product-count').textContent =
      products.length ? `${products.length} items` : '';

    if (!products.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon">🛍️</div>
          <h3>No styles found</h3>
          <p>Try adjusting your filters or search term.</p>
        </div>`;
      return;
    }

    grid.innerHTML = products.map(p => `
      <div class="product-card" onclick="window.location.href='/product/${p.id}'">
        <div class="product-card-img">
          <img src="${p.image_url}" alt="${p.name}" loading="lazy" />
          <span class="product-badge">${p.category}</span>
        </div>
        <div class="product-card-body">
          <p class="product-card-cat">${p.category}</p>
          <p class="product-card-name">${p.name}</p>
          <p class="product-card-price">₹${Number(p.price).toLocaleString('en-IN')} <span>incl. taxes</span></p>
        </div>
      </div>
    `).join('');

  } catch (e) {
    grid.innerHTML = `<p style="padding:40px;color:var(--muted)">Failed to load products. Please refresh.</p>`;
  }

  // Show active search banner
const existingBanner = document.getElementById('search-banner');
if (existingBanner) existingBanner.remove();

if (filters.search) {
  const banner = document.createElement('div');
  banner.id = 'search-banner';
  banner.style.cssText = `
    grid-column: 1/-1; padding: 12px 0 4px;
    font-size: 0.85rem; color: var(--muted);
  `;
  banner.innerHTML = `
    Showing results for <strong style="color:var(--ink)">"${filters.search}"</strong>
    &nbsp;<button onclick="clearSearch()"
      style="background:none;border:none;color:var(--accent-dk);
             cursor:pointer;font-size:0.82rem;text-decoration:underline">
      Clear
    </button>`;
  document.getElementById('product-grid').prepend(banner);
}
}

function showSkeletons(grid) {
  grid.innerHTML = Array(6).fill(`
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line short"></div>
      </div>
    </div>`).join('');
}

function clearSearch() {
  document.getElementById('nav-search').value = '';
  window.history.replaceState({}, '', '/');
  applyFilters();
}

// Initial load
applyFilters();
