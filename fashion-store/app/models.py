import psycopg2
import psycopg2.extras
from app.config import Config

def get_db():
    """Open a new DB connection."""
    conn = psycopg2.connect(
        host     = Config.DB_HOST,
        port     = Config.DB_PORT,
        dbname   = Config.DB_NAME,
        user     = Config.DB_USER,
        password = Config.DB_PASSWORD,
        sslmode  = 'require'           # Supabase requires SSL
    )
    return conn

def query(sql, params=None, fetchone=False, fetchall=False, commit=False):
    """
    Universal query helper.
    - fetchone  → returns a single row dict
    - fetchall  → returns list of row dicts
    - commit    → for INSERT / UPDATE / DELETE
    """
    conn = get_db()
    try:
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(sql, params or ())
                if fetchone:
                    return cur.fetchone()
                if fetchall:
                    return cur.fetchall()
                if commit:
                    conn.commit()
                    return True
    finally:
        conn.close()
