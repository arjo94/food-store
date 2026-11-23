import { formatPrecio } from "@/shared/utils/format";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import type { ProductoRead } from "../types/producto.types";
import ProductoImagen from "./ProductoImagen";

export default function ProductoCard({ producto }: { producto: ProductoRead }) {
  const agregar = useCartStore((s) => s.agregar);
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0);
  const notificar = useNotificationStore((s) => s.showNotification);

  const sinStock = producto.stock <= 0;
  // No se puede agregar más de lo que hay en stock.
  const puedeAgregar = producto.disponible && !sinStock && enCarrito < producto.stock;

  const onAgregar = () => {
    agregar({ producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base });
    notificar(`"${producto.nombre}" agregado al carrito`);
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <ProductoImagen src={producto.imagen_url} alt={producto.nombre} categoria={producto.categoria.nombre} className="h-40 w-full" />
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium tracking-wide text-orange-600 uppercase">{producto.categoria.nombre}</span>
        <h3 className="mt-1 font-semibold text-slate-900">{producto.nombre}</h3>
        {producto.descripcion && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{producto.descripcion}</p>}
        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between">
            <span className="text-lg font-bold text-slate-900">{formatPrecio(producto.precio_base)}</span>
            <span className={`text-xs ${sinStock ? "text-red-600" : "text-slate-500"}`}>
              {sinStock ? "Sin stock" : `Stock: ${producto.stock}`}
            </span>
          </div>
          <Button className="mt-3 w-full" onClick={onAgregar} disabled={!puedeAgregar}>
            {!producto.disponible ? "No disponible" : sinStock ? "Sin stock" : enCarrito >= producto.stock ? "Máximo en el carrito" : "Agregar al carrito"}
          </Button>
          {enCarrito > 0 && <p className="mt-1 text-center text-xs text-slate-500">En el carrito: {enCarrito}</p>}
        </div>
      </div>
    </Card>
  );
}
