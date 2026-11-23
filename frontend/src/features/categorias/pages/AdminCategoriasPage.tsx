import { useState } from "react";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import { SkeletonTabla } from "@/shared/components/Skeleton";
import { handleApiError } from "@/shared/api/handleApiError";
import { PageTitle } from "@/shared/layout/PageTitle";
import Button from "@/shared/ui/Button";
import Modal from "@/shared/ui/Modal";
import CategoriaForm from "../components/CategoriaForm";
import CategoriasTable from "../components/CategoriasTable";
import { useCategoriaMutations, useCategorias } from "../hooks/useCategorias";
import type { CategoriaInput, CategoriaRead } from "../types/categoria.types";

export default function AdminCategoriasPage() {
  const query = useCategorias();
  const { crear, actualizar, eliminar } = useCategoriaMutations();
  const [abierto, setAbierto] = useState(false);
  const [enEdicion, setEnEdicion] = useState<CategoriaRead | null>(null);

  const guardar = enEdicion ? actualizar : crear;

  const abrir = (categoria: CategoriaRead | null) => {
    crear.reset();
    actualizar.reset();
    setEnEdicion(categoria);
    setAbierto(true);
  };
  const cerrar = () => setAbierto(false);

  const onGuardar = (data: CategoriaInput) => {
    if (enEdicion) actualizar.mutate({ id: enEdicion.id, data }, { onSuccess: cerrar });
    else crear.mutate(data, { onSuccess: cerrar });
  };

  const onEliminar = (c: CategoriaRead) => {
    if (window.confirm(`¿Dar de baja la categoría "${c.nombre}"? Sus productos siguen en el catálogo.`)) eliminar.mutate(c);
  };

  return (
    <section>
      <PageTitle titulo="Categorías" subtitulo="Alta, edición y baja lógica de las categorías del catálogo.">
        <Button onClick={() => abrir(null)}>+ Nueva categoría</Button>
      </PageTitle>

      {query.isPending ? (
        <SkeletonTabla />
      ) : query.isError ? (
        <EstadoError mensaje={handleApiError(query.error)} onReintentar={() => void query.refetch()} />
      ) : query.data.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hay categorías." />
      ) : (
        <CategoriasTable categorias={query.data} ocupado={eliminar.isPending} onEditar={abrir} onEliminar={onEliminar} />
      )}

      <Modal isOpen={abierto} title={enEdicion ? "Editar categoría" : "Nueva categoría"} onClose={cerrar}>
        <CategoriaForm
          key={enEdicion?.id ?? "nueva"}
          categoria={enEdicion}
          guardando={guardar.isPending}
          error={guardar.error ? handleApiError(guardar.error) : null}
          onCancelar={cerrar}
          onGuardar={onGuardar}
        />
      </Modal>
    </section>
  );
}
