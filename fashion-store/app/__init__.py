from flask import Flask
from app.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.secret_key = Config.SECRET_KEY

    # Register blueprints
    from app.routes.auth     import auth_bp
    from app.routes.products import products_bp
    from app.routes.cart     import cart_bp
    from app.routes.orders   import orders_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(orders_bp)

    return app
