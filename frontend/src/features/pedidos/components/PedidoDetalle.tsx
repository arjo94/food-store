import BadgeEstado from "@/shared/ui/BadgeEstado";
import { formatFecha, formatPrecio } from "@/shared/utils/format";
import type { Pedido } from "../types/pedido.types";

const FORMAS_PAGO: Record<string, string> = { EFECTIVO: "Efectivo", TRANSFERENCIA: "Transferencia" };

// Detalle del pedido con sus líneas (nombre y precio copiados al crear el pedido).
export default function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BadgeEstado estado={pedido.estado} />
        <span className="text-slate-500">Creado: {formatFecha(pedido.created_at)}</span>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-slate-500">Dirección</dt>
        <dd className="text-slate-900">{pedido.direccion_entrega}</dd>
        <dt className="text-slate-500">Pago</dt>
        <dd className="text-slate-900">{FORMAS_PAGO[pedido.forma_pago] ?? pedido.forma_pago}</dd>
        {pedido.notas && (
          <>
            <dt className="text-slate-500">Notas</dt>
            <dd className="text-slate-900">{pedido.notas}</dd>
          </>
        )}
        <dt className="text-slate-500">Actualizado</dt>
        <dd className="text-slate-900">{formatFecha(pedido.updated_at)}</dd>
      </dl>
      <table className="w-full">
        <thead className="border-b border-slate-200 text-left text-slate-500">
          <tr>
            <th className="py-2 font-medium">Producto</th>
            <th className="py-2 text-right font-medium">Cant.</th>
            <th className="py-2 text-right font-medium">Precio</th>
            <th className="py-2 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pedido.items.map((item) => (
            <tr key={item.producto_id}>
              <td className="py-2">{item.nombre_producto}</td>
              <td className="py-2 text-right">{item.cantidad}</td>
              <td className="py-2 text-right">{formatPrecio(item.precio_unitario)}</td>
              <td className="py-2 text-right">{formatPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-200 font-bold">
            <td colSpan={3} className="py-2 text-right">
              Total
            </td>
            <td className="py-2 text-right">{formatPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
