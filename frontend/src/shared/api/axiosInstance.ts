import axios from "axios";
import type { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import { CUENTA_DESACTIVADA, toApiError } from "./handleApiError";

// Instancia única de Axios: el navegador adjunta la cookie HttpOnly en cada petición.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Rutas cuyo 401 lo maneja el propio authStore.
const RUTAS_SIN_LIMPIEZA = ["/auth/token", "/auth/me"];

// Interceptor de respuesta: ante un 401 o una cuenta desactivada se limpia la sesión.
// ProtectedRoute redirige a /login al quedar sin usuario.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const apiError = toApiError(error);
    const url = error.config?.url ?? "";
    const sesionVencida = apiError.status === 401 && !RUTAS_SIN_LIMPIEZA.some((ruta) => url.includes(ruta));
    const cuentaDesactivada = apiError.status === 400 && apiError.message === CUENTA_DESACTIVADA;
    if (sesionVencida || cuentaDesactivada) {
      useAuthStore.getState().clearSession();
    }
    return Promise.reject(apiError);
  },
);
