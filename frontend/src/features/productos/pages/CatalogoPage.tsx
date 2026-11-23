import { useState } from "react";
import { useCategorias } from "@/features/categorias";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Paginacion from "@/shared/components/Paginacion";
import { SkeletonGrid } from "@/shared/components/Skeleton";
import { PageTitle } from "@/shared/layout/PageTitle";
import FiltrosCatalogo from "../components/FiltrosCatalogo";
import ProductoCard from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const LIMITE = 8;

export default function CatalogoPage() {
  const [pagina, setPagina] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const categorias = useCategorias();
  const productos = useProductos({
    skip: pagina * LIMITE,
    limit: LIMITE,
    search: busqueda || undefined,
    categoria_id: categoriaId,
  });

  return (
    <section>
      <PageTitle titulo="Nuestro menú" subtitulo="Elegí tus productos y armá tu pedido." />

      <FiltrosCatalogo
        categorias={categorias.data ?? []}
        categoriaId={categoriaId}
        busquedaInicial={busqueda}
        onBuscar={(texto) => {
          setBusqueda(texto);
          setPagina(0);
        }}
        onCategoria={(id) => {
          setCategoriaId(id);
          setPagina(0);
        }}
      />

      {productos.isPending ? (
        <SkeletonGrid cantidad={LIMITE} />
      ) : productos.isError ? (
        <EstadoError mensaje={handleApiError(productos.error)} onReintentar={() => void productos.refetch()} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio mensaje="No encontramos productos con esos filtros." />
      ) : (
        <>
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${productos.isPlaceholderData ? "opacity-60" : ""}`}>
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} total={productos.data.total} limite={LIMITE} onCambiar={setPagina} />
        </>
      )}
    </section>
  );
}
