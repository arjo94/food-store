import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm " +
  "focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200";

export const labelClass = "mb-1 block text-sm font-medium text-slate-700";

interface CampoProps {
  id: string;
  label: string;
  error?: ReactNode;
  children: ReactNode;
}

// Envoltorio de un campo de formulario: etiqueta, control y mensaje de error.
export function Campo({ id, label, error, children }: CampoProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {error}
    </div>
  );
}

export default function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${inputClass} ${className}`} {...props} />;
}

export function TextArea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClass} ${className}`} {...props} />;
}
