import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/shared/components/DataTable";
import Button from "@/shared/ui/Button";
import type { Usuario } from "../types/usuario.types";

interface UsuariosTableProps {
  usuarios: Usuario[];
  idSesion: number | undefined;
  ocupado: boolean;
  onCambiarEstado: (u: Usuario) => void;
}

const col = createColumnHelper<Usuario>();

export default function UsuariosTable({ usuarios, idSesion, ocupado, onCambiarEstado }: UsuariosTableProps) {
  const columns = useMemo(
    () => [
      col.accessor("username", { header: "Usuario" }),
      col.accessor("full_name", { header: "Nombre" }),
      col.accessor("email", { header: "Email" }),
      col.accessor("role", {
        header: "Rol",
        cell: (info) => (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${info.getValue() === "admin" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"}`}>
            {info.getValue()}
          </span>
        ),
      }),
      col.accessor("disabled", {
        header: "Estado",
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Desactivado</span>
          ) : (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Activo</span>
          ),
      }),
      col.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const u = row.original;
          if (u.disabled) {
            return (
              <Button variant="success" size="sm" onClick={() => onCambiarEstado(u)} disabled={ocupado}>
                Activar
              </Button>
            );
          }
          // El botón Desactivar no se muestra en la fila del usuario de la sesión.
          if (u.id === idSesion) return <span className="text-xs text-slate-400">Sesión actual</span>;
          return (
            <Button variant="danger" size="sm" onClick={() => onCambiarEstado(u)} disabled={ocupado}>
              Desactivar
            </Button>
          );
        },
      }),
    ],
    [idSesion, ocupado, onCambiarEstado],
  );

  return <DataTable data={usuarios} columns={columns} />;
}
