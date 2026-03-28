from flask import Blueprint, request, session, jsonify, render_template, redirect, url_for
import bcrypt
from app.models import query

auth_bp = Blueprint('auth', __name__)

# ─── Pages ────────────────────────────────────────────────────────────────────

@auth_bp.route('/login')
def login_page():
    if 'user_id' in session:
        return redirect(url_for('products.home'))
    return render_template('login.html')

@auth_bp.route('/register')
def register_page():
    if 'user_id' in session:
        return redirect(url_for('products.home'))
    return render_template('register.html')

# ─── API ──────────────────────────────────────────────────────────────────────

@auth_bp.route('/api/register', methods=['POST'])
def register():
    data     = request.get_json()
    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # Basic validation
    if not name or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    # Check duplicate email
    existing = query('SELECT id FROM users WHERE email = %s', (email,), fetchone=True)
    if existing:
        return jsonify({'error': 'Email already registered'}), 409

    # Hash password
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Insert user
    user = query(
        'INSERT INTO users (name, email, password) VALUES (%s, %s, %s) RETURNING id, name, email',
        (name, email, hashed),
        fetchone=True
    )

    session['user_id']   = str(user['id'])
    session['user_name'] = user['name']
    session['is_admin']  = False

    return jsonify({'message': 'Registered successfully', 'name': user['name']}), 201


@auth_bp.route('/api/login', methods=['POST'])
def login():
    data     = request.get_json()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = query('SELECT * FROM users WHERE email = %s', (email,), fetchone=True)

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({'error': 'Invalid email or password'}), 401

    session['user_id']   = str(user['id'])
    session['user_name'] = user['name']
    session['is_admin']  = user['is_admin']

    return jsonify({'message': 'Logged in', 'name': user['name'], 'is_admin': user['is_admin']})


@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'})


@auth_bp.route('/api/me')
def me():
    """Check current session status."""
    if 'user_id' in session:
        return jsonify({
            'logged_in' : True,
            'name'      : session['user_name'],
            'is_admin'  : session.get('is_admin', False)
        })
    return jsonify({'logged_in': False})
