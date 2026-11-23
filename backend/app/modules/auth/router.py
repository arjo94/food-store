from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import CurrentUser
from app.modules.auth.schemas import MensajeResponse
from app.modules.auth.service import AuthService
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: AuthServiceDep):
    return service.registrar(data)


@router.post("/token", response_model=MensajeResponse)
def login(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: AuthServiceDep,
):
    """Login con formulario OAuth2. El JWT viaja solo en la cookie HttpOnly, nunca en el cuerpo."""
    token = service.autenticar(form_data.username, form_data.password)
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )
    return MensajeResponse(message="Login exitoso")


@router.post("/logout", response_model=MensajeResponse)
def logout(response: Response):
    response.delete_cookie(
        key=settings.cookie_name, httponly=True, secure=settings.cookie_secure, samesite="lax", path="/"
    )
    return MensajeResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(user: CurrentUser):
    return user
