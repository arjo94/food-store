import { create } from "zustand";

type TipoAviso = "success" | "error";

interface NotificationState {
  message: string;
  type: TipoAviso;
  visible: boolean;
  id: number;
  showNotification: (message: string, type?: TipoAviso) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  message: "",
  type: "success",
  visible: false,
  id: 0,
  showNotification: (message, type = "success") => set((s) => ({ message, type, visible: true, id: s.id + 1 })),
  hideNotification: () => set({ visible: false }),
}));
