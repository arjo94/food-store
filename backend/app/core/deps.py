from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status

from app.core.config import settings
from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


UsuarioServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


def get_current_user(request: Request, service: UsuarioServiceDep) -> UserPublic:
    """Lee el JWT de la cookie HttpOnly, valida firma y expiración y carga el usuario (401 si falla)."""
    no_autenticado = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado o sesión vencida",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = request.cookies.get(settings.cookie_name)
    username = decode_access_token(token) if token else None
    if username is None:
        raise no_autenticado
    usuario = service.obtener_por_username(username)
    if usuario is None:
        raise no_autenticado
    return usuario


def get_current_active_user(
    user: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    """Rechaza a los usuarios dados de baja (disabled = true) con 400."""
    if user.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=CUENTA_DESACTIVADA)
    return user


CurrentUser = Annotated[UserPublic, Depends(get_current_active_user)]


def require_role(roles: list[str]) -> Callable[[UserPublic], UserPublic]:
    """Dependencia que exige que el rol del usuario esté entre los permitidos (403)."""

    def checker(user: CurrentUser) -> UserPublic:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para realizar esta operación",
            )
        return user

    return checker


AdminUser = Annotated[UserPublic, Depends(require_role(["admin"]))]
