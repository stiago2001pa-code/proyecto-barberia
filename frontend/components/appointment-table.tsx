import { CalendarDays } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Barbero, Barberia, Cita, Cliente, Servicio } from "@/lib/api"
import { formatDate, formatTime } from "@/lib/format"

interface AppointmentTableProps {
  citas: Cita[]
  clientes: Cliente[]
  barberos: Barbero[]
  servicios: Servicio[]
  barberias: Barberia[]
  showClient?: boolean
  showBranch?: boolean
  emptyMessage?: string
}

export function AppointmentTable({
  citas,
  clientes,
  barberos,
  servicios,
  barberias,
  showClient = false,
  showBranch = false,
  emptyMessage = "No hay citas para mostrar.",
}: AppointmentTableProps) {
  const columnCount = 4 + Number(showClient) + Number(showBranch)

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-background/30">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/8 hover:bg-transparent">
              <TableHead>Fecha y hora</TableHead>
              {showClient ? <TableHead>Cliente</TableHead> : null}
              <TableHead>Servicio</TableHead>
              <TableHead>Barbero</TableHead>
              {showBranch ? <TableHead>Sede</TableHead> : null}
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {citas.length ? citas.map((cita) => {
              const cliente = clientes.find((item) => item.id_cliente === cita.id_cliente)
              const barbero = barberos.find((item) => item.id_barbero === cita.id_barbero)
              const servicio = servicios.find((item) => item.id_servicio === cita.id_servicio)
              const barberia = barberias.find((item) => item.id_barberia === cita.id_barberia)
              return (
                <TableRow key={cita.id_cita} className="border-white/6">
                  <TableCell className="min-w-32">
                    <span className="block font-medium text-foreground">{formatDate(cita.fecha, { weekday: "short", day: "numeric", month: "short" })}</span>
                    <span className="mt-1 block text-xs tabular-nums text-muted-foreground">{formatTime(cita.hora)}</span>
                  </TableCell>
                  {showClient ? (
                    <TableCell className="min-w-36">
                      <span className="block text-foreground">{cliente?.nombre ?? "Cliente"}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{cliente?.telefono ?? ""}</span>
                    </TableCell>
                  ) : null}
                  <TableCell className="min-w-36 text-foreground">{servicio?.nombre ?? "Servicio"}</TableCell>
                  <TableCell className="min-w-32 text-muted-foreground">{barbero?.barbero_nombre ?? "Sin asignar"}</TableCell>
                  {showBranch ? <TableCell className="min-w-36 text-muted-foreground">{barberia?.nombre.replace("Navaja · ", "") ?? "Sede"}</TableCell> : null}
                  <TableCell><StatusBadge status={cita.estado} /></TableCell>
                </TableRow>
              )
            }) : (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-36 text-center">
                  <div className="mx-auto flex max-w-xs flex-col items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-5 text-primary/70" />
                    <span className="text-sm">{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
