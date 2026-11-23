# Food Store · Trabajo Práctico Integrador

**Programación 4 · Tecnicatura Universitaria en Programación a Distancia (UTN)**
Alumno: Arjona, Martin

Aplicación web para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un carrito y
confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios desde un panel.

- **Repositorio:** https://github.com/arjo94/food-store
- **Video de demostración:** https://youtu.be/zrvLiU28u0I

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11 a 3.13 |
| PostgreSQL | 15 o superior (para desarrollo también se puede usar SQLite) |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm`) |

## Backend (FastAPI + SQLModel)

### Instalación y ejecución

```bash
cd backend
python -m venv venv
# Windows (PowerShell o CMD):  venv\Scripts\activate
# Windows (Git Bash):          source venv/Scripts/activate
# macOS / Linux:               source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env          # en CMD: copy .env.example .env
# editar .env: DATABASE_URL con el usuario y la contraseña de PostgreSQL, y SECRET_KEY

python -m app.db.seed         # crea las tablas y carga admin, categorías y productos (idempotente)
uvicorn app.main:app --reload
```

Antes del seed hay que crear la base vacía en PostgreSQL (por ejemplo desde pgAdmin, o con
`psql -U postgres -c "CREATE DATABASE foodstore_db;"`). Para probar sin PostgreSQL alcanza con
`DATABASE_URL=sqlite:///./foodstore.db`.

- API: `http://localhost:8000/api/v1`
- Documentación: `http://localhost:8000/docs` (Swagger) y `http://localhost:8000/redoc`

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://postgres:postgres@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |

Si la contraseña de PostgreSQL tiene caracteres especiales, se escriben codificados en la URL (por ejemplo `@` → `%40`).

### Usuario administrador del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | `admin` |

El seed también crea 5 categorías y 10 productos con stock (uno sin stock y no disponible). Los clientes se crean desde
la pantalla de registro.

### Arquitectura

```
backend/app/
├── main.py                 FastAPI, CORS con credenciales y routers bajo /api/v1
├── core/
│   ├── config.py           Settings (pydantic-settings) leídas de .env
│   ├── database.py         engine, create_all_tables y session_factory
│   ├── security.py         hash bcrypt (passlib), create_access_token y decode_access_token (python-jose)
│   ├── deps.py             get_current_user (lee la cookie), get_current_active_user y require_role
│   ├── unit_of_work.py     UnitOfWork: commit, rollback y close en __exit__
│   └── base_repository.py  BaseRepository[T]: get_by_id, get_all, add y delete
├── modules/
│   ├── auth/               router, service y schemas (usa el modelo Usuario)
│   ├── usuarios/           models, schemas, repository, unit_of_work, service y router
│   ├── categorias/         misma cadena de archivos
│   ├── productos/          misma cadena de archivos
│   └── pedidos/            misma cadena; el Unit of Work expone pedidos y productos en la misma sesión
└── db/seed.py              admin, categorías y productos
```

Cadena por módulo: **Router → Service → Unit of Work → Repository → Model**. El Router obtiene el Service con
`Depends(get_<modulo>_service)` y traduce las excepciones de dominio a `HTTPException`; el Service abre
`with self.uow as uow:` y devuelve el schema de salida dentro del bloque; ningún Service ni Router llama a `commit()`.

### Reglas de negocio

- **RN-01** El pedido se crea en una sola transacción: sin productos repetidos; cada producto debe existir, estar activo,
  disponible y con stock; se descuenta el stock y cada línea copia `nombre_producto` y `precio_unitario`. Si algo falla,
  no se guarda nada.
- **RN-02** Máquina de estados: `PENDIENTE → EN_PREPARACION | CANCELADO`, `EN_PREPARACION → ENTREGADO | CANCELADO`;
  `ENTREGADO` y `CANCELADO` son terminales (400 si la transición no es válida).
- **RN-03** Cancelar restituye el stock de cada línea en la misma transacción.
- **RN-04** El cliente solo ve y cancela sus pedidos (403 si son ajenos) y solo en `PENDIENTE`; el admin ve todos y
  avanza o cancela desde cualquier estado no terminal.
- **RN-05** Las líneas y el total no cambian; no hay edición ni borrado de pedidos.
- **RN-06** `forma_pago` es `EFECTIVO` o `TRANSFERENCIA` y `direccion_entrega` tiene entre 5 y 200 caracteres.

### Endpoints (`/api/v1`)

| Método y ruta | Acceso |
|---|---|
| `POST /auth/register`, `POST /auth/token`, `POST /auth/logout` | Público |
| `GET /auth/me` | Sesión |
| `GET /admin/usuarios`, `POST /admin/usuarios/{id}/activar`, `POST /admin/usuarios/{id}/desactivar` | admin |
| `GET /categorias`, `GET /categorias/{id}` | Público |
| `POST /categorias`, `PUT /categorias/{id}`, `DELETE /categorias/{id}` | admin |
| `GET /productos?skip&limit&search&categoria_id&disponible`, `GET /productos/{id}` | Público |
| `POST /productos`, `PUT /productos/{id}`, `PATCH /productos/{id}/stock`, `DELETE /productos/{id}` | admin |
| `POST /pedidos`, `GET /pedidos?skip&limit&estado` | Sesión (el cliente ve solo los suyos) |
| `GET /pedidos/resumen` | admin |
| `GET /pedidos/{id}` | Dueño o admin |
| `PATCH /pedidos/{id}/estado` | admin |
| `PATCH /pedidos/{id}/cancelar` | Dueño |

