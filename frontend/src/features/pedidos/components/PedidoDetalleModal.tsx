import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import { Skeleton } from "@/shared/components/Skeleton";
import Modal from "@/shared/ui/Modal";
import { usePedido } from "../hooks/usePedidos";
import PedidoDetalle from "./PedidoDetalle";

interface PedidoDetalleModalProps {
  pedidoId: number | null;
  onClose: () => void;
}

// Consulta GET /pedidos/{id} y muestra el detalle en un modal.
export default function PedidoDetalleModal({ pedidoId, onClose }: PedidoDetalleModalProps) {
  const query = usePedido(pedidoId);
  return (
    <Modal isOpen={pedidoId !== null} title={`Pedido #${pedidoId ?? ""}`} onClose={onClose}>
      {query.isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : query.isError ? (
        <EstadoError mensaje={handleApiError(query.error)} />
      ) : (
        <PedidoDetalle pedido={query.data} />
      )}
    </Modal>
  );
}
