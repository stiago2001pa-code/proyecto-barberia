"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Scissors,
  UserRound,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { FormInput, FormTextarea } from "@/components/form-controls"
import { StatusBadge } from "@/components/status-badge"
import type { Barbero, Barberia, Cita, CitaCreate, Horario, Servicio } from "@/lib/api"
import { formatCurrency, formatDateLong, formatTime, makeTimeSlots, todayKey, weekdayForDate } from "@/lib/format"

interface BookingWizardProps {
  barberias: Barberia[]
  barberos: Barbero[]
  servicios: Servicio[]
  horarios: Horario[]
  citas: Cita[]
  clientId: number
  onComplete: (appointment: CitaCreate) => void
  onCancel?: () => void
}

const steps = [
  { label: "Sede", icon: MapPin },
  { label: "Servicio", icon: Scissors },
  { label: "Barbero", icon: UserRound },
  { label: "Horario", icon: CalendarDays },
]

export function BookingWizard({
  barberias,
  barberos,
  servicios,
  horarios,
  citas,
  clientId,
  onComplete,
  onCancel,
}: BookingWizardProps) {
  const [step, setStep] = useState(1)
  const [idBarberia, setIdBarberia] = useState<number | null>(null)
  const [idServicio, setIdServicio] = useState<number | null>(null)
  const [idBarbero, setIdBarbero] = useState<number | null>(null)
  const [fecha, setFecha] = useState(todayKey())
  const [hora, setHora] = useState("")
  const [observaciones, setObservaciones] = useState("")

  const activeBranches = barberias.filter((barberia) => barberia.estado === "Activa")
  const selectedBranch = barberias.find((barberia) => barberia.id_barberia === idBarberia)
  const selectedService = servicios.find((servicio) => servicio.id_servicio === idServicio)
  const selectedBarber = barberos.find((barbero) => barbero.id_barbero === idBarbero)
  const branchServices = servicios.filter((servicio) => servicio.id_barberia === idBarberia && servicio.estado === "Activo")
  const branchBarbers = barberos.filter((barbero) => barbero.id_barberia === idBarberia && barbero.estado === "Disponible")
  const schedule = horarios.find(
    (horario) => horario.id_barberia === idBarberia && horario.dia_semana === weekdayForDate(fecha),
  )
  const availableSlots = useMemo(() => {
    const slots = makeTimeSlots(schedule)
    return slots.filter((slot) =>
      !citas.some(
        (cita) =>
          cita.id_barbero === idBarbero &&
          cita.fecha === fecha &&
          cita.hora === slot &&
          cita.estado !== "Cancelada",
      ),
    )
  }, [citas, fecha, idBarbero, schedule])

  const canContinue =
    (step === 1 && idBarberia !== null) ||
    (step === 2 && idServicio !== null) ||
    (step === 3 && idBarbero !== null) ||
    (step === 4 && Boolean(fecha && hora))

  function handleBranchChange(id: number) {
    setIdBarberia(id)
    setIdServicio(null)
    setIdBarbero(null)
    setHora("")
  }

  function handleDateChange(value: string) {
    setFecha(value)
    setHora("")
  }

  function continueStep() {
    if (!canContinue) return
    if (step < 4) {
      setStep((current) => current + 1)
      return
    }
    if (idBarberia === null || idServicio === null || idBarbero === null || !hora) return
    onComplete({
      id_barberia: idBarberia,
      id_cliente: clientId,
      id_barbero: idBarbero,
      id_servicio: idServicio,
      fecha,
      hora,
      observaciones: observaciones.trim() || null,
    })
  }

  function goBack() {
    if (step > 1) setStep((current) => current - 1)
    else onCancel?.()
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="gap-0 border-white/8 bg-card/60">
        <CardContent className="p-4 sm:p-6">
          <ol className="grid grid-cols-4 gap-2" aria-label="Pasos para reservar">
            {steps.map((item, index) => {
              const position = index + 1
              const active = step === position
              const complete = step > position
              return (
                <li key={item.label} className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-xs transition-colors ${
                        complete ? "border-primary bg-primary text-primary-foreground" :
                          active ? "border-primary/60 bg-primary/10 text-primary" :
                            "border-white/12 bg-background/50 text-muted-foreground"
                      }`}
                    >
                      {complete ? <Check className="size-4" /> : <item.icon className="size-4" />}
                    </span>
                    <span className={`hidden truncate text-xs sm:block ${active ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {item.label}
                    </span>
                  </div>
                  <div className={`mt-3 h-0.5 rounded-full ${position <= step ? "bg-primary/70" : "bg-white/8"}`} />
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="gap-0 border-white/8 bg-card/60">
          <CardContent className="p-5 sm:p-7">
            <div className="mb-6">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-primary">PASO 0{step} DE 04</p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl">
                {step === 1 ? "¿En qué sede nos vemos?" :
                  step === 2 ? "Elige tu servicio" :
                    step === 3 ? "¿Con quién te gustaría?" : "Elige día y hora"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {step === 1 ? "Selecciona la barbería que te quede mejor." :
                  step === 2 ? "Cada servicio incluye el tiempo y la atención que merece." :
                    step === 3 ? "Conoce quién va a cuidar de cada detalle." : "Los horarios disponibles respetan la jornada de la sede."}
              </p>
            </div>

            {step === 1 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {activeBranches.map((barberia) => {
                  const selected = idBarberia === barberia.id_barberia
                  const todaySchedule = horarios.find(
                    (horario) => horario.id_barberia === barberia.id_barberia && horario.dia_semana === weekdayForDate(todayKey()),
                  )
                  return (
                    <button
                      key={barberia.id_barberia}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => handleBranchChange(barberia.id_barberia)}
                      className={`rounded-2xl border p-4 text-left transition-colors ${selected ? "border-primary/60 bg-primary/8" : "border-white/8 bg-background/40 hover:border-white/20"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className={`flex size-10 items-center justify-center rounded-xl ${selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                          <MapPin className="size-4" />
                        </span>
                        {selected ? <Check className="size-4 text-primary" /> : null}
                      </div>
                      <p className="mt-4 font-medium text-foreground">{barberia.nombre}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{barberia.direccion}</p>
                      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock3 className="size-3.5 text-primary" />
                        {todaySchedule ? `${formatTime(todaySchedule.hora_apertura)} – ${formatTime(todaySchedule.hora_cierre)}` : "Consulta sus horarios"}
                      </p>
                    </button>
                  )
                })}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {branchServices.map((servicio) => {
                  const selected = idServicio === servicio.id_servicio
                  return (
                    <button
                      key={servicio.id_servicio}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setIdServicio(servicio.id_servicio)}
                      className={`rounded-2xl border p-4 text-left transition-colors ${selected ? "border-primary/60 bg-primary/8" : "border-white/8 bg-background/40 hover:border-white/20"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className={`flex size-10 items-center justify-center rounded-xl ${selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                          <Scissors className="size-4" />
                        </span>
                        {selected ? <Check className="size-4 text-primary" /> : <span className="text-sm font-medium text-primary">{formatCurrency(servicio.precio)}</span>}
                      </div>
                      <p className="mt-4 font-medium text-foreground">{servicio.nombre}</p>
                      <p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">{servicio.descripcion}</p>
                      <p className="mt-3 text-xs text-muted-foreground">{servicio.duracion_minutos} min · {formatCurrency(servicio.precio)}</p>
                    </button>
                  )
                })}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {branchBarbers.map((barbero) => {
                  const selected = idBarbero === barbero.id_barbero
                  return (
                    <button
                      key={barbero.id_barbero}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setIdBarbero(barbero.id_barbero)}
                      className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${selected ? "border-primary/60 bg-primary/8" : "border-white/8 bg-background/40 hover:border-white/20"}`}
                    >
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/8 font-display text-lg text-primary">
                        {barbero.barbero_nombre.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-foreground">{barbero.barbero_nombre}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{barbero.especialidad}</span>
                      </span>
                      {selected ? <Check className="size-4 text-primary" /> : null}
                    </button>
                  )
                })}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="flex flex-col gap-5">
                <FieldGroup className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    id="booking-date"
                    label="Fecha de la cita"
                    type="date"
                    min={todayKey()}
                    value={fecha}
                    onChange={(event) => handleDateChange(event.target.value)}
                    required
                  />
                  <div className="rounded-xl border border-white/8 bg-background/45 px-4 py-3">
                    <p className="text-xs text-muted-foreground">Horario de la sede</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {schedule ? `${formatTime(schedule.hora_apertura)} – ${formatTime(schedule.hora_cierre)}` : "Cerrado este día"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{weekdayForDate(fecha)}</p>
                  </div>
                </FieldGroup>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">Horas disponibles</p>
                    {schedule ? <Badge variant="outline" className="border-white/10 text-muted-foreground">Intervalos de 30 min</Badge> : null}
                  </div>
                  {availableSlots.length ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {availableSlots.map((slot) => {
                        const selected = hora === slot
                        return (
                          <button
                            key={slot}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setHora(slot)}
                            className={`rounded-lg border px-2 py-2.5 text-sm tabular-nums transition-colors ${selected ? "border-primary/60 bg-primary/12 text-primary" : "border-white/8 bg-background/45 text-muted-foreground hover:border-white/20 hover:text-foreground"}`}
                          >
                            {formatTime(slot)}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/12 px-4 py-6 text-center text-sm text-muted-foreground">
                      No hay horarios disponibles para esta fecha.
                    </div>
                  )}
                </div>

                <FormTextarea
                  id="booking-notes"
                  label="Notas para tu barbero"
                  placeholder="Cuéntanos si tienes alguna preferencia (opcional)."
                  value={observaciones}
                  onChange={(event) => setObservaciones(event.target.value)}
                  maxLength={500}
                />
              </div>
            ) : null}

            <div className="mt-7 flex items-center justify-between gap-3 border-t border-white/8 pt-5">
              <Button type="button" variant="ghost" onClick={goBack}>
                <ArrowLeft data-icon="inline-start" />
                {step === 1 ? "Cancelar" : "Atrás"}
              </Button>
              <Button type="button" onClick={continueStep} disabled={!canContinue}>
                {step === 4 ? "Confirmar cita" : "Continuar"}
                {step === 4 ? <Check data-icon="inline-end" /> : <ArrowRight data-icon="inline-end" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit gap-0 border-white/8 bg-card/45 xl:sticky xl:top-28">
          <CardContent className="p-5">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">TU RESERVA</p>
            <h3 className="mt-2 font-display text-xl">En un vistazo</h3>
            <div className="mt-5 flex flex-col gap-4">
              <SummaryRow icon={MapPin} label="Sede" value={selectedBranch?.nombre.replace("Navaja · ", "") ?? "Por elegir"} />
              <SummaryRow icon={Scissors} label="Servicio" value={selectedService?.nombre ?? "Por elegir"} />
              <SummaryRow icon={UserRound} label="Barbero" value={selectedBarber?.barbero_nombre ?? "Por elegir"} />
              <SummaryRow icon={CalendarDays} label="Día y hora" value={hora ? `${formatDateLong(fecha)}, ${formatTime(hora)}` : "Por elegir"} />
            </div>
            {selectedService ? (
              <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                <span className="text-xs text-muted-foreground">Total estimado</span>
                <span className="font-medium text-primary">{formatCurrency(selectedService.precio)}</span>
              </div>
            ) : null}
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              La cita se registra como pendiente y el equipo podrá confirmarla desde su agenda.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}
