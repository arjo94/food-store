from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    def __init__(self, usuario_id: int) -> None:
        super().__init__(f"El usuario {usuario_id} no existe")


class AutoDesactivacion(Exception):
    def __init__(self) -> None:
        super().__init__("Un administrador no puede desactivarse a sí mismo")


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.get_all()]

    def obtener_por_username(self, username: str) -> UserPublic | None:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            return UserPublic.model_validate(usuario) if usuario else None

    def _obtener(self, uow: UsuarioUnitOfWork, usuario_id: int) -> Usuario:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise UsuarioNoEncontrado(usuario_id)
        return usuario

    def activar(self, usuario_id: int) -> UserPublic:
        """Alta lógica; idempotente."""
        with self.uow as uow:
            usuario = self._obtener(uow, usuario_id)
            usuario.disabled = False
            return UserPublic.model_validate(uow.usuarios.add(usuario))

    def desactivar(self, usuario_id: int, actual_id: int) -> UserPublic:
        """Baja lógica (disabled = true); idempotente."""
        with self.uow as uow:
            usuario = self._obtener(uow, usuario_id)
            if usuario.id == actual_id:
                raise AutoDesactivacion()
            usuario.disabled = True
            return UserPublic.model_validate(uow.usuarios.add(usuario))
