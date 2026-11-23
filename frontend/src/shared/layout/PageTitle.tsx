import type { ReactNode } from "react";

interface PageTitleProps {
  titulo: string;
  subtitulo?: string;
  children?: ReactNode;
}

// Encabezado de página con acciones opcionales a la derecha.
export function PageTitle({ titulo, subtitulo, children }: PageTitleProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
        {subtitulo && <p className="text-sm text-slate-500">{subtitulo}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
