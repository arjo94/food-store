from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite necesita check_same_thread=False para usarse desde los hilos de FastAPI
_connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(settings.database_url, connect_args=_connect_args)


def create_all_tables() -> None:
    """Crea las tablas de todos los modelos importados."""
    import app.modules.pedidos.models  # noqa: F401  (registra todos los modelos)

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine, expire_on_commit=False)
