import { api } from "@/shared/api/axiosInstance";
import type {
  FiltrosProductos,
  ProductoInput,
  ProductoRead,
  ProductosPaginados,
  ProductoStockUpdate,
} from "../types/producto.types";

export const getProductos = async (filtros: FiltrosProductos) =>
  (await api.get<ProductosPaginados>("/productos", { params: filtros })).data;

export const createProducto = async (data: ProductoInput) => (await api.post<ProductoRead>("/productos", data)).data;

export const updateProducto = async (id: number, data: Partial<ProductoInput>) =>
  (await api.put<ProductoRead>(`/productos/${id}`, data)).data;

export const updateStock = async (id: number, data: ProductoStockUpdate) =>
  (await api.patch<ProductoRead>(`/productos/${id}/stock`, data)).data;

export const deleteProducto = async (id: number) => {
  await api.delete(`/productos/${id}`);
};
