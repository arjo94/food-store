from types import TracebackType

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Abre la sesión en __enter__; hace commit o rollback y cierra en __exit__.

    Ningún Service ni Router llama a session.commit(): la transacción se
    confirma solo aquí, si el bloque `with` termina sin excepciones.
    """

    session: Session

    def __enter__(self) -> "UnitOfWork":
        self.session = session_factory()
        self._init_repositories(self.session)
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()

    def _init_repositories(self, session: Session) -> None:
        """Cada Unit of Work concreto crea aquí sus repositorios sobre la misma sesión."""
