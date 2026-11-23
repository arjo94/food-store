from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Usuario)

    def get_by_username(self, username: str) -> Usuario | None:
        statement = select(Usuario).where(func.lower(col(Usuario.username)) == username.lower())
        return self.session.exec(statement).first()

    def get_by_email(self, email: str) -> Usuario | None:
        statement = select(Usuario).where(func.lower(col(Usuario.email)) == email.lower())
        return self.session.exec(statement).first()
