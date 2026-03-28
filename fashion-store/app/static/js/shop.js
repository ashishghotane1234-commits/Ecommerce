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

  loadProducts({ search, category: activeCategory, min_price: minPrice, max_price: maxPrice, sort });
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

// Initial load
applyFilters();
