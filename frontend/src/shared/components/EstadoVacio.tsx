import type { ReactNode } from "react";

interface EstadoVacioProps {
  mensaje: string;
  children?: ReactNode;
}

export default function EstadoVacio({ mensaje, children }: EstadoVacioProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-4xl" aria-hidden="true">
        🍽️
      </p>
      <p className="mt-2 text-slate-500">{mensaje}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
