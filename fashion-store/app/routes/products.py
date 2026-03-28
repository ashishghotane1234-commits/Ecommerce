from flask import Blueprint, request, jsonify, render_template
from app.models import query

products_bp = Blueprint('products', __name__)

# ─── Pages ────────────────────────────────────────────────────────────────────

@products_bp.route('/')
def home():
    return render_template('index.html')

@products_bp.route('/product/<product_id>')
def product_detail(product_id):
    return render_template('product.html', product_id=product_id)

# ─── API ──────────────────────────────────────────────────────────────────────

@products_bp.route('/api/products')
def get_products():
    """
    Supports query params:
      ?search=keyword
      ?category=Men|Women|Unisex
      ?min_price=500&max_price=2000
      ?sort=price_asc|price_desc|newest
    """
    search    = request.args.get('search', '').strip()
    category  = request.args.get('category', '').strip()
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    sort      = request.args.get('sort', 'newest')

    sql    = 'SELECT * FROM products WHERE stock > 0'
    params = []

    if search:
        sql += ' AND (LOWER(name) LIKE %s OR LOWER(description) LIKE %s)'
        like = f'%{search.lower()}%'
        params += [like, like]

    if category:
        sql += ' AND category = %s'
        params.append(category)

    if min_price is not None:
        sql += ' AND price >= %s'
        params.append(min_price)

    if max_price is not None:
        sql += ' AND price <= %s'
        params.append(max_price)

    sort_map = {
        'price_asc'  : 'ORDER BY price ASC',
        'price_desc' : 'ORDER BY price DESC',
        'newest'     : 'ORDER BY created_at DESC',
    }
    sql += ' ' + sort_map.get(sort, 'ORDER BY created_at DESC')

    products = query(sql, params, fetchall=True)
    return jsonify([dict(p) for p in (products or [])])


@products_bp.route('/api/products/<product_id>')
def get_product(product_id):
    product = query('SELECT * FROM products WHERE id = %s', (product_id,), fetchone=True)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(dict(product))


@products_bp.route('/api/categories')
def get_categories():
    rows = query('SELECT DISTINCT category FROM products WHERE stock > 0', fetchall=True)
    return jsonify([r['category'] for r in (rows or [])])
