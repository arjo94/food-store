import { NavLink } from "react-router-dom";

const SECCIONES = [
  { to: "/admin/resumen", label: "Resumen" },
  { to: "/admin/pedidos", label: "Pedidos" },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/categorias", label: "Categorías" },
  { to: "/admin/usuarios", label: "Usuarios" },
];

// Navegación interna del panel de administración.
export default function AdminNav() {
  return (
    <nav className="mb-6 flex flex-wrap gap-1 border-b border-slate-200" aria-label="Panel de administración">
      {SECCIONES.map((s) => (
        <NavLink
          key={s.to}
          to={s.to}
          className={({ isActive }) =>
            `-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              isActive ? "border-orange-600 text-orange-700" : "border-transparent text-slate-500 hover:text-slate-800"
            }`
          }
        >
          {s.label}
        </NavLink>
      ))}
    </nav>
  );
}
