import { useEffect } from "react";
import AppRouter from "@/routes/AppRouter";
import { useAuthStore } from "@/store/authStore";

// Confirma la sesión con /auth/me al montar la aplicación y renderiza el router.
export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return <AppRouter />;
}
