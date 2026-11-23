import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/shared/components/DataTable";
import Button from "@/shared/ui/Button";
import type { CategoriaRead } from "../types/categoria.types";

interface CategoriasTableProps {
  categorias: CategoriaRead[];
  ocupado: boolean;
  onEditar: (c: CategoriaRead) => void;
  onEliminar: (c: CategoriaRead) => void;
}

const col = createColumnHelper<CategoriaRead>();

export default function CategoriasTable({ categorias, ocupado, onEditar, onEliminar }: CategoriasTableProps) {
  const columns = useMemo(
    () => [
      col.accessor("id", { header: "#" }),
      col.accessor("nombre", { header: "Nombre" }),
      col.accessor((c) => c.descripcion ?? "", {
        id: "descripcion",
        header: "Descripción",
        cell: (info) => info.getValue() || <span className="text-slate-400">—</span>,
      }),
      col.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => onEditar(row.original)} disabled={ocupado}>
              Editar
            </Button>
            <Button variant="danger" size="sm" onClick={() => onEliminar(row.original)} disabled={ocupado}>
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    [ocupado, onEditar, onEliminar],
  );

  return <DataTable data={categorias} columns={columns} />;
}
