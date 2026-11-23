import { useState } from "react";
import { Link } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Paginacion from "@/shared/components/Paginacion";
import { SkeletonTabla } from "@/shared/components/Skeleton";
import { PageTitle } from "@/shared/layout/PageTitle";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { formatFecha, formatPrecio } from "@/shared/utils/format";
import PedidoDetalleModal from "../components/PedidoDetalleModal";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";
import type { Pedido } from "../types/pedido.types";

const LIMITE = 5;

export default function MisPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const query = usePedidos({ skip: pagina * LIMITE, limit: LIMITE });
  const cancelar = useCancelarPedido();

  const onCancelar = (p: Pedido) => {
    if (window.confirm(`¿Cancelar el pedido #${p.id}?`)) cancelar.mutate(p.id);
  };

  return (
    <section>
      <PageTitle titulo="Mis pedidos" subtitulo="Seguí el estado de tus pedidos." />

      {query.isPending ? (
        <SkeletonTabla />
      ) : query.isError ? (
        <EstadoError mensaje={handleApiError(query.error)} onReintentar={() => void query.refetch()} />
      ) : query.data.items.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hiciste pedidos.">
          <Link to="/" className="font-medium text-orange-600 hover:underline">
            Ver el menú
          </Link>
        </EstadoVacio>
      ) : (
        <>
          <div className="space-y-3">
            {query.data.items.map((p) => (
              <Card key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900">Pedido #{p.id}</span>
                    <BadgeEstado estado={p.estado} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatFecha(p.created_at)} · {p.items.length} {p.items.length === 1 ? "producto" : "productos"} · {p.direccion_entrega}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-900">{formatPrecio(p.total)}</span>
                  <Button variant="secondary" size="sm" onClick={() => setDetalleId(p.id)}>
                    Ver detalle
                  </Button>
                  {p.estado === "PENDIENTE" && (
                    <Button variant="danger" size="sm" onClick={() => onCancelar(p)} disabled={cancelar.isPending}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <Paginacion pagina={pagina} total={query.data.total} limite={LIMITE} onCambiar={setPagina} />
        </>
      )}

      <PedidoDetalleModal pedidoId={detalleId} onClose={() => setDetalleId(null)} />
    </section>
  );
}
