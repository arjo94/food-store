import { useForm } from "@tanstack/react-form";
import EstadoError from "@/shared/components/EstadoError";
import FieldError from "@/shared/components/FieldError";
import Button from "@/shared/ui/Button";
import Input, { Campo } from "@/shared/ui/Input";
import type { LoginInput } from "../types/auth.types";

interface LoginFormProps {
  error: string | null;
  onSubmit: (data: LoginInput) => Promise<void>;
}

const requerido =
  (campo: string) =>
  ({ value }: { value: string }) =>
    value.trim() === "" ? `${campo} es obligatorio` : undefined;

export default function LoginForm({ error, onSubmit }: LoginFormProps) {
  const form = useForm({
    defaultValues: { username: "", password: "" } as LoginInput,
    onSubmit: async ({ value }) => onSubmit({ username: value.username.trim(), password: value.password }),
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
      <form.Field name="username" validators={{ onChange: requerido("El usuario") }}>
        {(field) => (
          <Campo id="login-username" label="Usuario" error={<FieldError errors={field.state.meta.errors} />}>
            <Input
              id="login-username"
              autoComplete="username"
              autoFocus
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </Campo>
        )}
      </form.Field>

      <form.Field name="password" validators={{ onChange: requerido("La contraseña") }}>
        {(field) => (
          <Campo id="login-password" label="Contraseña" error={<FieldError errors={field.state.meta.errors} />}>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </Campo>
        )}
      </form.Field>

      {error && <EstadoError mensaje={error} />}

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
