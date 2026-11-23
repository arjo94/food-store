from collections.abc import Sequence

from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Busca entre todas las categorías (la baja lógica no libera el nombre)."""
        statement = select(Categoria).where(func.lower(col(Categoria.nombre)) == nombre.strip().lower())
        return self.session.exec(statement).first()

    def list_activas(self) -> Sequence[Categoria]:
        statement = select(Categoria).where(col(Categoria.activo).is_(True)).order_by(col(Categoria.nombre))
        return self.session.exec(statement).all()
