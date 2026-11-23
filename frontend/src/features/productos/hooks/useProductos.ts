import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";
import { createProducto, deleteProducto, getProductos, updateProducto, updateStock } from "../api/productos";
import type { FiltrosProductos, ProductoInput, ProductoRead, ProductoStockUpdate } from "../types/producto.types";

export const productosKeys = {
  all: ["productos"] as const,
  list: (filtros: FiltrosProductos) => ["productos", filtros] as const,
};

// Listado paginado en el servidor; conserva la página anterior mientras carga la siguiente.
export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: productosKeys.list(filtros),
    queryFn: () => getProductos(filtros),
    placeholderData: keepPreviousData,
  });
}

// Alta, edición, stock y baja lógica de productos (admin).
export function useProductoMutations() {
  const queryClient = useQueryClient();
  const notificar = useNotificationStore((s) => s.showNotification);

  const refrescar = () => queryClient.invalidateQueries({ queryKey: productosKeys.all });
  const onError = (error: Error) => notificar(handleApiError(error), "error");

  const crear = useMutation({
    mutationFn: createProducto,
    onSuccess: async (p: ProductoRead) => {
      await refrescar();
      notificar(`Producto "${p.nombre}" creado`);
    },
    onError,
  });

  const actualizar = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoInput }) => updateProducto(id, data),
    onSuccess: async (p: ProductoRead) => {
      await refrescar();
      notificar(`Producto "${p.nombre}" actualizado`);
    },
    onError,
  });

  const cambiarStock = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoStockUpdate }) => updateStock(id, data),
    onSuccess: async (p: ProductoRead) => {
      await refrescar();
      notificar(`Stock de "${p.nombre}": ${p.stock} u. · ${p.disponible ? "disponible" : "no disponible"}`);
    },
    onError,
  });

  const eliminar = useMutation({
    mutationFn: async (p: ProductoRead) => {
      await deleteProducto(p.id);
      return p;
    },
    onSuccess: async (p) => {
      await refrescar();
      notificar(`Producto "${p.nombre}" dado de baja`);
    },
    onError,
  });

  return { crear, actualizar, cambiarStock, eliminar };
}
