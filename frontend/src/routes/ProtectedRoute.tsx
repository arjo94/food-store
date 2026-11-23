import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Rol } from "@/features/auth";
import { Skeleton } from "@/shared/components/Skeleton";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  roles?: Rol[];
}

// Sin sesión redirige a /login; sin el rol permitido, a /unauthorized.
// La protección real está en el backend (require_role); esto solo organiza la navegación.
export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();

  if (cargando) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Verificando sesión">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (!usuario) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
