from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import AdminUser, CurrentUser
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    CancelacionNoPermitida,
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]


def traducir_error(exc: Exception) -> HTTPException:
    """Traduce las excepciones de dominio del Service a respuestas HTTP."""
    if isinstance(exc, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(exc))
    if isinstance(exc, PedidoAjeno):
        return HTTPException(status.HTTP_403_FORBIDDEN, str(exc))
    if isinstance(
        exc,
        (StockInsuficiente, ProductoNoDisponible, ProductoRepetido, TransicionInvalida, CancelacionNoPermitida),
    ):
        return HTTPException(status.HTTP_400_BAD_REQUEST, str(exc))
    raise exc


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, user: CurrentUser, service: ServiceDep):
    try:
        return service.crear(data, user)
    except Exception as exc:
        raise traducir_error(exc) from exc


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    user: CurrentUser,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
):
    return service.listar(user, skip, limit, estado)


# Se declara antes de /{pedido_id} para que "resumen" no se interprete como un id.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_: AdminUser, service: ServiceDep):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, user: CurrentUser, service: ServiceDep):
    try:
        return service.obtener(pedido_id, user)
    except Exception as exc:
        raise traducir_error(exc) from exc


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(pedido_id: int, data: CambioEstado, _: AdminUser, service: ServiceDep):
    try:
        return service.cambiar_estado(pedido_id, data)
    except Exception as exc:
        raise traducir_error(exc) from exc


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, user: CurrentUser, service: ServiceDep):
    try:
        return service.cancelar(pedido_id, user)
    except Exception as exc:
        raise traducir_error(exc) from exc
