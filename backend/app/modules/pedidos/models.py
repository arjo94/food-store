from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel

from app.core.utils import utcnow
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario


class Pedido(SQLModel, table=True):
    """Los pedidos no se borran: se cancelan."""

    __tablename__ = "pedido"

    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default="PENDIENTE", max_length=20, index=True)
    forma_pago: str = Field(max_length=20)  # EFECTIVO | TRANSFERENCIA
    direccion_entrega: str = Field(max_length=200)
    notas: str | None = Field(default=None, max_length=500)
    total: float = Field(default=0.0)  # suma de los subtotales; fija desde la creación
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    usuario: Usuario = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    """Línea inmutable: copia el nombre y el precio del producto al crear el pedido."""

    __tablename__ = "detalle_pedido"

    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int
    nombre_producto: str = Field(max_length=150)
    precio_unitario: float
    subtotal: float

    pedido: Pedido = Relationship(back_populates="items")
    producto: Producto = Relationship(back_populates="detalles")
