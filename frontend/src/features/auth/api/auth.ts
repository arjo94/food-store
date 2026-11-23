import { api } from "@/shared/api/axiosInstance";
import type { LoginInput, MensajeResponse, RegisterInput, UserPublic } from "../types/auth.types";

export const login = async ({ username, password }: LoginInput) => {
  // Formulario OAuth2: application/x-www-form-urlencoded con username y password.
  const form = new URLSearchParams({ username, password });
  return (
    await api.post<MensajeResponse>("/auth/token", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
  ).data;
};

export const logout = async () => (await api.post<MensajeResponse>("/auth/logout")).data;

export const getMe = async () => (await api.get<UserPublic>("/auth/me")).data;

export const register = async (data: RegisterInput) => (await api.post<UserPublic>("/auth/register", data)).data;
