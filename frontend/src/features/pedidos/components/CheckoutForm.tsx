import { useForm } from "@tanstack/react-form";
import EstadoError from "@/shared/components/EstadoError";
import FieldError from "@/shared/components/FieldError";
import Button from "@/shared/ui/Button";
import Input, { Campo, Select, TextArea } from "@/shared/ui/Input";
import type { FormaPago } from "../types/pedido.types";

export interface CheckoutValores {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

interface CheckoutFormProps {
  enviando: boolean;
  error: string | null;
  onConfirmar: (valores: CheckoutValores) => void;
}

// Datos de entrega y pago del pedido (RN-06).
export default function CheckoutForm({ enviando, error, onConfirmar }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: "", forma_pago: "EFECTIVO", notas: "" } as CheckoutValores,
    onSubmit: ({ value }) => onConfirmar(value),
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
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            if (largo < 5) return "La dirección debe tener al menos 5 caracteres";
            if (largo > 200) return "La dirección no puede superar los 200 caracteres";
            return undefined;
          },
        }}
      >
        {(field) => (
          <Campo id="checkout-direccion" label="Dirección de entrega" error={<FieldError errors={field.state.meta.errors} />}>
            <Input
              id="checkout-direccion"
              placeholder="Calle, número, piso/depto, barrio"
              autoComplete="street-address"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </Campo>
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <Campo id="checkout-pago" label="Forma de pago">
            <Select id="checkout-pago" value={field.state.value} onChange={(e) => field.handleChange(e.target.value as FormaPago)}>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </Select>
          </Campo>
        )}
      </form.Field>

      <form.Field name="notas" validators={{ onChange: ({ value }) => (value.length > 500 ? "Máximo 500 caracteres" : undefined) }}>
        {(field) => (
          <Campo id="checkout-notas" label="Notas (opcional)" error={<FieldError errors={field.state.meta.errors} />}>
            <TextArea
              id="checkout-notas"
              rows={3}
              placeholder="Ej.: tocar timbre 2B, sin cebolla..."
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </Campo>
        )}
      </form.Field>

      {error && <EstadoError mensaje={error} />}

      <form.Subscribe selector={(s) => s.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || enviando}>
            {enviando ? "Confirmando..." : "Confirmar pedido"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
