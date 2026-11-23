import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import Card from "@/shared/ui/Card";
import RegisterForm from "../components/RegisterForm";
import { useRegister } from "../hooks/useRegister";
import type { RegisterInput } from "../types/auth.types";

export default function RegisterPage() {
  const registro = useRegister();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const registrar = async (data: RegisterInput) => {
    setError(null);
    try {
      await registro.mutateAsync(data);
      navigate("/login", { replace: true, state: { registrado: true } });
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  return (
    <Card className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
      <p className="mb-6 text-sm text-slate-500">Registrate para hacer tus pedidos.</p>
      <RegisterForm error={error} onSubmit={registrar} />
      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Ya tenés cuenta?{" "}
        <Link to="/login" className="font-medium text-orange-600 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </Card>
  );
}
