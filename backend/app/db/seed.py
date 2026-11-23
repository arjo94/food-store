"""Carga el usuario admin, categorías y productos. Ejecutar desde backend/: python -m app.db.seed

Es idempotente: si un registro ya existe, no lo vuelve a crear.
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.pedidos.models import Pedido  # noqa: F401  (registra todas las tablas)
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {
    "username": "admin",
    "full_name": "Administrador Food Store",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas caseras con papas"),
    ("Pizzas", "Pizzas a la piedra"),
    ("Empanadas", "Empanadas salteñas al horno"),
    ("Bebidas", "Gaseosas, aguas y jugos"),
    ("Postres", "Postres caseros"),
]

# (categoria, nombre, descripcion, precio_base, stock, disponible)
PRODUCTOS = [
    ("Hamburguesas", "Hamburguesa clásica", "Carne, queso cheddar, lechuga y tomate", 8500.0, 25, True),
    ("Hamburguesas", "Hamburguesa doble bacon", "Doble carne, cheddar y panceta crocante", 11200.0, 15, True),
    ("Pizzas", "Pizza muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9800.0, 20, True),
    ("Pizzas", "Pizza napolitana", "Muzzarella, tomate en rodajas y ajo", 11500.0, 12, True),
    ("Empanadas", "Empanada salteña de carne", "Carne cortada a cuchillo, papa y huevo", 1200.0, 120, True),
    ("Empanadas", "Empanada de humita", "Choclo, cebolla y salsa blanca", 1100.0, 80, True),
    ("Bebidas", "Gaseosa cola 500 ml", "Botella de 500 ml", 2200.0, 60, True),
    ("Bebidas", "Agua mineral 500 ml", "Sin gas", 1500.0, 50, True),
    ("Postres", "Flan casero con dulce de leche", "Porción individual", 3500.0, 18, True),
    ("Postres", "Torta de chocolate", "Porción con ganache", 4200.0, 0, False),
]


def cargar_admin(session: Session) -> None:
    existente = session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first()
    if existente is not None:
        print("Admin ya existe: se omite")
        return
    session.add(
        Usuario(
            username=ADMIN["username"],
            full_name=ADMIN["full_name"],
            email=ADMIN["email"],
            hashed_password=hash_password(ADMIN["password"]),
            role="admin",
        )
    )
    print(f"Admin creado: {ADMIN['username']} / {ADMIN['password']}")


def cargar_categorias(session: Session) -> dict[str, Categoria]:
    categorias: dict[str, Categoria] = {}
    for nombre, descripcion in CATEGORIAS:
        categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
        if categoria is None:
            categoria = Categoria(nombre=nombre, descripcion=descripcion)
            session.add(categoria)
            session.flush()
            print(f"Categoría creada: {nombre}")
        categorias[nombre] = categoria
    return categorias


def cargar_productos(session: Session, categorias: dict[str, Categoria]) -> None:
    for nombre_categoria, nombre, descripcion, precio, stock, disponible in PRODUCTOS:
        if session.exec(select(Producto).where(Producto.nombre == nombre)).first() is not None:
            continue
        categoria_id = categorias[nombre_categoria].id
        assert categoria_id is not None
        session.add(
            Producto(
                categoria_id=categoria_id,
                nombre=nombre,
                descripcion=descripcion,
                precio_base=precio,
                stock=stock,
                disponible=disponible,
            )
        )
        print(f"Producto creado: {nombre}")


def main() -> None:
    create_all_tables()
    with Session(engine) as session:
        cargar_admin(session)
        categorias = cargar_categorias(session)
        cargar_productos(session, categorias)
        session.commit()
    print("Seed completado")


if __name__ == "__main__":
    main()
