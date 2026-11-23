import Button from "@/shared/ui/Button";

interface PaginacionProps {
  pagina: number; // base 0
  total: number;
  limite: number;
  onCambiar: (pagina: number) => void;
}

// Paginación del lado del servidor: skip = página × limit.
export default function Paginacion({ pagina, total, limite, onCambiar }: PaginacionProps) {
  const paginas = Math.max(Math.ceil(total / limite), 1);
  return (
    <div className="mt-6 flex items-center justify-between">
      <span className="text-sm text-slate-500">
        Página {pagina + 1} de {paginas} · {total} resultados
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => onCambiar(pagina - 1)} disabled={pagina === 0}>
          Anterior
        </Button>
        <Button variant="secondary" onClick={() => onCambiar(pagina + 1)} disabled={pagina + 1 >= paginas}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
