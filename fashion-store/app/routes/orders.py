from flask import Blueprint, request, session, jsonify
from app.models import query

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/api/orders', methods=['POST'])
def place_order():
    if 'user_id' not in session:
        return jsonify({'error': 'Please log in'}), 401

    data             = request.get_json()
    shipping_address = data.get('shipping_address', '').strip()

    if not shipping_address:
        return jsonify({'error': 'Shipping address is required'}), 400

    # Fetch current cart
    cart_items = query('''
        SELECT c.quantity, c.size, p.id AS product_id, p.price, p.stock
        FROM cart c
        JOIN products p ON p.id = c.product_id
        WHERE c.user_id = %s
    ''', (session['user_id'],), fetchall=True)

    if not cart_items:
        return jsonify({'error': 'Your cart is empty'}), 400

    # Calculate total
    total = sum(float(item['price']) * item['quantity'] for item in cart_items)

    # Create order
    order = query('''
        INSERT INTO orders (user_id, total_amount, shipping_address)
        VALUES (%s, %s, %s)
        RETURNING id
    ''', (session['user_id'], total, shipping_address), fetchone=True)

    order_id = order['id']

    # Insert order items
    for item in cart_items:
        query('''
            INSERT INTO order_items (order_id, product_id, quantity, size, price)
            VALUES (%s, %s, %s, %s, %s)
        ''', (order_id, item['product_id'], item['quantity'], item['size'], item['price']),
        commit=True)

    # Clear cart
    query('DELETE FROM cart WHERE user_id = %s', (session['user_id'],), commit=True)

    return jsonify({
        'message'  : 'Order placed successfully!',
        'order_id' : str(order_id),
        'total'    : round(total, 2)
    }), 201


@orders_bp.route('/api/orders')
def get_orders():
    if 'user_id' not in session:
        return jsonify({'error': 'Please log in'}), 401

    orders = query('''
        SELECT o.id, o.total_amount, o.status, o.shipping_address, o.created_at,
               COUNT(oi.id) AS item_count
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = %s
        GROUP BY o.id
        ORDER BY o.created_at DESC
    ''', (session['user_id'],), fetchall=True)

    return jsonify([dict(o) for o in (orders or [])])
