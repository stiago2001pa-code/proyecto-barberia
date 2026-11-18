"use client"

import { useMemo, useState, type FormEvent } from "react"
import {
  CalendarDays,
  Clock3,
  Scissors,
  Settings2,
  UserRound,
  UsersRound,
} from "lucide-react"
import { AppointmentTable } from "@/components/appointment-table"
import { DashboardLayout, type DashboardNavItem } from "@/components/dashboard-layout"
import { FormInput } from "@/components/form-controls"
import { MetricCard } from "@/components/metric-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import type {
  Barbero,
  Barberia,
  Cita,
  Cliente,
  EstadoCita,
  Servicio,
  UsuarioAuth,
  BarberoUpdate,
} from "@/lib/api"
import { formatDate, formatTime, todayKey } from "@/lib/format"

interface BarberPanelProps {
  user: UsuarioAuth
  barberias: Barberia[]
  barberos: Barbero[]
  servicios: Servicio[]
  citas: Cita[]
  clientes: Cliente[]
  onUpdateBarber: (id: number, changes: BarberoUpdate) => void
  onUpdateAppointment: (id: number, estado: EstadoCita) => void
}

const nav: DashboardNavItem[] = [
  { value: "overview", label: "Resumen", icon: Settings2 },
  { value: "schedule", label: "Mi agenda", icon: CalendarDays },
  { value: "clients", label: "Clientes", icon: UsersRound },
  { value: "profile", label: "Mi perfil", icon: UserRound },
]

