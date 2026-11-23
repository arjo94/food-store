import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/shared/components/DataTable";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import Button from "@/shared/ui/Button";
import { formatFecha, formatPrecio } from "@/shared/utils/format";
import type { EstadoPedido, Pedido } from "../types/pedido.types";

// Siguiente estado al avanzar (los estados terminales no avanzan).
const SIGUIENTE: Partial<Record<EstadoPedido, { estado: EstadoPedido; etiqueta: string }>> = {
  PENDIENTE: { estado: "EN_PREPARACION", etiqueta: "Preparar" },
  EN_PREPARACION: { estado: "ENTREGADO", etiqueta: "Entregar" },
};

const esTerminal = (estado: EstadoPedido) => estado === "ENTREGADO" || estado === "CANCELADO";

interface PedidosTableProps {
  pedidos: Pedido[];
  ocupado: boolean;
  onVer: (p: Pedido) => void;
  onCambiarEstado: (p: Pedido, estado: EstadoPedido) => void;
}

const col = createColumnHelper<Pedido>();

export default function PedidosTable({ pedidos, ocupado, onVer, onCambiarEstado }: PedidosTableProps) {
  const columns = useMemo(
    () => [
      col.accessor("id", { header: "#" }),
      col.accessor("created_at", { header: "Fecha", cell: (info) => formatFecha(info.getValue()) }),
      col.accessor("usuario_id", { header: "Cliente", cell: (info) => `Usuario #${info.getValue()}` }),
      col.accessor("direccion_entrega", { header: "Dirección" }),
      col.accessor("forma_pago", { header: "Pago", cell: (info) => (info.getValue() === "EFECTIVO" ? "Efectivo" : "Transferencia") }),
      col.accessor("total", { header: "Total", cell: (info) => formatPrecio(info.getValue()) }),
      col.accessor("estado", { header: "Estado", cell: (info) => <BadgeEstado estado={info.getValue()} /> }),
      col.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const p = row.original;
          const siguiente = SIGUIENTE[p.estado];
          return (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => onVer(p)}>
                Ver
              </Button>
              {siguiente && (
                <Button size="sm" onClick={() => onCambiarEstado(p, siguiente.estado)} disabled={ocupado}>
                  {siguiente.etiqueta}
                </Button>
              )}
              {!esTerminal(p.estado) && (
                <Button variant="danger" size="sm" onClick={() => onCambiarEstado(p, "CANCELADO")} disabled={ocupado}>
                  Cancelar
                </Button>
              )}
            </div>
          );
        },
      }),
    ],
    [ocupado, onVer, onCambiarEstado],
  );

  return <DataTable data={pedidos} columns={columns} />;
}
