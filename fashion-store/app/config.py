import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    FLASK_ENV  = os.getenv('FLASK_ENV', 'development')

    # Supabase PostgreSQL
    DB_HOST     = os.getenv('DB_HOST')
    DB_PORT     = os.getenv('DB_PORT', '5432')
    DB_NAME     = os.getenv('DB_NAME', 'postgres')
    DB_USER     = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    SESSION_COOKIE_SECURE   = True    # HTTPS only in production
    SESSION_COOKIE_HTTPONLY = True    # Block JS access to cookie
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = 86400  # 1 day in seconds
