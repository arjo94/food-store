import { api } from "@/shared/api/axiosInstance";
import type { CategoriaInput, CategoriaRead } from "../types/categoria.types";

export const getCategorias = async () => (await api.get<CategoriaRead[]>("/categorias")).data;

export const createCategoria = async (data: CategoriaInput) => (await api.post<CategoriaRead>("/categorias", data)).data;

export const updateCategoria = async (id: number, data: Partial<CategoriaInput>) =>
  (await api.put<CategoriaRead>(`/categorias/${id}`, data)).data;

export const deleteCategoria = async (id: number) => {
  await api.delete(`/categorias/${id}`);
};
