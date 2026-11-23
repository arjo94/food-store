from app.core.utils import inicio_del_dia_local, utcnow
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

PENDIENTE = "PENDIENTE"
EN_PREPARACION = "EN_PREPARACION"
ENTREGADO = "ENTREGADO"
CANCELADO = "CANCELADO"

# RN-02: mapa de transiciones válidas. Los estados terminales no admiten cambios.
TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),
    CANCELADO: set(),
}


class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"El pedido {pedido_id} no existe")


class PedidoAjeno(Exception):
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ProductoRepetido(Exception):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"El producto {producto_id} está repetido en el pedido")


class ProductoNoDisponible(Exception):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(Exception):
    def __init__(self, nombre: str, stock: int, cantidad: int) -> None:
        super().__init__(
            f"Stock insuficiente para '{nombre}': hay {stock} y se pidieron {cantidad}"
        )


class TransicionInvalida(Exception):
    def __init__(self, actual: str, nuevo: str) -> None:
        super().__init__(f"No se puede pasar un pedido de {actual} a {nuevo}")


class CancelacionNoPermitida(Exception):
    def __init__(self, estado: str) -> None:
        super().__init__(f"Solo se puede cancelar un pedido PENDIENTE (estado actual: {estado})")


def es_admin(usuario: UserPublic) -> bool:
    return usuario.role == "admin"


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    @staticmethod
    def _obtener(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        """RN-03: devuelve al stock la cantidad de cada línea, en la misma transacción."""
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow.productos.add(producto)

    def crear(self, data: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        """RN-01: todo el pedido se crea en una sola transacción o no se crea."""
        with self.uow as uow:
            vistos: set[int] = set()
            for item in data.items:
                if item.producto_id in vistos:
                    raise ProductoRepetido(item.producto_id)
                vistos.add(item.producto_id)

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    estado=PENDIENTE,
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega.strip(),
                    notas=(data.notas or "").strip() or None,
                    total=0.0,
                )
            )
            assert pedido.id is not None

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.detalles.add(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=item.producto_id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            pedido = uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self, usuario: UserPublic, skip: int, limit: int, estado: str | None
    ) -> PedidosPaginados:
        """El cliente ve solo sus pedidos; el admin ve todos."""
        with self.uow as uow:
            usuario_id = None if es_admin(usuario) else usuario.id
            total, items = uow.pedidos.list_by_usuario(usuario_id, skip, limit, estado)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in items])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if not es_admin(usuario) and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        """RN-02 y RN-03: el admin avanza o cancela según el mapa de transiciones."""
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if data.estado not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(pedido.estado, data.estado)
            if data.estado == CANCELADO:
                self._restituir_stock(uow, pedido)
            pedido.estado = data.estado
            pedido.updated_at = utcnow()
            return PedidoRead.model_validate(uow.pedidos.add(pedido))

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """RN-03 y RN-04: el dueño cancela su pedido solo desde PENDIENTE."""
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != PENDIENTE:
                raise CancelacionNoPermitida(pedido.estado)
            self._restituir_stock(uow, pedido)
            pedido.estado = CANCELADO
            pedido.updated_at = utcnow()
            return PedidoRead.model_validate(uow.pedidos.add(pedido))

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteos.get(PENDIENTE, 0),
                en_preparacion=conteos.get(EN_PREPARACION, 0),
                entregados=conteos.get(ENTREGADO, 0),
                cancelados=conteos.get(CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_del_dia_local()),
                ingresos_entregados=round(uow.pedidos.sum_total_por_estado(ENTREGADO), 2),
            )
