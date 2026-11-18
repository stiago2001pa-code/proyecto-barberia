"use client"

import { useMemo, useState, type FormEvent } from "react"
import {
  CalendarDays,
  Clock3,
  Gift,
  MapPin,
  Scissors,
  UserRound,
} from "lucide-react"
import { AppointmentTable } from "@/components/appointment-table"
import { BookingWizard } from "@/components/booking-wizard"
import { DashboardLayout, type DashboardNavItem } from "@/components/dashboard-layout"
import { FormInput } from "@/components/form-controls"
import { MetricCard } from "@/components/metric-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import type {
  Barbero,
  Barberia,
  Cita,
  CitaCreate,
  Cliente,
  Horario,
  Servicio,
  UsuarioAuth,
} from "@/lib/api"
import { formatCurrency, formatDateLong, formatTime, todayKey } from "@/lib/format"

interface ClientPanelProps {
  user: UsuarioAuth
  initialSection?: string
  barberias: Barberia[]
  barberos: Barbero[]
  servicios: Servicio[]
  horarios: Horario[]
  citas: Cita[]
  clientes: Cliente[]
  onCreateAppointment: (appointment: CitaCreate) => void
  onUpdateProfile: (changes: { nombre: string; telefono: string }) => void
}

const nav: DashboardNavItem[] = [
  { value: "overview", label: "Resumen", icon: Gift },
  { value: "appointments", label: "Mis citas", icon: CalendarDays },
  { value: "booking", label: "Nueva cita", icon: Scissors },
  { value: "profile", label: "Mi perfil", icon: UserRound },
]

