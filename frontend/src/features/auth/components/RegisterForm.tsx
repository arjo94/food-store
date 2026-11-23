import { useForm } from "@tanstack/react-form";
import EstadoError from "@/shared/components/EstadoError";
import FieldError from "@/shared/components/FieldError";
import Button from "@/shared/ui/Button";
import Input, { Campo } from "@/shared/ui/Input";
import type { RegisterInput } from "../types/auth.types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[A-Za-z0-9_.-]+$/;

type Validador = ({ value }: { value: string }) => string | undefined;

const validarUsername: Validador = ({ value }) => {
  const v = value.trim();
  if (v.length < 3) return "El usuario debe tener al menos 3 caracteres";
  if (v.length > 50) return "El usuario no puede superar los 50 caracteres";
  if (!USERNAME_REGEX.test(v)) return "Solo letras, números, punto, guion y guion bajo (sin espacios)";
  return undefined;
};

const validarNombre: Validador = ({ value }) =>
  value.trim().length < 2 ? "El nombre completo debe tener al menos 2 caracteres" : undefined;

const validarEmail: Validador = ({ value }) => (EMAIL_REGEX.test(value.trim()) ? undefined : "El email no es válido");

const validarPassword: Validador = ({ value }) =>
  value.length < 8 ? "La contraseña debe tener al menos 8 caracteres" : undefined;

interface CampoConfig {
  name: keyof RegisterInput;
  label: string;
  type: string;
  autoComplete: string;
  validar: Validador;
}

const CAMPOS: CampoConfig[] = [
  { name: "username", label: "Usuario", type: "text", autoComplete: "username", validar: validarUsername },
  { name: "full_name", label: "Nombre completo", type: "text", autoComplete: "name", validar: validarNombre },
  { name: "email", label: "Email", type: "email", autoComplete: "email", validar: validarEmail },
  { name: "password", label: "Contraseña", type: "password", autoComplete: "new-password", validar: validarPassword },
];

interface RegisterFormProps {
  error: string | null;
  onSubmit: (data: RegisterInput) => Promise<void>;
}

export default function RegisterForm({ error, onSubmit }: RegisterFormProps) {
  const form = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "" } as RegisterInput,
    onSubmit: async ({ value }) =>
      onSubmit({
        username: value.username.trim(),
        full_name: value.full_name.trim(),
        email: value.email.trim(),
        password: value.password,
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
      {CAMPOS.map((campo) => (
        <form.Field key={campo.name} name={campo.name} validators={{ onChange: campo.validar }}>
          {(field) => (
            <Campo id={`register-${campo.name}`} label={campo.label} error={<FieldError errors={field.state.meta.errors} />}>
              <Input
                id={`register-${campo.name}`}
                type={campo.type}
                autoComplete={campo.autoComplete}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Campo>
          )}
        </form.Field>
      ))}

      {error && <EstadoError mensaje={error} />}

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Registrando..." : "Crear cuenta"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
