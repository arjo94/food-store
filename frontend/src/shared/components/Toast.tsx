import { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";

// Aviso global de altas, bajas, ediciones y errores; se oculta a los 3 segundos.
export default function Toast() {
  const { message, type, visible, id, hideNotification } = useNotificationStore();

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(hideNotification, 3000);
    return () => window.clearTimeout(timer);
  }, [visible, id, hideNotification]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-4 bottom-4 z-[60] flex max-w-sm items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      <span>{message}</span>
      <button type="button" onClick={hideNotification} aria-label="Cerrar aviso" className="opacity-80 hover:opacity-100">
        ✕
      </button>
    </div>
  );
}
