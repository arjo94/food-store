import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "@/features/auth/api/auth";
import type { UserPublic, UsuarioSesion } from "@/features/auth/types/auth.types";

interface AuthState {
  usuario: UsuarioSesion | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearSession: () => void;
}

const aSesion = ({ id, username, full_name, email, role }: UserPublic): UsuarioSesion => ({
  id,
  username,
  full_name,
  email,
  role,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      // true hasta que checkSession confirma la sesión con /auth/me
      cargando: true,

      login: async (username, password) => {
        await authApi.login({ username, password });
        const me = await authApi.getMe();
        set({ usuario: aSesion(me), cargando: false });
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({ usuario: null, cargando: false });
        }
      },

      checkSession: async () => {
        try {
          const me = await authApi.getMe();
          set({ usuario: aSesion(me), cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      clearSession: () => set({ usuario: null, cargando: false }),
    }),
    {
      name: "foodstore-auth",
      // Solo se guardan los datos del usuario: nunca el token ni el indicador de carga.
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);
