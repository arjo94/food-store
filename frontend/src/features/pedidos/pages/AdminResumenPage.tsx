import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import { Skeleton } from "@/shared/components/Skeleton";
import { PageTitle } from "@/shared/layout/PageTitle";
import { formatPrecio } from "@/shared/utils/format";
import ResumenCard from "../components/ResumenCard";
import { useResumenPedidos } from "../hooks/usePedidos";

export default function AdminResumenPage() {
  const query = useResumenPedidos();

  return (
    <section>
      <PageTitle titulo="Resumen del negocio" subtitulo="Indicadores de los pedidos." />
      {query.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : query.isError ? (
        <EstadoError mensaje={handleApiError(query.error)} onReintentar={() => void query.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pedidos de hoy" valor={query.data.pedidos_hoy} icono="📅" color="bg-orange-100" />
          <ResumenCard titulo="Pendientes" valor={query.data.pendientes} icono="⏳" color="bg-amber-100" />
          <ResumenCard titulo="En preparación" valor={query.data.en_preparacion} icono="👨‍🍳" color="bg-blue-100" />
          <ResumenCard titulo="Entregados" valor={query.data.entregados} icono="✅" color="bg-green-100" />
          <ResumenCard titulo="Cancelados" valor={query.data.cancelados} icono="✖️" color="bg-red-100" />
          <ResumenCard titulo="Ingresos (entregados)" valor={formatPrecio(query.data.ingresos_entregados)} icono="💰" color="bg-emerald-100" />
        </div>
      )}
    </section>
  );
}
