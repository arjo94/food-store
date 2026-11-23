import type { CategoriaRead } from "@/features/categorias";

export interface ProductoRead {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria_id: number;
  categoria: CategoriaRead;
}

export interface ProductosPaginados {
  total: number;
  items: ProductoRead[];
}

export interface ProductoInput {
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}

export interface ProductoStockUpdate {
  stock: number;
  disponible: boolean;
}

export interface FiltrosProductos {
  skip: number;
  limit: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}
