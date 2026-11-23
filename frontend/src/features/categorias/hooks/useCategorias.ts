import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";
import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from "../api/categorias";
import type { CategoriaInput, CategoriaRead } from "../types/categoria.types";

export const categoriasKeys = { all: ["categorias"] as const };

// Listado público de categorías activas.
export function useCategorias() {
  return useQuery({ queryKey: categoriasKeys.all, queryFn: getCategorias });
}

// Alta, edición y baja lógica de categorías (admin), con invalidación del listado.
export function useCategoriaMutations() {
  const queryClient = useQueryClient();
  const notificar = useNotificationStore((s) => s.showNotification);

  const refrescar = async () => {
    await queryClient.invalidateQueries({ queryKey: categoriasKeys.all });
    // Los productos muestran el nombre de su categoría.
    await queryClient.invalidateQueries({ queryKey: ["productos"] });
  };
  const onError = (error: Error) => notificar(handleApiError(error), "error");

  const crear = useMutation({
    mutationFn: createCategoria,
    onSuccess: async (c: CategoriaRead) => {
      await refrescar();
      notificar(`Categoría "${c.nombre}" creada`);
    },
    onError,
  });

  const actualizar = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaInput }) => updateCategoria(id, data),
    onSuccess: async (c: CategoriaRead) => {
      await refrescar();
      notificar(`Categoría "${c.nombre}" actualizada`);
    },
    onError,
  });

  const eliminar = useMutation({
    mutationFn: async (c: CategoriaRead) => {
      await deleteCategoria(c.id);
      return c;
    },
    onSuccess: async (c) => {
      await refrescar();
      notificar(`Categoría "${c.nombre}" dada de baja`);
    },
    onError,
  });

  return { crear, actualizar, eliminar };
}
