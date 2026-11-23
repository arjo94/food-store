import { useState } from "react";

interface ProductoImagenProps {
  src: string | null;
  alt: string;
  categoria?: string;
  className?: string;
}

const EMOJIS: Record<string, string> = {
  hamburguesas: "🍔",
  pizzas: "🍕",
  empanadas: "🥟",
  bebidas: "🥤",
  postres: "🍮",
};

// Muestra la imagen por URL o un marcador si no hay imagen o no carga.
export default function ProductoImagen({ src, alt, categoria, className = "" }: ProductoImagenProps) {
  const [fallo, setFallo] = useState(false);
  if (!src || fallo) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 text-4xl ${className}`} aria-label={alt}>
        {EMOJIS[categoria?.toLowerCase() ?? ""] ?? "🍽️"}
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFallo(true)} className={`object-cover ${className}`} />;
}