La sesión viaja en la cookie HttpOnly `access_token` (30 minutos); el cuerpo del login no incluye el token.
Las bajas son lógicas (`activo = false` en categorías y productos, `disabled = true` en usuarios).

## Frontend (React + TypeScript + Vite)

### Instalación y ejecución

```bash
cd frontend
cp .env.example .env          # en CMD: copy .env.example .env
pnpm install
pnpm build                    # verifica los tipos y compila
pnpm dev
```

- App: `http://localhost:5173` (con el backend corriendo en el puerto 8000).

### Variables de entorno (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

### Pantallas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Catálogo paginado en el servidor, búsqueda, filtro por categoría, skeleton y estado vacío | Público |
| `/carrito` | Carrito persistido (cantidades, subtotales y total) | Público |
| `/login`, `/register` | Formularios con TanStack Form | Público |
| `/checkout` | Dirección, forma de pago y notas; crea el pedido y vacía el carrito | Sesión |
| `/mis-pedidos` | Pedidos propios con detalle y cancelación en `PENDIENTE` | Sesión |
| `/admin/resumen` | Tarjetas con los indicadores del negocio | admin |
| `/admin/categorias`, `/admin/productos` | ABM con TanStack Table y TanStack Form; stock y disponibilidad | admin |
| `/admin/pedidos` | Filtro por estado, avanzar y cancelar | admin |
| `/admin/usuarios` | Activar y desactivar (sin Desactivar en la fila propia) | admin |
| `/unauthorized` | Sin permiso | Público |

### Arquitectura por features

```
frontend/src/
├── features/              un dominio por carpeta, espejo de los módulos del backend
│   ├── auth/              LoginPage, RegisterPage, UnauthorizedPage
│   ├── categorias/        AdminCategoriasPage, useCategorias
│   ├── productos/         CatalogoPage, AdminProductosPage, ProductoCard, useProductos
│   ├── usuarios/          AdminUsuariosPage, useUsuarios
│   └── pedidos/           CarritoPage, CheckoutPage, MisPedidosPage, AdminPedidosPage, AdminResumenPage
│                          (cada feature con pages/, components/, hooks/, api/, types/ e index.ts)
├── shared/
│   ├── api/               axiosInstance (withCredentials e interceptor de 401), handleApiError y queryClient
│   ├── ui/                Button, Card, Input, Modal y BadgeEstado
│   ├── components/        Paginacion, Skeleton, EstadoVacio, EstadoError, DataTable, FieldError y Toast
│   └── layout/            Navbar, MainLayout y AdminNav
├── store/                 authStore y cartStore (Zustand con persist) y notificationStore
├── routes/                AppRouter y ProtectedRoute
├── App.tsx                checkSession al montar y AppRouter
└── main.tsx               QueryClientProvider
```

- **Estado del servidor:** TanStack Query (`useQuery` con `queryKey` descriptivas e `invalidateQueries` en cada mutación).
- **Estado del cliente:** `authStore` (usuario, cargando, login, logout, checkSession; `persist` con `partialize` que
  guarda solo el usuario, nunca el token) y `cartStore` (items, agregar, quitar, cambiarCantidad, vaciar y total; `persist`).
- **Sesión:** el interceptor de Axios limpia el `authStore` ante un 401 (fuera de `/auth/token` y `/auth/me`) o ante
  «Cuenta de usuario desactivada»; `ProtectedRoute` redirige a `/login` sin sesión y a `/unauthorized` sin el rol.
- TypeScript con `strict: true` y sin `any`.

## Solución de problemas

- **`UnicodeDecodeError` al ejecutar el seed en Windows:** PostgreSQL rechazó la conexión (contraseña o base incorrecta)
  y el mensaje en español no se pudo decodificar. Revisar `DATABASE_URL` en `backend/.env` y que exista la base `foodstore_db`.
- **El navegador no guarda la sesión:** el frontend debe abrirse en `http://localhost:5173` (el mismo origen que `FRONTEND_ORIGIN`).

### Credenciales de prueba

| Rol | Usuario | Contraseña | Cómo se obtiene |
|---|---|---|---|
| admin | `admin` | `Admin1234!` | Lo crea el seed |
| user | `cliente1` | `Cliente1234!` | Se registra desde `/register` (el registro público siempre asigna el rol `user`) |

- **Repositorio:** https://github.com/arjo94/food-store
- **Video de demostración:** https://youtu.be/zrvLiU28u0I
