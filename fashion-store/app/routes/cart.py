from flask import Blueprint, request, session, jsonify, render_template
from app.models import query

cart_bp = Blueprint('cart', __name__)

def login_required():
    if 'user_id' not in session:
        return jsonify({'error': 'Please log in'}), 401
    return None

# ─── Page ─────────────────────────────────────────────────────────────────────

@cart_bp.route('/cart')
def cart_page():
    return render_template('cart.html')

# ─── API ──────────────────────────────────────────────────────────────────────

@cart_bp.route('/api/cart')
def get_cart():
    err = login_required()
    if err: return err

    items = query('''
        SELECT
            c.id          AS cart_id,
            c.quantity,
            c.size        AS selected_size,
            p.id          AS product_id,
            p.name,
            p.price,
            p.image_url,
            p.category,
            (p.price * c.quantity) AS subtotal
        FROM cart c
        JOIN products p ON p.id = c.product_id
        WHERE c.user_id = %s
        ORDER BY c.added_at DESC
    ''', (session['user_id'],), fetchall=True)

    items    = [dict(i) for i in (items or [])]
    total    = sum(float(i['subtotal']) for i in items)
    return jsonify({'items': items, 'total': round(total, 2), 'count': len(items)})


@cart_bp.route('/api/cart', methods=['POST'])
def add_to_cart():
    err = login_required()
    if err: return err

    data       = request.get_json()
    product_id = data.get('product_id')
    size       = data.get('size', 'M')
    quantity   = int(data.get('quantity', 1))

    if not product_id:
        return jsonify({'error': 'product_id is required'}), 400

    # Check product exists
    product = query('SELECT id, stock FROM products WHERE id = %s', (product_id,), fetchone=True)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    # Check if already in cart — if so, increment quantity
    existing = query(
        'SELECT id, quantity FROM cart WHERE user_id = %s AND product_id = %s AND size = %s',
        (session['user_id'], product_id, size),
        fetchone=True
    )

    if existing:
        new_qty = existing['quantity'] + quantity
        query(
            'UPDATE cart SET quantity = %s WHERE id = %s',
            (new_qty, existing['id']),
            commit=True
        )
    else:
        query(
            'INSERT INTO cart (user_id, product_id, quantity, size) VALUES (%s, %s, %s, %s)',
            (session['user_id'], product_id, quantity, size),
            commit=True
        )

    return jsonify({'message': 'Added to cart'}), 201


@cart_bp.route('/api/cart/<cart_id>', methods=['PUT'])
def update_cart(cart_id):
    err = login_required()
    if err: return err

    data     = request.get_json()
    quantity = int(data.get('quantity', 1))

    if quantity < 1:
        return jsonify({'error': 'Quantity must be at least 1'}), 400

    query(
        'UPDATE cart SET quantity = %s WHERE id = %s AND user_id = %s',
        (quantity, cart_id, session['user_id']),
        commit=True
    )
    return jsonify({'message': 'Cart updated'})


@cart_bp.route('/api/cart/<cart_id>', methods=['DELETE'])
def remove_from_cart(cart_id):
    err = login_required()
    if err: return err

    query(
        'DELETE FROM cart WHERE id = %s AND user_id = %s',
        (cart_id, session['user_id']),
        commit=True
    )
    return jsonify({'message': 'Item removed'})


@cart_bp.route('/api/cart/clear', methods=['DELETE'])
def clear_cart():
    err = login_required()
    if err: return err

    query('DELETE FROM cart WHERE user_id = %s', (session['user_id'],), commit=True)
    return jsonify({'message': 'Cart cleared'})
