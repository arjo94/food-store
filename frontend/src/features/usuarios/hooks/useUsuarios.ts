import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";
import { activarUsuario, desactivarUsuario, getUsuarios } from "../api/usuarios";
import type { Usuario } from "../types/usuario.types";

export const usuariosKeys = { all: ["usuarios"] as const };

export function useUsuarios() {
  return useQuery({ queryKey: usuariosKeys.all, queryFn: getUsuarios });
}

// Activar y desactivar usuarios (admin), con invalidación del listado.
export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient();
  const notificar = useNotificationStore((s) => s.showNotification);

  return useMutation({
    mutationFn: (u: Usuario) => (u.disabled ? activarUsuario(u.id) : desactivarUsuario(u.id)),
    onSuccess: async (u) => {
      await queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
      notificar(`Usuario ${u.username} ${u.disabled ? "desactivado" : "activado"}`);
    },
    onError: (error) => notificar(handleApiError(error), "error"),
  });
}