export function BarberPanel({
  user,
  barberias,
  barberos,
  servicios,
  citas,
  clientes,
  onUpdateBarber,
  onUpdateAppointment,
}: BarberPanelProps) {
  const [active, setActive] = useState("overview")
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [specialty, setSpecialty] = useState("")
  const barbero = barberos.find((item) => item.id_barbero === user.id_barbero) ?? barberos.find((item) => item.id_usuario === user.id_usuario)
  const barberoId = barbero?.id_barbero
  const branch = barberias.find((item) => item.id_barberia === barbero?.id_barberia)
  const myAppointments = useMemo(
    () => citas.filter((cita) => cita.id_barbero === barberoId).sort((a, b) => `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`)),
    [barberoId, citas],
  )
  const todayAppointments = myAppointments.filter((cita) => cita.fecha === todayKey() && cita.estado !== "Cancelada")
  const selectedDayAppointments = myAppointments.filter((cita) => cita.fecha === selectedDate && cita.estado !== "Cancelada")
  const title = active === "schedule" ? "Mi agenda" :
    active === "clients" ? "Clientes" :
      active === "profile" ? "Mi perfil" : "Tu día, en orden."
  const description = active === "schedule" ? "Consulta las citas de cada día y actualiza su estado al terminar." :
    active === "clients" ? "Conoce a las personas que vuelven a sentarse en tu silla." :
      active === "profile" ? "Tu especialidad y disponibilidad, siempre al día." :
        "Tu agenda, tus clientes y el ritmo de cada jornada."

  function saveSpecialty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (barbero && specialty.trim()) onUpdateBarber(barbero.id_barbero, { especialidad: specialty.trim() })
  }

  const availabilityAction = barbero ? (
    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-card/55 px-3 py-2">
      <div className="hidden sm:block">
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Disponibilidad</p>
        <div className="mt-1"><StatusBadge status={barbero.estado} /></div>
      </div>
      <Switch
        checked={barbero.estado === "Disponible"}
        onCheckedChange={(checked) => onUpdateBarber(barbero.id_barbero, { estado: checked ? "Disponible" : "No disponible" })}
        aria-label={barbero.estado === "Disponible" ? "Cambiar a no disponible" : "Cambiar a disponible"}
      />
    </div>
  ) : undefined

  return (
    <DashboardLayout
      role="Barbero"
      name={barbero?.barbero_nombre ?? user.nombre}
      nav={nav}
      active={active}
      onNavigate={setActive}
      title={title}
      description={description}
      headerAction={availabilityAction}
    >
      {!barbero ? (
        <Card className="border-white/8 bg-card/60">
          <CardContent className="p-6 text-sm text-muted-foreground">Este usuario todavía no está vinculado a un perfil de barbero.</CardContent>
        </Card>
      ) : null}

      {barbero && active === "overview" ? (
        <div className="flex flex-col gap-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Citas de hoy" value={todayAppointments.length} detail={branch?.nombre.replace("Navaja · ", "") ?? "Sede asignada"} icon={CalendarDays} />
            <MetricCard label="Esta semana" value={myAppointments.filter((cita) => cita.fecha >= todayKey()).length} detail="Próximas reservas" icon={Clock3} />
            <MetricCard label="Atendidas" value={myAppointments.filter((cita) => cita.estado === "Atendida").length} detail="En el historial" icon={Scissors} />
          </div>

          <Card className="gap-0 border-white/8 bg-card/55">
            <CardHeader className="flex flex-row items-center justify-between gap-4 p-5">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-primary">HOY · {formatDate(todayKey(), { weekday: "long", day: "numeric", month: "long" })}</p>
                <CardTitle className="mt-2 font-display text-xl font-normal">Tu agenda de hoy</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActive("schedule")}>Abrir agenda</Button>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <AppointmentTable citas={todayAppointments} clientes={clientes} barberos={barberos} servicios={servicios} barberias={barberias} showClient emptyMessage="No tienes citas programadas para hoy." />
            </CardContent>
          </Card>

          <Card className="gap-0 border-white/8 bg-gradient-to-r from-primary/8 via-card to-card">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-center gap-4">
                <span className="flex size-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary"><Scissors className="size-5" /></span>
                <div>
                  <p className="text-sm font-medium">Tu sede</p>
                  <p className="mt-1 text-xs text-muted-foreground">{branch?.nombre ?? "Sin sede asignada"} · {branch?.direccion ?? ""}</p>
                </div>
              </div>
              <StatusBadge status={barbero.estado} />
            </CardContent>
          </Card>
        </div>
      ) : null}

      {barbero && active === "schedule" ? (
        <div className="flex flex-col gap-5">
          <Card className="gap-0 border-white/8 bg-card/55">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-primary">AGENDA PERSONAL</p>
                <h2 className="mt-2 font-display text-2xl">Citas por día</h2>
                <p className="mt-1 text-sm text-muted-foreground">Marca cada visita como atendida o no asistida.</p>
              </div>
              <div className="w-full sm:max-w-56">
                <FormInput id="barber-date" label="Fecha" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
              </div>
            </CardContent>
          </Card>
          <BarberScheduleTable
            citas={selectedDayAppointments}
            clientes={clientes}
            servicios={servicios}
            onUpdateAppointment={onUpdateAppointment}
          />
        </div>
      ) : null}

      {barbero && active === "clients" ? (
        <Card className="gap-0 border-white/8 bg-card/55">
          <CardHeader className="p-5">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-primary">DIRECTORIO</p>
            <CardTitle className="mt-2 font-display text-xl font-normal">Tus clientes</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="overflow-hidden rounded-xl border border-white/8 bg-background/30">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow className="border-white/8 hover:bg-transparent"><TableHead>Nombre</TableHead><TableHead>Correo</TableHead><TableHead>Teléfono</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {clientes.map((cliente) => (
                      <TableRow key={cliente.id_cliente} className="border-white/6">
                        <TableCell className="font-medium text-foreground">{cliente.nombre}</TableCell>
                        <TableCell className="text-muted-foreground">{cliente.correo}</TableCell>
                        <TableCell className="text-muted-foreground">{cliente.telefono}</TableCell>
                        <TableCell><StatusBadge status={cliente.estado} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {barbero && active === "profile" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="gap-0 border-white/8 bg-card/55">
            <CardHeader className="p-5 sm:p-6">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-primary">TU PERFIL PROFESIONAL</p>
              <CardTitle className="mt-2 font-display text-xl font-normal">Datos del barbero</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-6 sm:px-6">
              <form onSubmit={saveSpecialty} className="flex flex-col gap-5">
                <FieldGroup className="gap-4">
                  <FormInput id="barber-profile-name" label="Nombre" value={barbero.barbero_nombre} disabled />
                  <FormInput id="barber-profile-email" label="Correo electrónico" type="email" value={barbero.barbero_correo} disabled />
                  <FormInput
                    id="barber-specialty"
                    label="Especialidad"
                    value={specialty || barbero.especialidad}
                    onChange={(event) => setSpecialty(event.target.value)}
                    required
                  />
                </FieldGroup>
                <Button type="submit" className="w-fit">Guardar especialidad</Button>
              </form>
            </CardContent>
          </Card>
          <Card className="h-fit gap-0 border-white/8 bg-card/55">
            <CardContent className="p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Settings2 className="size-4" /></span>
              <h3 className="mt-4 font-display text-xl">Disponibilidad</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Al marcarte como no disponible, dejarás de aparecer en el flujo de nuevas reservas.</p>
              <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                <span className="text-xs text-muted-foreground">Estado actual</span>
                <StatusBadge status={barbero.estado} />
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="size-3.5 text-primary" />
                {branch?.nombre ?? "Sede no asignada"}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </DashboardLayout>
  )
}

function BarberScheduleTable({
  citas,
  clientes,
  servicios,
  onUpdateAppointment,
}: {
  citas: Cita[]
  clientes: Cliente[]
  servicios: Servicio[]
  onUpdateAppointment: (id: number, status: EstadoCita) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-background/30">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/8 hover:bg-transparent">
              <TableHead>Hora</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {citas.length ? [...citas].sort((a, b) => a.hora.localeCompare(b.hora)).map((cita) => {
              const cliente = clientes.find((item) => item.id_cliente === cita.id_cliente)
              const servicio = servicios.find((item) => item.id_servicio === cita.id_servicio)
              const mutable = cita.estado === "Pendiente" || cita.estado === "Confirmada"
              return (
                <TableRow key={cita.id_cita} className="border-white/6">
                  <TableCell className="font-medium tabular-nums text-foreground">{formatTime(cita.hora)}</TableCell>
                  <TableCell className="min-w-36">
                    <span className="block text-foreground">{cliente?.nombre ?? "Cliente"}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{cliente?.telefono ?? ""}</span>
                  </TableCell>
                  <TableCell className="min-w-36 text-muted-foreground">{servicio?.nombre ?? "Servicio"}</TableCell>
                  <TableCell><StatusBadge status={cita.estado} /></TableCell>
                  <TableCell>
                    {mutable ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => onUpdateAppointment(cita.id_cita, "Atendida")}>Atendida</Button>
                        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => onUpdateAppointment(cita.id_cita, "No asistio")}>No asistió</Button>
                      </div>
                    ) : <span className="block text-right text-xs text-muted-foreground">Sin acciones</span>}
                  </TableCell>
                </TableRow>
              )
            }) : (
              <TableRow><TableCell colSpan={5} className="h-36 text-center text-sm text-muted-foreground">No hay citas agendadas para este día.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
