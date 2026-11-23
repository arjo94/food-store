import Button from "@/shared/ui/Button";
import { formatPrecio } from "@/shared/utils/format";
import { useCartStore } from "@/store/cartStore";
import type { CartItem } from "@/store/cartStore";

export default function CarritoItem({ item }: { item: CartItem }) {
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);

  return (
    <li className="flex flex-wrap items-center gap-4 py-4">
      <div className="min-w-40 flex-1">
        <p className="font-medium text-slate-900">{item.nombre}</p>
        <p className="text-sm text-slate-500">{formatPrecio(item.precio_unitario)} c/u</p>
      </div>
      <div className="flex items-center gap-2" aria-label={`Cantidad de ${item.nombre}`}>
        <Button variant="secondary" size="sm" onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)} aria-label="Restar uno">
          −
        </Button>
        <span className="w-8 text-center font-semibold">{item.cantidad}</span>
        <Button variant="secondary" size="sm" onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)} aria-label="Sumar uno">
          +
        </Button>
      </div>
      <span className="w-28 text-right font-semibold text-slate-900">{formatPrecio(item.precio_unitario * item.cantidad)}</span>
      <Button variant="ghost" size="sm" onClick={() => quitar(item.producto_id)}>
        Quitar
      </Button>
    </li>
  );
}
