const formatoPrecio = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });
const formatoFecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" });

export const formatPrecio = (valor: number): string => formatoPrecio.format(valor);

export const formatFecha = (iso: string): string => formatoFecha.format(new Date(iso));
