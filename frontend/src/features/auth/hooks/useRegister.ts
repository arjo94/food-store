import { useMutation } from "@tanstack/react-query";
import { register } from "../api/auth";

// Registro público (POST /auth/register).
export function useRegister() {
  return useMutation({ mutationFn: register });
}
