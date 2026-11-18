import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
}

const statusStyles: Record<string, string> = {
  Activa: "border-success/25 bg-success/10 text-success",
  Activo: "border-success/25 bg-success/10 text-success",
  Disponible: "border-success/25 bg-success/10 text-success",
  Confirmada: "border-info/25 bg-info/10 text-info",
  Atendida: "border-success/25 bg-success/10 text-success",
  Pendiente: "border-warning/25 bg-warning/10 text-warning",
  Inactiva: "border-muted-foreground/25 bg-muted/40 text-muted-foreground",
  Inactivo: "border-muted-foreground/25 bg-muted/40 text-muted-foreground",
  "No disponible": "border-muted-foreground/25 bg-muted/40 text-muted-foreground",
  Cancelada: "border-destructive/25 bg-destructive/10 text-destructive",
  "No asistio": "border-destructive/25 bg-destructive/10 text-destructive",
}

const statusLabels: Record<string, string> = {
  "No asistio": "No asistió",
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={statusStyles[status] ?? "border-border bg-muted/40 text-muted-foreground"}>
      <span className="mr-1.5 size-1.5 rounded-full bg-current" aria-hidden="true" />
      {statusLabels[status] ?? status}
    </Badge>
  )
}
