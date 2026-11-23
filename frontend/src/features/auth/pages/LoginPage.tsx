import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/shared/api/handleApiError";
import Card from "@/shared/ui/Card";
import { useAuthStore } from "@/store/authStore";
import LoginForm from "../components/LoginForm";
import type { LoginInput } from "../types/auth.types";

interface LocationState {
  from?: string;
  registrado?: boolean;
}

export default function LoginPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const login = useAuthStore((s) => s.login);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const state = (useLocation().state as LocationState | null) ?? {};
  const [error, setError] = useState<string | null>(null);

  // Después del login se vuelve a la ruta protegida que se intentó abrir (por ejemplo, el checkout).
  const destino = state.from ?? "/";

  if (usuario && !cargando) return <Navigate to={destino} replace />;

  const ingresar = async ({ username, password }: LoginInput) => {
    setError(null);
    try {
      queryClient.clear();
      await login(username, password);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  return (
    <Card className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
      <p className="mb-6 text-sm text-slate-500">Ingresá con tu usuario y contraseña.</p>
      {state.registrado && (
        <p className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700" role="status">
          Cuenta creada. Ya podés iniciar sesión.
        </p>
      )}
      <LoginForm error={error} onSubmit={ingresar} />
      <p className="mt-6 text-center text-sm text-slate-500">
        ¿No tenés cuenta?{" "}
        <Link to="/register" className="font-medium text-orange-600 hover:underline">
          Registrate
        </Link>
      </p>
    </Card>
  );
}
