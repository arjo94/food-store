import Card from "@/shared/ui/Card";

interface ResumenCardProps {
  titulo: string;
  valor: string | number;
  icono: string;
  color: string;
}

export default function ResumenCard({ titulo, valor, icono, color }: ResumenCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${color}`} aria-hidden="true">
        {icono}
      </span>
      <div>
        <p className="text-sm text-slate-500">{titulo}</p>
        <p className="text-2xl font-bold text-slate-900">{valor}</p>
      </div>
    </Card>
  );
}
