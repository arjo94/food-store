from fastapi import APIRouter, HTTPException, status

from app.core.deps import AdminUser, UsuarioServiceDep
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import AutoDesactivacion, UsuarioNoEncontrado

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])


@router.get("", response_model=list[UserPublic])
def listar_usuarios(_: AdminUser, service: UsuarioServiceDep):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(usuario_id: int, _: AdminUser, service: UsuarioServiceDep):
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(usuario_id: int, admin: AdminUser, service: UsuarioServiceDep):
    try:
        return service.desactivar(usuario_id, admin.id)
    except UsuarioNoEncontrado as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except AutoDesactivacion as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
