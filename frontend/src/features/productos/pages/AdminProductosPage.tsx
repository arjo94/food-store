import { useState } from "react";
import { useCategorias } from "@/features/categorias";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import { SkeletonTabla } from "@/shared/components/Skeleton";
import { PageTitle } from "@/shared/layout/PageTitle";
import Button from "@/shared/ui/Button";
import Modal from "@/shared/ui/Modal";
import ProductoForm from "../components/ProductoForm";
import ProductosTable from "../components/ProductosTable";
import StockForm from "../components/StockForm";
import { useProductoMutations, useProductos } from "../hooks/useProductos";
import type { ProductoInput, ProductoRead, ProductoStockUpdate } from "../types/producto.types";

type ModalAbierto = { tipo: "form"; producto: ProductoRead | null } | { tipo: "stock"; producto: ProductoRead } | null;

export default function AdminProductosPage() {
  // El panel pide hasta 100 productos y pagina del lado del cliente con TanStack Table.
  const query = useProductos({ skip: 0, limit: 100 });
  const categorias = useCategorias();
  const { crear, actualizar, cambiarStock, eliminar } = useProductoMutations();
  const [modal, setModal] = useState<ModalAbierto>(null);

  const cerrar = () => setModal(null);
  const abrirForm = (producto: ProductoRead | null) => {
    crear.reset();
    actualizar.reset();
    setModal({ tipo: "form", producto });
  };
  const abrirStock = (producto: ProductoRead) => {
    cambiarStock.reset();
    setModal({ tipo: "stock", producto });
  };

  const guardar = modal?.tipo === "form" && modal.producto ? actualizar : crear;

  const onGuardar = (data: ProductoInput) => {
    if (modal?.tipo === "form" && modal.producto) actualizar.mutate({ id: modal.producto.id, data }, { onSuccess: cerrar });
    else crear.mutate(data, { onSuccess: cerrar });
  };

  const onGuardarStock = (data: ProductoStockUpdate) => {
    if (modal?.tipo === "stock") cambiarStock.mutate({ id: modal.producto.id, data }, { onSuccess: cerrar });
  };

  const onEliminar = (p: ProductoRead) => {
    if (window.confirm(`¿Dar de baja el producto "${p.nombre}"?`)) eliminar.mutate(p);
  };

  return (
    <section>
      <PageTitle titulo="Productos" subtitulo="Alta, edición, stock, disponibilidad y baja lógica.">
        <Button onClick={() => abrirForm(null)}>+ Nuevo producto</Button>
      </PageTitle>

      {query.isPending ? (
        <SkeletonTabla />
      ) : query.isError ? (
        <EstadoError mensaje={handleApiError(query.error)} onReintentar={() => void query.refetch()} />
      ) : query.data.items.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hay productos." />
      ) : (
        <ProductosTable productos={query.data.items} ocupado={eliminar.isPending} onEditar={abrirForm} onStock={abrirStock} onEliminar={onEliminar} />
      )}

      <Modal isOpen={modal?.tipo === "form"} title={modal?.tipo === "form" && modal.producto ? "Editar producto" : "Nuevo producto"} onClose={cerrar}>
        {modal?.tipo === "form" && (
          <ProductoForm
            key={modal.producto?.id ?? "nuevo"}
            producto={modal.producto}
            categorias={categorias.data ?? []}
            guardando={guardar.isPending}
            error={guardar.error ? handleApiError(guardar.error) : null}
            onCancelar={cerrar}
            onGuardar={onGuardar}
          />
        )}
      </Modal>

      <Modal isOpen={modal?.tipo === "stock"} title="Stock y disponibilidad" onClose={cerrar}>
        {modal?.tipo === "stock" && (
          <StockForm
            key={modal.producto.id}
            producto={modal.producto}
            guardando={cambiarStock.isPending}
            error={cambiarStock.error ? handleApiError(cambiarStock.error) : null}
            onCancelar={cerrar}
            onGuardar={onGuardarStock}
          />
        )}
      </Modal>
    </section>
  );
}