export function ClientPanel({
  user,
  initialSection = "overview",
  barberias,
  barberos,
  servicios,
  horarios,
  citas,
  clientes,
  onCreateAppointment,
  onUpdateProfile,
}: ClientPanelProps) {
  const [active, setActive] = useState(initialSection)
  const [name, setName] = useState(user.nombre)
  const [phone, setPhone] = useState(user.telefono)
  const clientId = user.id_cliente ?? 201
  const clientAppointments = useMemo(
    () => citas.filter((cita) => cita.id_cliente === clientId).sort((a, b) => `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`)),
    [citas, clientId],
  )
  const upcoming = clientAppointments.filter(
    (cita) => cita.fecha >= todayKey() && ["Pendiente", "Confirmada"].includes(cita.estado),
  )
  const history = clientAppointments.filter((cita) => !upcoming.some((item) => item.id_cita === cita.id_cita))
  const nextAppointment = upcoming[0]
  const upcomingService = nextAppointment ? servicios.find((item) => item.id_servicio === nextAppointment.id_servicio) : undefined
  const upcomingBarber = nextAppointment ? barberos.find((item) => item.id_barbero === nextAppointment.id_barbero) : undefined
  const upcomingBranch = nextAppointment ? barberias.find((item) => item.id_barberia === nextAppointment.id_barberia) : undefined

  const title = active === "booking" ? "Nueva reserva" :
    active === "appointments" ? "Mis citas" :
      active === "profile" ? "Mi perfil" : "Hola, " + user.nombre.split(" ")[0]
  const description = active === "booking" ? "Escoge sede, servicio, barbero y un horario que te funcione." :
    active === "appointments" ? "Consulta tus próximas visitas y el historial de tus rituales." :
      active === "profile" ? "Mantén tus datos al día para que podamos atenderte mejor." :
        "Tu próxima visita está a un par de clics. Nosotros ponemos el café."

  function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onUpdateProfile({ nombre: name.trim(), telefono: phone.trim() })
  }

  function handleCreateAppointment(appointment: CitaCreate) {
    onCreateAppointment(appointment)
    setActive("appointments")
  }

  return (
    <DashboardLayout
      role="Cliente"
      name={user.nombre}
      nav={nav}
      active={active}
      onNavigate={setActive}
      title={title}
      description={description}
      headerAction={active !== "booking" ? (
        <Button onClick={() => setActive("booking")}>
          <Scissors data-icon="inline-start" />
          Reservar cita
        </Button>
      ) : undefined}
    >
      {active === "overview" ? (
        <div className="flex flex-col gap-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Próximas citas" value={upcoming.length} detail="Reservas por venir" icon={CalendarDays} />
            <MetricCard label="Visitas realizadas" value={history.filter((cita) => cita.estado === "Atendida").length} detail="Tu historial Navaja" icon={Scissors} />
            <MetricCard label="Cliente desde" value="2025" detail="Gracias por volver" icon={Gift} />
          </div>

          {nextAppointment ? (
            <Card className="gap-0 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-card to-card">
              <CardHeader className="flex flex-row items-start justify-between gap-4 p-5 sm:p-7">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-primary">TU PRÓXIMA VISITA</p>
                  <CardTitle className="mt-2 font-display text-2xl font-normal sm:text-3xl">{upcomingService?.nombre ?? "Tu cita en Navaja"}</CardTitle>
                </div>
                <StatusBadge status={nextAppointment.estado} />
              </CardHeader>
              <CardContent className="grid gap-4 border-t border-white/8 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-4">
                <Detail icon={CalendarDays} label="Fecha" value={formatDateLong(nextAppointment.fecha)} />
                <Detail icon={Clock3} label="Hora" value={formatTime(nextAppointment.hora)} />
                <Detail icon={UserRound} label="Barbero" value={upcomingBarber?.barbero_nombre ?? "Por confirmar"} />
                <Detail icon={MapPin} label="Sede" value={upcomingBranch?.nombre.replace("Navaja · ", "") ?? "Navaja"} />
              </CardContent>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 px-5 py-4 sm:px-7">
                <p className="text-sm text-muted-foreground">{upcomingService ? formatCurrency(upcomingService.precio) : ""} · Te esperamos con un café.</p>
                <Button variant="ghost" size="sm" onClick={() => setActive("appointments")}>Ver todas mis citas</Button>
              </div>
            </Card>
          ) : (
            <Card className="border-white/8 bg-card/60">
              <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-primary">TE GUARDAMOS UNA SILLA</p>
                  <h2 className="mt-2 font-display text-2xl">Tu siguiente corte empieza aquí.</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Elige sede y horario, y nos encargamos del resto.</p>
                </div>
                <Button onClick={() => setActive("booking")}>Reservar ahora</Button>
              </CardContent>
            </Card>
          )}

          <Card className="gap-0 border-white/8 bg-card/55">
            <CardHeader className="flex flex-row items-center justify-between gap-4 p-5">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">LO QUE VIENE</p>
                <CardTitle className="mt-2 font-display text-xl font-normal">Próximas citas</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActive("appointments")}>Ver historial</Button>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <AppointmentTable
                citas={upcoming.slice(0, 3)}
                clientes={clientes}
                barberos={barberos}
                servicios={servicios}
                barberias={barberias}
                emptyMessage="Todavía no tienes citas próximas."
              />
            </CardContent>
          </Card>
        </div>
      ) : null}

      {active === "appointments" ? (
        <div className="flex flex-col gap-6">
          <Card className="gap-0 border-white/8 bg-card/55">
            <CardHeader className="p-5">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-primary">CALENDARIO</p>
              <CardTitle className="mt-2 font-display text-xl font-normal">Próximas citas <span className="text-sm text-muted-foreground">({upcoming.length})</span></CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <AppointmentTable citas={upcoming} clientes={clientes} barberos={barberos} servicios={servicios} barberias={barberias} emptyMessage="No tienes citas próximas por ahora." />
            </CardContent>
          </Card>
          <Card className="gap-0 border-white/8 bg-card/55">
            <CardHeader className="p-5">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">TU HISTORIAL</p>
              <CardTitle className="mt-2 font-display text-xl font-normal">Visitas anteriores <span className="text-sm text-muted-foreground">({history.length})</span></CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <AppointmentTable citas={[...history].reverse()} clientes={clientes} barberos={barberos} servicios={servicios} barberias={barberias} emptyMessage="Cuando tengas una visita, aparecerá aquí." />
            </CardContent>
          </Card>
        </div>
      ) : null}

      {active === "booking" ? (
        <BookingWizard
          barberias={barberias}
          barberos={barberos}
          servicios={servicios}
          horarios={horarios}
          citas={citas}
          clientId={clientId}
          onComplete={handleCreateAppointment}
          onCancel={() => setActive("overview")}
        />
      ) : null}

      {active === "profile" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="gap-0 border-white/8 bg-card/55">
            <CardHeader className="p-5 sm:p-6">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-primary">DATOS DE CUENTA</p>
              <CardTitle className="mt-2 font-display text-xl font-normal">Información personal</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-6 sm:px-6">
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                <FieldGroup className="gap-4">
                  <FormInput id="client-name" label="Nombre completo" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} />
                  <FormInput id="client-email" label="Correo electrónico" type="email" autoComplete="email" value={user.correo} disabled />
                  <FormInput id="client-phone" label="Teléfono" type="tel" autoComplete="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} />
                </FieldGroup>
                <Button type="submit" className="w-fit">Guardar cambios</Button>
              </form>
            </CardContent>
          </Card>
          <Card className="h-fit gap-0 border-white/8 bg-card/55">
            <CardContent className="p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserRound className="size-4" /></span>
              <h3 className="mt-4 font-display text-xl">Tu perfil Navaja</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Tus datos se usan para confirmar reservas y compartir contigo la información de cada visita.</p>
              <div className="mt-5 border-t border-white/8 pt-4 text-xs text-muted-foreground">
                <p>Miembro desde</p>
                <p className="mt-1 text-sm text-foreground">{clientes.find((cliente) => cliente.id_cliente === clientId)?.fecha_registro ?? "Hoy"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </DashboardLayout>
  )
}

function Detail({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm capitalize text-foreground">{value}</p>
      </div>
    </div>
  )
}
