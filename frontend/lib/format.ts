import type { DiaSemana, Horario } from "@/lib/api"

export const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function todayKey() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    ...options,
  }).format(new Date(`${value}T12:00:00`))
}

export function formatDateLong(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${value}T12:00:00`))
}

export function formatTime(value: string) {
  return value.slice(0, 5)
}

export function weekdayForDate(value: string): DiaSemana {
  const weekday = new Date(`${value}T12:00:00`).getDay()
  const weekdays: DiaSemana[] = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
  ]
  return weekdays[weekday]
}

export function makeTimeSlots(schedule: Horario | undefined, stepMinutes = 30) {
  if (!schedule) return []

  const [openHour, openMinute] = schedule.hora_apertura.split(":").map(Number)
  const [closeHour, closeMinute] = schedule.hora_cierre.split(":").map(Number)
  const openAt = openHour * 60 + openMinute
  const closeAt = closeHour * 60 + closeMinute
  const slots: string[] = []

  for (let minute = openAt; minute < closeAt; minute += stepMinutes) {
    const hour = String(Math.floor(minute / 60)).padStart(2, "0")
    const remainder = String(minute % 60).padStart(2, "0")
    slots.push(`${hour}:${remainder}:00`)
  }

  return slots
}
