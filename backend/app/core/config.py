from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración leída desde el archivo .env o desde variables de entorno."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite:///./foodstore.db"
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    frontend_origin: str = "http://localhost:5173"

    # Cookie que transporta el JWT
    cookie_name: str = "access_token"
    cookie_secure: bool = False  # True en producción (HTTPS)

    @property
    def cors_origins(self) -> list[str]:
        return [origen.strip() for origen in self.frontend_origin.split(",") if origen.strip()]


settings = Settings()  
