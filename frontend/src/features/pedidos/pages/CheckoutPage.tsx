import { Link, Navigate, useNavigate } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import { PageTitle } from "@/shared/layout/PageTitle";
import Card from "@/shared/ui/Card";
import { formatPrecio } from "@/shared/utils/format";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import CheckoutForm from "../components/CheckoutForm";
import type { CheckoutValores } from "../components/CheckoutForm";
import { useCrearPedido } from "../hooks/usePedidos";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const notificar = useNotificationStore((s) => s.showNotification);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();

  if (items.length === 0 && !crearPedido.isSuccess) return <Navigate to="/carrito" replace />;

  const confirmar = (valores: CheckoutValores) => {
    crearPedido.mutate(
      {
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: valores.forma_pago,
        direccion_entrega: valores.direccion_entrega.trim(),
        notas: valores.notas.trim() || null,
      },
      {
        onSuccess: (pedido) => {
          vaciar();
          notificar(`¡Pedido #${pedido.id} confirmado!`);
          navigate("/mis-pedidos", { replace: true });
        },
      },
    );
  };

  return (
    <section>
      <PageTitle titulo="Confirmar pedido" subtitulo="Indicá dónde lo entregamos y cómo vas a pagar." />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-5">
          <CheckoutForm
            enviando={crearPedido.isPending}
            error={crearPedido.error ? handleApiError(crearPedido.error) : null}
            onConfirmar={confirmar}
          />
        </Card>
        <Card className="h-fit p-5">
          <h2 className="mb-3 font-semibold text-slate-900">Tu pedido</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between gap-2">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatPrecio(total)}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">El total final lo calcula el sistema con los precios vigentes al confirmar.</p>
          <Link to="/carrito" className="mt-3 block text-center text-sm text-orange-600 hover:underline">
            Volver al carrito
          </Link>
        </Card>
      </div>
    </section>
  );
}
