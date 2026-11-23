import { Outlet, useLocation } from "react-router-dom";
import Toast from "@/shared/components/Toast";
import AdminNav from "./AdminNav";
import Navbar from "./Navbar";

// Reúne la Navbar y el contenido de la ruta.
export default function MainLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {pathname.startsWith("/admin") && <AdminNav />}
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
