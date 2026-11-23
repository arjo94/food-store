export type Rol = "user" | "admin";

// Respuesta de UserPublic (GET /auth/me, POST /auth/register y listado de usuarios).
export interface UserPublic {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
  disabled: boolean;
  created_at: string;
}

// Datos de la sesión que guarda el authStore (nunca el token).
export interface UsuarioSesion {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export interface MensajeResponse {
  message: string;
}
