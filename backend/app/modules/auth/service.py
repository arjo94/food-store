from fastapi import HTTPException, status

from app.core.deps import CUENTA_DESACTIVADA
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    """Registro y login. Lanza HTTPException directamente, como el proyecto de seguridad."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        """Registro público: siempre crea usuarios con rol user."""
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username) is not None:
                raise HTTPException(status.HTTP_409_CONFLICT, "El nombre de usuario ya está registrado")
            if uow.usuarios.get_by_email(data.email) is not None:
                raise HTTPException(status.HTTP_409_CONFLICT, "El email ya está registrado")
            usuario = uow.usuarios.add(
                Usuario(
                    username=data.username,
                    full_name=data.full_name.strip(),
                    email=data.email.lower(),
                    hashed_password=hash_password(data.password),
                    role="user",
                )
            )
            return UserPublic.model_validate(usuario)

    def autenticar(self, username: str, password: str) -> str:
        """Valida las credenciales y devuelve el JWT firmado."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status.HTTP_401_UNAUTHORIZED,
                    "Usuario o contraseña incorrectos",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            if usuario.disabled:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, CUENTA_DESACTIVADA)
            return create_access_token(usuario.username)
