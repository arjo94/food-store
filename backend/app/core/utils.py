from datetime import datetime, timezone


def utcnow() -> datetime:
    """Fecha y hora actual en UTC, con zona horaria."""
    return datetime.now(timezone.utc)


def inicio_del_dia_local() -> datetime:
    """Medianoche de hoy en la hora local del servidor, expresada en UTC."""
    ahora_local = datetime.now().astimezone()
    medianoche = ahora_local.replace(hour=0, minute=0, second=0, microsecond=0)
    return medianoche.astimezone(timezone.utc)
