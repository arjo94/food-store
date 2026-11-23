import { useState } from "react";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import { SkeletonTabla } from "@/shared/components/Skeleton";
import { PageTitle } from "@/shared/layout/PageTitle";
import { Select } from "@/shared/ui/Input";
import PedidoDetalleModal from "../components/PedidoDetalleModal";
import PedidosTable from "../components/PedidosTable";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import { ESTADOS } from "../types/pedido.types";
import type { EstadoPedido, Pedido } from "../types/pedido.types";

const ETIQUETAS: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendientes",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregados",
  CANCELADO: "Cancelados",
};

export default function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined);
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const query = usePedidos({ skip: 0, limit: 100, estado });
  const cambiarEstado = useCambiarEstadoPedido();

  const onCambiarEstado = (p: Pedido, nuevo: EstadoPedido) => {
    if (nuevo === "CANCELADO" && !window.confirm(`¿Cancelar el pedido #${p.id}? Se restituirá el stock.`)) return;
    cambiarEstado.mutate({ id: p.id, estado: nuevo });
  };

  return (
    <section>
      <PageTitle titulo="Pedidos" subtitulo="Avanzá o cancelá los pedidos según su estado.">
        <Select
          aria-label="Filtrar por estado"
          className="w-auto min-w-44"
          value={estado ?? ""}
          onChange={(e) => setEstado(e.target.value === "" ? undefined : (e.target.value as EstadoPedido))}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {ETIQUETAS[e]}
            </option>
          ))}
        </Select>
      </PageTitle>

      {query.isPending ? (
        <SkeletonTabla />
      ) : query.isError ? (
        <EstadoError mensaje={handleApiError(query.error)} onReintentar={() => void query.refetch()} />
      ) : query.data.items.length === 0 ? (
        <EstadoVacio mensaje="No hay pedidos con ese estado." />
      ) : (
        <PedidosTable
          pedidos={query.data.items}
          ocupado={cambiarEstado.isPending}
          onVer={(p) => setDetalleId(p.id)}
          onCambiarEstado={onCambiarEstado}
        />
      )}

      <PedidoDetalleModal pedidoId={detalleId} onClose={() => setDetalleId(null)} />
    </section>
  );
}
