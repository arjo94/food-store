const COLORES: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  EN_PREPARACION: "bg-blue-100 text-blue-800",
  ENTREGADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-700",
};

const ETIQUETAS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

// Colorea los cuatro estados del pedido.
export default function BadgeEstado({ estado }: { estado: string }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${COLORES[estado] ?? "bg-slate-100 text-slate-700"}`}>
      {ETIQUETAS[estado] ?? estado}
    </span>
  );
}
