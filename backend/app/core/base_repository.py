from collections.abc import Sequence
from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

ModelT = TypeVar("ModelT", bound=SQLModel)


class BaseRepository(Generic[ModelT]):
    """CRUD genérico. Usa flush() para obtener los ids, nunca commit()."""

    def __init__(self, session: Session, model: type[ModelT]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: int) -> ModelT | None:
        return self.session.get(self.model, entity_id)

    def get_all(self) -> Sequence[ModelT]:
        return self.session.exec(select(self.model).order_by(getattr(self.model, "id"))).all()

    def add(self, entity: ModelT) -> ModelT:
        """Inserta o actualiza la entidad dentro de la transacción en curso."""
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: ModelT) -> None:
        self.session.delete(entity)
        self.session.flush()
