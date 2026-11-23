import Button from "@/shared/ui/Button";

interface EstadoErrorProps {
  mensaje: string;
  onReintentar?: () => void;
}

export default function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
      <span>{mensaje}</span>
      {onReintentar && (
        <Button variant="danger" size="sm" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
