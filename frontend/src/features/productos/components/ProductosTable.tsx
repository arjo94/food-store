import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/shared/components/DataTable";
import Button from "@/shared/ui/Button";
import { formatPrecio } from "@/shared/utils/format";
import type { ProductoRead } from "../types/producto.types";
import ProductoImagen from "./ProductoImagen";

interface ProductosTableProps {
  productos: ProductoRead[];
  ocupado: boolean;
  onEditar: (p: ProductoRead) => void;
  onStock: (p: ProductoRead) => void;
  onEliminar: (p: ProductoRead) => void;
}

const col = createColumnHelper<ProductoRead>();

export default function ProductosTable({ productos, ocupado, onEditar, onStock, onEliminar }: ProductosTableProps) {
  const columns = useMemo(
    () => [
      col.display({
        id: "imagen",
        header: "",
        cell: ({ row }) => <ProductoImagen src={row.original.imagen_url} alt={row.original.nombre} categoria={row.original.categoria.nombre} className="h-10 w-10 rounded text-xl" />,
      }),
      col.accessor("nombre", { header: "Nombre" }),
      col.accessor((p) => p.categoria.nombre, { id: "categoria", header: "Categoría" }),
      col.accessor("precio_base", { header: "Precio", cell: (info) => formatPrecio(info.getValue()) }),
      col.accessor("stock", {
        header: "Stock",
        cell: (info) => <span className={info.getValue() === 0 ? "font-semibold text-red-600" : ""}>{info.getValue()}</span>,
      }),
      col.accessor("disponible", {
        header: "Disponible",
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Sí</span>
          ) : (
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">No</span>
          ),
      }),
      col.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => onEditar(row.original)} disabled={ocupado}>
              Editar
            </Button>
            <Button variant="success" size="sm" onClick={() => onStock(row.original)} disabled={ocupado}>
              Stock
            </Button>
            <Button variant="danger" size="sm" onClick={() => onEliminar(row.original)} disabled={ocupado}>
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    [ocupado, onEditar, onStock, onEliminar],
  );

  return <DataTable data={productos} columns={columns} />;
}
