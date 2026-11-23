import { isAxiosError } from "axios";

export const CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";

// Error normalizado con el código HTTP y un mensaje listo para mostrar.
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// FastAPI devuelve `detail` como texto o, en los 422, como lista de errores de validación.
function mensajeDesdeDetail(detail: unknown): string | null {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const mensajes = detail.map((item) => {
      if (typeof item === "object" && item !== null && "msg" in item) {
        return String((item as { msg: unknown }).msg);
      }
      return String(item);
    });
    return mensajes.length > 0 ? mensajes.join(". ") : null;
  }
  return null;
}

// Convierte cualquier error de Axios en un ApiError con el `detail` de la API.
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (isAxiosError<{ detail?: unknown }>(error)) {
    if (!error.response) {
      return new ApiError("No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.", 0);
    }
    const { status, data } = error.response;
    return new ApiError(mensajeDesdeDetail(data?.detail) ?? `Error inesperado del servidor (${status})`, status);
  }
  return new ApiError(error instanceof Error ? error.message : "Ocurrió un error inesperado", 0);
}

// Mensaje para mostrar en pantalla a partir de cualquier error.
export function handleApiError(error: unknown): string {
  return toApiError(error).message;
}
