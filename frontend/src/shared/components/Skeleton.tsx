export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}

// Grilla de tarjetas en carga, con la misma forma que las tarjetas del catálogo.
export function SkeletonGrid({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
          <Skeleton className="mt-4 h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

// Filas en carga para las tablas del panel.
export function SkeletonTabla({ filas = 5 }: { filas?: number }) {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}
