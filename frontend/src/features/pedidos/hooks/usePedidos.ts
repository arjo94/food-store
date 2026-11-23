import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";
import { cambiarEstadoPedido, cancelarPedido, crearPedido, getPedido, getPedidos, getResumenPedidos } from "../api/pedidos";
import type { EstadoPedido, FiltrosPedidos, Pedido } from "../types/pedido.types";

const ETIQUETA_ESTADO: Record<EstadoPedido, string> = {
  PENDIENTE: "pendiente",
  EN_PREPARACION: "en preparación",
  ENTREGADO: "entregado",
  CANCELADO: "cancelado",
};

export const pedidosKeys = {
  all: ["pedidos"] as const,
  list: (filtros: FiltrosPedidos) => ["pedidos", "lista", filtros] as const,
  detalle: (id: number) => ["pedidos", "detalle", id] as const,
  resumen: ["pedidos", "resumen"] as const,
};

// Un cambio en un pedido afecta a los listados, al resumen y al stock del catálogo.
const invalidarPedidosYStock = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: pedidosKeys.all });
  await queryClient.invalidateQueries({ queryKey: ["productos"] });
};

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({ queryKey: pedidosKeys.list(filtros), queryFn: () => getPedidos(filtros), placeholderData: keepPreviousData });
}

export function usePedido(id: number | null) {
  return useQuery({
    queryKey: pedidosKeys.detalle(id ?? 0),
    queryFn: () => getPedido(id ?? 0),
    enabled: id !== null,
  });
}

export function useResumenPedidos() {
  return useQuery({ queryKey: pedidosKeys.resumen, queryFn: getResumenPedidos });
}

export function useCrearPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearPedido,
    onSuccess: () => invalidarPedidosYStock(queryClient),
  });
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();
  const notificar = useNotificationStore((s) => s.showNotification);
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: async (p: Pedido) => {
      await invalidarPedidosYStock(queryClient);
      notificar(
        p.estado === "CANCELADO"
          ? `Pedido #${p.id} cancelado: se restituyó el stock`
          : `Pedido #${p.id} pasó a ${ETIQUETA_ESTADO[p.estado]}`,
      );
    },
    onError: (error) => notificar(handleApiError(error), "error"),
  });
}

export function useCancelarPedido() {
  const queryClient = useQueryClient();
  const notificar = useNotificationStore((s) => s.showNotification);
  return useMutation({
    mutationFn: cancelarPedido,
    onSuccess: async (p: Pedido) => {
      await invalidarPedidosYStock(queryClient);
      notificar(`Pedido #${p.id} cancelado`);
    },
    onError: (error) => notificar(handleApiError(error), "error"),
  });
}
