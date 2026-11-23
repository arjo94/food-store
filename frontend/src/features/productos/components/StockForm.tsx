import { useForm } from "@tanstack/react-form";
import EstadoError from "@/shared/components/EstadoError";
import FieldError from "@/shared/components/FieldError";
import Button from "@/shared/ui/Button";
import Input, { Campo } from "@/shared/ui/Input";
import type { ProductoRead, ProductoStockUpdate } from "../types/producto.types";

interface StockFormProps {
  producto: ProductoRead;
  guardando: boolean;
  error: string | null;
  onCancelar: () => void;
  onGuardar: (data: ProductoStockUpdate) => void;
}

// Cambio rápido de stock y disponibilidad (PATCH /productos/{id}/stock).
export default function StockForm({ producto, guardando, error, onCancelar, onGuardar }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: ({ value }) => onGuardar({ stock: Number(value.stock), disponible: value.disponible }),
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
      <p className="text-sm text-slate-600">
        Producto: <strong>{producto.nombre}</strong>
      </p>
      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) => {
            const n = Number(value);
            if (value.trim() === "" || Number.isNaN(n)) return "Ingresá un número";
            if (n < 0 || !Number.isInteger(n)) return "El stock debe ser un entero mayor o igual a 0";
            return undefined;
          },
        }}
      >
        {(field) => (
          <Campo id="stock-cantidad" label="Stock" error={<FieldError errors={field.state.meta.errors} />}>
            <Input id="stock-cantidad" type="number" min={0} step={1} autoFocus value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
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
              {guardando ? "Guardando..." : "Actualizar stock"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
