import { useForm } from "@tanstack/react-form";
import type { CategoriaRead } from "@/features/categorias";
import EstadoError from "@/shared/components/EstadoError";
import FieldError from "@/shared/components/FieldError";
import Button from "@/shared/ui/Button";
import Input, { Campo, Select, TextArea } from "@/shared/ui/Input";
import type { ProductoInput, ProductoRead } from "../types/producto.types";

interface ProductoFormProps {
  producto: ProductoRead | null;
  categorias: CategoriaRead[];
  guardando: boolean;
  error: string | null;
  onCancelar: () => void;
  onGuardar: (data: ProductoInput) => void;
}

interface Valores {
  nombre: string;
  descripcion: string;
  precio_base: string;
  imagen_url: string;
  stock: string;
  disponible: boolean;
  categoria_id: string;
}

const validarNombre = ({ value }: { value: string }) => {
  const largo = value.trim().length;
  if (largo < 2) return "El nombre debe tener al menos 2 caracteres";
  if (largo > 150) return "Máximo 150 caracteres";
  return undefined;
};

const validarNumero =
  (campo: string, entero: boolean) =>
  ({ value }: { value: string }) => {
    if (value.trim() === "") return `${campo} es obligatorio`;
    const n = Number(value);
    if (Number.isNaN(n)) return `${campo} debe ser un número`;
    if (n < 0) return `${campo} no puede ser negativo`;
    if (entero && !Number.isInteger(n)) return `${campo} debe ser un número entero`;
    return undefined;
  };

const validarUrl = ({ value }: { value: string }) => {
  if (value.trim() === "") return undefined;
  return /^https?:\/\/\S+$/.test(value.trim()) ? undefined : "La URL debe empezar con http:// o https://";
};

export default function ProductoForm({ producto, categorias, guardando, error, onCancelar, onGuardar }: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? "",
      descripcion: producto?.descripcion ?? "",
      precio_base: producto ? String(producto.precio_base) : "",
      imagen_url: producto?.imagen_url ?? "",
      stock: producto ? String(producto.stock) : "0",
      disponible: producto?.disponible ?? true,
      categoria_id: producto ? String(producto.categoria_id) : "",
    } as Valores,
    onSubmit: ({ value }) =>
      onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      }),
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
          <Campo id="producto-nombre" label="Nombre" error={<FieldError errors={field.state.meta.errors} />}>
            <Input id="producto-nombre" autoFocus value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>

      <form.Field name="categoria_id" validators={{ onChange: ({ value }) => (value === "" ? "Elegí una categoría" : undefined) }}>
        {(field) => (
          <Campo id="producto-categoria" label="Categoría" error={<FieldError errors={field.state.meta.errors} />}>
            <Select id="producto-categoria" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)}>
              <option value="">Seleccioná...</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </Campo>
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <Campo id="producto-descripcion" label="Descripción (opcional)">
            <TextArea id="producto-descripcion" rows={2} maxLength={500} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="precio_base" validators={{ onChange: validarNumero("El precio", false) }}>
          {(field) => (
            <Campo id="producto-precio" label="Precio base ($)" error={<FieldError errors={field.state.meta.errors} />}>
              <Input id="producto-precio" type="number" min={0} step="0.01" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
            </Campo>
          )}
        </form.Field>
        <form.Field name="stock" validators={{ onChange: validarNumero("El stock", true) }}>
          {(field) => (
            <Campo id="producto-stock" label="Stock" error={<FieldError errors={field.state.meta.errors} />}>
              <Input id="producto-stock" type="number" min={0} step={1} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
            </Campo>
          )}
        </form.Field>
      </div>

      <form.Field name="imagen_url" validators={{ onChange: validarUrl }}>
        {(field) => (
          <Campo id="producto-imagen" label="URL de la imagen (opcional)" error={<FieldError errors={field.state.meta.errors} />}>
            <Input id="producto-imagen" type="url" placeholder="https://..." value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} className="h-4 w-4 accent-orange-600" />
            Disponible para la venta
          </label>
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
              {guardando ? "Guardando..." : producto ? "Guardar cambios" : "Crear producto"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
