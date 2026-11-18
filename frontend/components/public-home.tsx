"use client"

import Image from "next/image"
import { useState } from "react"
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  MapPin,
  Phone,
  Scissors,
  Sparkles,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import type { Barbero, Barberia, Horario, Servicio } from "@/lib/api"
import { formatCurrency, formatTime, todayKey, weekdayForDate } from "@/lib/format"

interface PublicHomeProps {
  barberias: Barberia[]
  barberos: Barbero[]
  servicios: Servicio[]
  horarios: Horario[]
  onBook: () => void
  onLogin: () => void
}

export function PublicHome({
  barberias,
  barberos,
  servicios,
  horarios,
  onBook,
}: PublicHomeProps) {
  const [selectedBarberia, setSelectedBarberia] = useState("todas")
  const today = weekdayForDate(todayKey())
  const visibleServices = servicios.filter((servicio) =>
    selectedBarberia === "todas" ? servicio.estado === "Activo" :
      servicio.id_barberia === Number(selectedBarberia) && servicio.estado === "Activo",
  )

  return (
    <main>
      <section id="inicio" className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-card shadow-2xl shadow-black/20 sm:rounded-[36px]">
          <div className="hairline-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="grid min-h-[600px] lg:grid-cols-[1.03fr_0.97fr]">
            <div className="relative z-10 flex flex-col justify-center px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
              <Badge variant="outline" className="mb-7 w-fit border-primary/25 bg-primary/5 px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-primary">
                <Sparkles data-icon="inline-start" />
                UN RITUAL, NO SOLO UN CORTE
              </Badge>
              <h1 className="font-display text-balance text-[clamp(3.25rem,6vw,5.8rem)] leading-[0.96] tracking-[-0.045em] text-foreground">
                El arte de
                <br />
                <span className="italic text-primary">sentirte</span> bien.
              </h1>
              <p className="mt-7 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
                Oficio de siempre. Mirada de hoy. Encuentra tu silla, tu barbero y ese corte que ya tenías en mente.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={onBook}>
                  Encuentra tu cita
                  <ArrowUpRight data-icon="inline-end" />
                </Button>
                <a href="#servicios" className="inline-flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Descubre el menú
                  <ArrowDown className="size-4" />
                </a>
              </div>
              <div className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <div>
                  <p className="font-display text-2xl text-foreground">02</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Sedes</p>
                </div>
                <div>
                  <p className="font-display text-2xl text-foreground">04</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Maestros</p>
                </div>
                <div>
                  <p className="font-display text-2xl text-foreground">Desde 2018</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">En el oficio</p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[360px] overflow-hidden border-t border-white/8 lg:absolute lg:inset-y-0 lg:right-0 lg:w-[49%] lg:border-l lg:border-t-0">
              <Image
                src="/images/barbershop-editorial.png"
                alt="Barbero trabajando con precisión en una barbería de luz cálida"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 49vw"
                className="object-cover object-[58%_center]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/5 lg:bg-gradient-to-r lg:from-card/50 lg:via-transparent lg:to-transparent" />
              <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4 sm:right-8 sm:bottom-8 sm:left-8">
                <div className="rounded-2xl border border-white/15 bg-background/75 p-4 shadow-xl backdrop-blur-xl sm:p-5">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-primary">CAREPA & APARTADÓ · ANTIOQUIA</p>
                  <p className="mt-2 font-display text-2xl">Tu lugar, tu ritual.</p>
                  <p className="mt-1 text-xs text-muted-foreground">Lun — Dom · Con cita y sin prisa</p>
                </div>
                <span className="hidden size-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md sm:flex" aria-hidden="true">
                  <Scissors className="size-5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8" aria-labelledby="manifesto-title">
        <div className="grid gap-8 border-y border-white/8 py-10 sm:grid-cols-[0.8fr_1.2fr] sm:items-center sm:py-14">
          <p className="text-xs font-semibold tracking-[0.22em] text-primary">EL OFICIO NOS DEFINE</p>
          <h2 id="manifesto-title" className="font-display text-balance text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Cada detalle cuenta. <span className="text-muted-foreground">Cada visita se siente como volver.</span>
          </h2>
        </div>
      </section>

      <section id="barberias" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-primary">CERCA DE TI</p>
            <h2 className="mt-3 font-display text-4xl tracking-tight">Nuestras sedes</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Dos espacios con la misma atención al detalle. Elige el que te quede mejor.</p>
          </div>
          <Button variant="outline" onClick={onBook}>
            Ver disponibilidad
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {barberias.map((barberia, index) => {
            const branchHours = horarios.filter((horario) => horario.id_barberia === barberia.id_barberia)
            const todayHours = branchHours.find((horario) => horario.dia_semana === today)
            const count = barberos.filter((barbero) => barbero.id_barberia === barberia.id_barberia).length
            return (
              <Card key={barberia.id_barberia} className="group gap-0 overflow-hidden border-white/8 bg-card/70 p-0 transition-colors hover:border-primary/25">
                <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 sm:px-6">
                  <span className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">SEDE 0{index + 1}</span>
                  <StatusBadge status={barberia.estado} />
                </div>
                <CardHeader className="gap-2 px-5 pt-5 sm:px-6">
                  <CardTitle className="font-display text-2xl font-normal tracking-tight">{barberia.nombre}</CardTitle>
                  <CardDescription className="max-w-xl leading-6">{barberia.descripcion}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5 px-5 pb-5 sm:px-6 sm:pb-6">
                  <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                    <p className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{barberia.direccion}</span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <Phone className="size-4 shrink-0 text-primary" />
                      <span>{barberia.telefono}</span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <Clock3 className="size-4 shrink-0 text-primary" />
                      <span>{todayHours ? `${formatTime(todayHours.hora_apertura)} – ${formatTime(todayHours.hora_cierre)}` : "Cerrado hoy"}</span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <Scissors className="size-4 shrink-0 text-primary" />
                      <span>{count} barberos en esta sede</span>
                    </p>
                  </div>
                  <details className="group/hours rounded-xl border border-white/8 bg-background/45 px-4 py-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xs font-medium text-foreground marker:hidden">
                      <span>Ver horarios de atención</span>
                      <ArrowDown className="size-4 text-muted-foreground transition-transform group-open/hours:rotate-180" />
                    </summary>
                    <div className="mt-3 grid gap-1 border-t border-white/8 pt-3 sm:grid-cols-2">
                      {branchHours.map((horario) => (
                        <div key={horario.id_horario} className="flex justify-between gap-3 py-1 text-xs">
                          <span className="text-muted-foreground">{horario.dia_semana}</span>
                          <span className="tabular-nums text-foreground">{formatTime(horario.hora_apertura)} – {formatTime(horario.hora_cierre)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                  <Button className="w-full" variant="secondary" onClick={onBook}>
                    Reservar en esta sede
                    <ArrowUpRight data-icon="inline-end" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section id="servicios" className="scroll-mt-28 border-y border-white/8 bg-card/35">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-primary">CARTA DE SERVICIOS</p>
              <h2 className="mt-3 font-display text-4xl tracking-tight">Elige tu ritual</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Técnica precisa, productos elegidos y tiempo para hacerlo bien.</p>
            </div>
            <div className="w-full sm:w-64">
              <label htmlFor="service-branch" className="mb-2 block text-xs text-muted-foreground">Filtrar por sede</label>
              <select
                id="service-branch"
                value={selectedBarberia}
                onChange={(event) => setSelectedBarberia(event.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-background px-3 text-sm text-foreground outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                <option value="todas">Todas las sedes</option>
                {barberias.map((barberia) => (
                  <option key={barberia.id_barberia} value={barberia.id_barberia}>{barberia.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleServices.map((servicio, index) => {
              const barberia = barberias.find((item) => item.id_barberia === servicio.id_barberia)
              return (
                <Card key={servicio.id_servicio} className="group gap-0 border-white/8 bg-background/60 transition-colors hover:border-primary/30">
                  <CardContent className="flex h-full flex-col p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
                        <Scissors className="size-5" />
                      </span>
                      <Badge variant="outline" className="border-white/10 text-[10px] text-muted-foreground">0{index + 1}</Badge>
                    </div>
                    <h3 className="mt-5 font-display text-2xl">{servicio.nombre}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{servicio.descripcion}</p>
                    <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                      <div>
                        <p className="font-medium text-foreground">{formatCurrency(servicio.precio)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{servicio.duracion_minutos} min · {barberia?.nombre.replace("Navaja · ", "")}</p>
                      </div>
                      <Button size="icon" variant="ghost" aria-label={`Reservar ${servicio.nombre}`} onClick={onBook}>
                        <ArrowUpRight />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section id="equipo" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-primary">BUENAS MANOS</p>
            <h2 className="mt-3 font-display text-4xl tracking-tight">Conoce al equipo</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Personas, no solo perfiles. Elige con quién quieres sentarte.</p>
          </div>
          <Button variant="ghost" onClick={onBook}>
            Reserva con tu barbero favorito
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {barberos.map((barbero) => (
            <Card key={barbero.id_barbero} className="gap-0 border-white/8 bg-card/65">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/8 font-display text-2xl text-primary">
                    {barbero.barbero_nombre.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                  </span>
                  <StatusBadge status={barbero.estado} />
                </div>
                <h3 className="mt-5 font-display text-2xl">{barbero.barbero_nombre}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{barbero.especialidad}</p>
                <div className="mt-5 flex items-center justify-between gap-2 border-t border-white/8 pt-4 text-xs text-muted-foreground">
                  <span>{barbero.barberia_nombre.replace("Navaja · ", "")}</span>
                  <button
                    type="button"
                    onClick={onBook}
                    className="inline-flex items-center gap-1.5 font-medium text-primary transition-colors hover:text-foreground"
                  >
                    Elegir
                    <ArrowUpRight className="size-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/12 via-card to-card px-6 py-10 sm:px-10 sm:py-14">
          <div className="absolute -top-20 right-0 size-72 rounded-full bg-primary/8 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-primary">TE GUARDAMOS UNA SILLA</p>
              <h2 className="mt-3 max-w-xl font-display text-3xl leading-tight sm:text-4xl">Un buen corte cambia el día. Elige cuándo.</h2>
              <p className="mt-3 text-sm text-muted-foreground">Consulta horarios y reserva en menos de un minuto.</p>
            </div>
            <Button size="lg" onClick={onBook}>
              Reservar ahora
              <ArrowUpRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span className="font-display text-base tracking-[0.14em] text-foreground">NAVAJA</span>
          <span>Oficio, atención y un buen café. Ciudad de México.</span>
          <span>© {new Date().getFullYear()} Navaja Barbería</span>
        </div>
      </footer>
    </main>
  )
}
