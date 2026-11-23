import psycopg2
from app.core.config import settings

try:
    psycopg2.connect(settings.database_url.replace("+psycopg2", ""))
    print("Conexión OK")
except UnicodeDecodeError as e:
    print("ERROR REAL:", e.object.decode("cp1252"))