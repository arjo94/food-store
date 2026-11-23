import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/shared/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-orange-50 text-orange-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidadCarrito = useCartStore((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0));
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const cerrarSesion = async () => {
    try {
      await logout();
    } finally {
      queryClient.clear();
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-4 text-xl font-extrabold text-orange-600">
          🍔 Food Store
        </Link>
        <NavLink to="/" end className={linkClass}>
          Menú
        </NavLink>
        <NavLink to="/carrito" className={linkClass}>
          Carrito
          {cantidadCarrito > 0 && (
            <span className="ml-1 rounded-full bg-orange-600 px-1.5 py-0.5 text-xs font-bold text-white">{cantidadCarrito}</span>
          )}
        </NavLink>
        {usuario && (
          <NavLink to="/mis-pedidos" className={linkClass}>
            Mis pedidos
          </NavLink>
        )}
        {/* Acceso al panel solo para el rol admin */}
        {usuario?.role === "admin" && (
          <NavLink to="/admin/resumen" className={({ isActive }) => linkClass({ isActive: isActive || pathname.startsWith("/admin") })}>
            Panel admin
          </NavLink>
        )}

        <div className="ml-auto flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right text-sm leading-tight">
                <p className="font-medium text-slate-800">{usuario.full_name}</p>
                <p className="text-xs text-slate-500">
                  @{usuario.username} · {usuario.role === "admin" ? "Administrador" : "Cliente"}
                </p>
              </div>
              <Button variant="secondary" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Ingresar
              </NavLink>
              <Link to="/register" className="rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
