import { useState } from "react";
import type { FormEvent } from "react";
import type { CategoriaRead } from "@/features/categorias";
import Button from "@/shared/ui/Button";
import Input, { Select } from "@/shared/ui/Input";

interface FiltrosCatalogoProps {
  categorias: CategoriaRead[];
  categoriaId: number | undefined;
  busquedaInicial: string;
  onBuscar: (texto: string) => void;
  onCategoria: (id: number | undefined) => void;
}

// Búsqueda por nombre (al enviar) y filtro por categoría.
export default function FiltrosCatalogo({ categorias, categoriaId, busquedaInicial, onBuscar, onCategoria }: FiltrosCatalogoProps) {
  const [texto, setTexto] = useState(busquedaInicial);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    onBuscar(texto.trim());
  };

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <form onSubmit={enviar} className="flex min-w-64 flex-1 gap-2" role="search">
        <Input
          type="search"
          placeholder="Buscar productos..."
          aria-label="Buscar productos"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            if (e.target.value === "") onBuscar("");
          }}
        />
        <Button type="submit">Buscar</Button>
      </form>
      <Select
        aria-label="Filtrar por categoría"
        className="w-auto min-w-48"
        value={categoriaId ?? ""}
        onChange={(e) => onCategoria(e.target.value === "" ? undefined : Number(e.target.value))}
      >
        <option value="">Todas las categorías</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </Select>
    </div>
  );
}
