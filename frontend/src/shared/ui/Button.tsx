import type { ButtonHTMLAttributes } from "react";

type Variante = "primary" | "secondary" | "danger" | "success" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variante;
  size?: "sm" | "md";
}

const VARIANTES: Record<Variante, string> = {
  primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-sm",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 shadow-sm",
  danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  success: "border border-green-200 bg-white text-green-700 hover:bg-green-50",
  ghost: "text-slate-600 hover:bg-slate-100",
};

const TAMANIOS = { sm: "px-3 py-1 text-xs", md: "px-4 py-2 text-sm" };

export default function Button({ variant = "primary", size = "md", className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variant]} ${TAMANIOS[size]} ${className}`}
      {...props}
    />
  );
}
