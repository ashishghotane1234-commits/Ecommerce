from flask import Flask, session
from app.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.secret_key = Config.SECRET_KEY

    @app.before_request
    def make_session_permanent():
        session.permanent = True

    from app.routes.auth     import auth_bp
    from app.routes.products import products_bp
    from app.routes.cart     import cart_bp
    from app.routes.orders   import orders_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(orders_bp)

    return app
```

---

## Step 5A — Prepare Your Repository

### 1. Create `Procfile` (no file extension) in root:
```
web: gunicorn run:app
