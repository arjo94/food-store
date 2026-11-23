interface FieldErrorProps {
  errors: unknown[];
}

// Muestra los errores de validación de un campo de TanStack Form (sin repetir mensajes).
export default function FieldError({ errors }: FieldErrorProps) {
  const mensajes = Array.from(
    new Set(errors.filter((e) => e !== undefined && e !== null && e !== "").map(String)),
  );
  if (mensajes.length === 0) return null;
  return (
    <p className="mt-1 text-sm text-red-600" role="alert">
      {mensajes.join(", ")}
    </p>
  );
}
