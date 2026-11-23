import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import { SkeletonTabla } from "@/shared/components/Skeleton";
import { PageTitle } from "@/shared/layout/PageTitle";
import { useAuthStore } from "@/store/authStore";
import UsuariosTable from "../components/UsuariosTable";
import { useCambiarEstadoUsuario, useUsuarios } from "../hooks/useUsuarios";

export default function AdminUsuariosPage() {
  const idSesion = useAuthStore((s) => s.usuario?.id);
  const query = useUsuarios();
  const cambiarEstado = useCambiarEstadoUsuario();

  return (
    <section>
      <PageTitle titulo="Usuarios" subtitulo="Activá o desactivá las cuentas de los usuarios." />
      {query.isPending ? (
        <SkeletonTabla />
      ) : query.isError ? (
        <EstadoError mensaje={handleApiError(query.error)} onReintentar={() => void query.refetch()} />
      ) : query.data.length === 0 ? (
        <EstadoVacio mensaje="No hay usuarios registrados." />
      ) : (
        <UsuariosTable
          usuarios={query.data}
          idSesion={idSesion}
          ocupado={cambiarEstado.isPending}
          onCambiarEstado={(u) => cambiarEstado.mutate(u)}
        />
      )}
    </section>
  );
}
