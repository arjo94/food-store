import { useForm } from "@tanstack/react-form";
import EstadoError from "@/shared/components/EstadoError";
import FieldError from "@/shared/components/FieldError";
import Button from "@/shared/ui/Button";
import Input, { Campo, TextArea } from "@/shared/ui/Input";
import type { CategoriaInput, CategoriaRead } from "../types/categoria.types";

interface CategoriaFormProps {
  categoria: CategoriaRead | null;
  guardando: boolean;
  error: string | null;
  onCancelar: () => void;
  onGuardar: (data: CategoriaInput) => void;
}

const validarNombre = ({ value }: { value: string }) => {
  const largo = value.trim().length;
  if (largo < 2) return "El nombre debe tener al menos 2 caracteres";
  if (largo > 100) return "El nombre no puede superar los 100 caracteres";
  return undefined;
};

export default function CategoriaForm({ categoria, guardando, error, onCancelar, onGuardar }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? "", descripcion: categoria?.descripcion ?? "" },
    onSubmit: ({ value }) =>
      onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() === "" ? null : value.descripcion.trim() }),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field name="nombre" validators={{ onChange: validarNombre }}>
        {(field) => (
          <Campo id="categoria-nombre" label="Nombre" error={<FieldError errors={field.state.meta.errors} />}>
            <Input
              id="categoria-nombre"
              autoFocus
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </Campo>
        )}
      </form.Field>

      <form.Field
        name="descripcion"
        validators={{ onChange: ({ value }) => (value.length > 500 ? "Máximo 500 caracteres" : undefined) }}
      >
        {(field) => (
          <Campo id="categoria-descripcion" label="Descripción (opcional)" error={<FieldError errors={field.state.meta.errors} />}>
            <TextArea
              id="categoria-descripcion"
              rows={3}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </Campo>
        )}
      </form.Field>

      {error && <EstadoError mensaje={error} />}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => s.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || guardando}>
              {guardando ? "Guardando..." : categoria ? "Guardar cambios" : "Crear categoría"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
