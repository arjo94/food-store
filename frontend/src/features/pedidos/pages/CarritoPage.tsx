import { Link, useNavigate } from "react-router-dom";
import EstadoVacio from "@/shared/components/EstadoVacio";
import { PageTitle } from "@/shared/layout/PageTitle";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { formatPrecio } from "@/shared/utils/format";
import { useCartStore } from "@/store/cartStore";
import CarritoItem from "../components/CarritoItem";

export default function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <section>
        <PageTitle titulo="Tu carrito" />
        <EstadoVacio mensaje="Tu carrito está vacío.">
          <Link to="/" className="font-medium text-orange-600 hover:underline">
            Ver el menú
          </Link>
        </EstadoVacio>
      </section>
    );
  }

  return (
    <section>
      <PageTitle titulo="Tu carrito" subtitulo="Revisá las cantidades antes de confirmar.">
        <Button variant="ghost" onClick={() => window.confirm("¿Vaciar el carrito?") && vaciar()}>
          Vaciar carrito
        </Button>
      </PageTitle>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="px-5">
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <CarritoItem key={item.producto_id} item={item} />
            ))}
          </ul>
        </Card>
        <Card className="h-fit space-y-4 p-5">
          <h2 className="font-semibold text-slate-900">Resumen</h2>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Productos</span>
            <span>{items.reduce((acc, i) => acc + i.cantidad, 0)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatPrecio(total)}</span>
          </div>
          <Button className="w-full" onClick={() => navigate("/checkout")}>
            Continuar con el pedido
          </Button>
          <Link to="/" className="block text-center text-sm text-orange-600 hover:underline">
            Seguir comprando
          </Link>
        </Card>
      </div>
    </section>
  );
}
