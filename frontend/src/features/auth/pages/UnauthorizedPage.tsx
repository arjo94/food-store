import { Link } from "react-router-dom";
import Card from "@/shared/ui/Card";

export default function UnauthorizedPage() {
  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <p className="text-4xl font-bold text-red-500">403</p>
      <h1 className="mt-2 text-xl font-bold text-slate-900">Sin permiso</h1>
      <p className="mt-2 text-sm text-slate-500">No tenés permisos para ver esta página.</p>
      <Link to="/" className="mt-6 inline-block rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
        Volver al inicio
      </Link>
    </Card>
  );
}
