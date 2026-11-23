from collections.abc import Sequence
from datetime import datetime

from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def list_by_usuario(
        self, usuario_id: int | None, skip: int, limit: int, estado: str | None = None
    ) -> tuple[int, Sequence[Pedido]]:
        """Pedidos de un usuario (o de todos si usuario_id es None), del más reciente al más antiguo."""
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        items = self.session.exec(
            select(Pedido).where(*filtros).order_by(col(Pedido.id).desc()).offset(skip).limit(limit)
        ).all()
        return total, items

    def count_by_estado(self) -> dict[str, int]:
        statement = select(Pedido.estado, func.count()).group_by(col(Pedido.estado))
        return {estado: cantidad for estado, cantidad in self.session.exec(statement).all()}

    def count_desde(self, desde: datetime) -> int:
        statement = select(func.count()).select_from(Pedido).where(col(Pedido.created_at) >= desde)
        return self.session.exec(statement).one()

    def sum_total_por_estado(self, estado: str) -> float:
        statement = select(func.coalesce(func.sum(Pedido.total), 0.0)).where(Pedido.estado == estado)
        return float(self.session.exec(statement).one())


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, DetallePedido)
