"use client"

import { useMemo, useState, type FormEvent } from "react"
import {
  CalendarDays,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Scissors,
  ShieldCheck,
  Trash2,
  UsersRound,
} from "lucide-react"
import { AppointmentTable } from "@/components/appointment-table"
import { DashboardLayout, type DashboardNavItem } from "@/components/dashboard-layout"
import { FormInput, FormSelect, FormTextarea } from "@/components/form-controls"
import { MetricCard } from "@/components/metric-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  Barbero,
  BarberoUpdate,
  Barberia,
  BarberiaCreate,
  Cita,
  CitaCreate,
  Cliente,
  DiaSemana,
  EstadoBarbero,
  EstadoBarberia,
  EstadoCita,
  EstadoServicio,
  Horario,
  HorarioCreate,
  RolCatalogo,
  RolCreate,
  RolUsuario,
  Servicio,
  ServicioCreate,
  UsuarioCreate,
  UsuarioGestion,
  UsuarioUpdate,
} from "@/lib/api"
import { formatCurrency, formatDate, formatTime, todayKey } from "@/lib/format"

interface AdminPanelProps {
  userId: number
  userName: string
  barberias: Barberia[]
  barberos: Barbero[]
  servicios: Servicio[]
  horarios: Horario[]
  usuarios: UsuarioGestion[]
  clientes: Cliente[]
  citas: Cita[]
  roles: RolCatalogo[]
  onCreateBarberia: (body: BarberiaCreate) => void
  onUpdateBarberia: (id: number, body: Partial<Barberia>) => void
  onDeleteBarberia: (id: number) => void
  onCreateBarbero: (body: Pick<Barbero, "id_usuario" | "id_barberia" | "especialidad">) => void
  onUpdateBarbero: (id: number, body: BarberoUpdate) => void
  onDeleteBarbero: (id: number) => void
  onCreateServicio: (body: ServicioCreate) => void
  onCreateHorario: (body: HorarioCreate) => void
  onCreateCita: (body: CitaCreate) => void
  onCreateUsuario: (body: UsuarioCreate) => void
  onUpdateUsuario: (id: number, body: UsuarioUpdate) => void
  onDeleteUsuario: (id: number) => void
  onCreateRole: (body: RolCreate) => void
  onUpdateRole: (id: number, body: Partial<RolCatalogo>) => void
  onDeleteRole: (id: number) => void
  onUpdateAppointment: (id: number, estado: EstadoCita) => void
}

type DialogKind = "barberia" | "barbero" | "servicio" | "horario" | "cita" | "usuario" | "rol"
type DeleteKind = "barberia" | "barbero" | "usuario" | "rol"
type FormValues = Record<string, string>

const nav: DashboardNavItem[] = [
  { value: "overview", label: "Resumen", icon: CalendarDays },
  { value: "barberias", label: "Barberías", icon: MapPin },
  { value: "barberos", label: "Barberos", icon: Scissors },
  { value: "servicios", label: "Servicios", icon: Clock3 },
  { value: "horarios", label: "Horarios", icon: Clock3 },
  { value: "usuarios", label: "Usuarios", icon: UsersRound },
  { value: "roles", label: "Roles", icon: ShieldCheck },
  { value: "citas", label: "Citas", icon: CalendarDays },
]

const emptyValues: FormValues = {}

export function AdminPanel({
  userId,
  userName,
  barberias,
  barberos,
  servicios,
  horarios,
  usuarios,
  clientes,
  citas,
  roles,
  onCreateBarberia,
  onUpdateBarberia,
  onDeleteBarberia,
  onCreateBarbero,
  onUpdateBarbero,
  onDeleteBarbero,
  onCreateServicio,
  onCreateHorario,
  onCreateCita,
  onCreateUsuario,
  onUpdateUsuario,
  onDeleteUsuario,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
  onUpdateAppointment,
}: AdminPanelProps) {
  const [active, setActive] = useState("overview")
  const [dialog, setDialog] = useState<{ kind: DialogKind; id: number | null } | null>(null)
  const [form, setForm] = useState<FormValues>(emptyValues)
  const [deleteTarget, setDeleteTarget] = useState<{ kind: DeleteKind; id: number; label: string } | null>(null)
  const [userView, setUserView] = useState<"usuarios" | "clientes">("usuarios")
  const [roleFilter, setRoleFilter] = useState("todas")
  const [userStateFilter, setUserStateFilter] = useState("todos")
  const [serviceBranchFilter, setServiceBranchFilter] = useState("todas")

  const todayAppointments = citas.filter((cita) => cita.fecha === todayKey())
  const availableBarbers = barberos.filter((barbero) => barbero.estado === "Disponible")
  const filteredUsers = useMemo(() => usuarios.filter((usuario) =>
    (roleFilter === "todas" || usuario.id_rol === Number(roleFilter)) &&
    (userStateFilter === "todos" || usuario.estado === userStateFilter),
  ), [usuarios, roleFilter, userStateFilter])
  const filteredServices = servicios.filter((servicio) =>
    serviceBranchFilter === "todas" || servicio.id_barberia === Number(serviceBranchFilter),
  )
  const formBranchId = Number(form.id_barberia) || barberias[0]?.id_barberia || 0
  const branchServices = servicios.filter((servicio) => servicio.id_barberia === formBranchId && servicio.estado === "Activo")
  const branchBarbers = barberos.filter((barbero) => barbero.id_barberia === formBranchId && barbero.estado === "Disponible")
  const eligibleBarberUsers = usuarios.filter((usuario) =>
    usuario.rol === "Barbero" && !barberos.some((barbero) => barbero.id_usuario === usuario.id_usuario),
  )

  const title = active === "barberias" ? "Nuestras sedes" :
    active === "barberos" ? "Equipo de barberos" :
      active === "servicios" ? "Carta de servicios" :
        active === "horarios" ? "Horarios de atención" :
          active === "usuarios" ? "Usuarios y clientes" :
            active === "roles" ? "Roles de acceso" :
              active === "citas" ? "Citas globales" : "Visión general"
  const description = active === "overview" ? "Todo el pulso de Navaja, reunido en un solo lugar." :
    active === "barberias" ? "Gestiona sedes, información de contacto y disponibilidad." :
      active === "barberos" ? "Organiza el equipo, sus especialidades y su sede." :
        active === "servicios" ? "Mantén precios, duración y servicios disponibles al día." :
          active === "horarios" ? "Configura la jornada de cada sede para que las reservas respeten su operación." :
            active === "usuarios" ? "Administra cuentas, permisos y el directorio de clientes." :
              active === "roles" ? "Define los roles que organizan el acceso a Navaja." :
                "Consulta las reservas de todas las sedes y agenda nuevas visitas."

  function updateForm(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function openDialog(kind: DialogKind, values: FormValues = {}, id: number | null = null) {
    setForm(values)
    setDialog({ kind, id })
  }

  function openNew(kind: DialogKind) {
    const firstBranch = String(barberias[0]?.id_barberia ?? "")
    const defaults: Record<DialogKind, FormValues> = {
      barberia: { nombre: "", direccion: "", telefono: "", descripcion: "", estado: "Activa" },
      barbero: { id_usuario: String(eligibleBarberUsers[0]?.id_usuario ?? ""), id_barberia: firstBranch, especialidad: "", estado: "Disponible" },
      servicio: { id_barberia: firstBranch, nombre: "", descripcion: "", precio: "", duracion_minutos: "45", estado: "Activo" },
      horario: { id_barberia: firstBranch, dia_semana: "Lunes", hora_apertura: "09:00", hora_cierre: "18:00" },
      cita: { id_cliente: String(clientes[0]?.id_cliente ?? ""), id_barberia: firstBranch, id_barbero: "", id_servicio: "", fecha: todayKey(), hora: "09:00", observaciones: "" },
      usuario: { id_rol: "3", rol: "Cliente", nombre: "", correo: "", telefono: "", password: "", estado: "Activo" },
      rol: { nombre: "" },
    }
    openDialog(kind, defaults[kind])
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!dialog) return

    switch (dialog.kind) {
      case "barberia": {
        const body: BarberiaCreate = {
          id_admin: userId,
          nombre: form.nombre.trim(),
          direccion: form.direccion.trim(),
          telefono: form.telefono.trim(),
          descripcion: form.descripcion.trim(),
          estado: form.estado as EstadoBarberia,
        }
        if (dialog.id === null) onCreateBarberia(body)
        else onUpdateBarberia(dialog.id, body)
        break
      }
      case "barbero": {
        if (dialog.id === null) {
          onCreateBarbero({
            id_usuario: Number(form.id_usuario),
            id_barberia: Number(form.id_barberia),
            especialidad: form.especialidad.trim(),
          })
        } else {
          onUpdateBarbero(dialog.id, {
            id_barberia: Number(form.id_barberia),
            especialidad: form.especialidad.trim(),
            estado: form.estado as EstadoBarbero,
          })
        }
        break
      }
      case "servicio":
        onCreateServicio({
          id_barberia: Number(form.id_barberia),
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          precio: Number(form.precio),
          duracion_minutos: Number(form.duracion_minutos),
          estado: form.estado as EstadoServicio,
        })
        break
      case "horario":
        onCreateHorario({
          id_barberia: Number(form.id_barberia),
          dia_semana: form.dia_semana as DiaSemana,
          hora_apertura: `${form.hora_apertura}:00`,
          hora_cierre: `${form.hora_cierre}:00`,
        })
        break
      case "cita":
        onCreateCita({
          id_barberia: Number(form.id_barberia),
          id_cliente: Number(form.id_cliente),
          id_barbero: Number(form.id_barbero),
          id_servicio: Number(form.id_servicio),
          fecha: form.fecha,
          hora: `${form.hora}:00`,
          observaciones: form.observaciones.trim() || null,
        })
        break
      case "usuario": {
        const userRole = form.rol as RolUsuario
        if (dialog.id === null) {
          onCreateUsuario({
            id_rol: Number(form.id_rol),
            rol: userRole,
            nombre: form.nombre.trim(),
            correo: form.correo.trim(),
            telefono: form.telefono.trim(),
            password: form.password,
            estado: form.estado as "Activo" | "Inactivo",
          })
        } else {
          const update: UsuarioUpdate = {
            id_rol: Number(form.id_rol),
            rol: userRole,
            nombre: form.nombre.trim(),
            correo: form.correo.trim(),
            telefono: form.telefono.trim(),
            estado: form.estado as "Activo" | "Inactivo",
            ...(form.password ? { password: form.password } : {}),
          }
          onUpdateUsuario(dialog.id, update)
        }
        break
      }
      case "rol": {
        const body: RolCreate = { nombre: form.nombre.trim() }
        if (dialog.id === null) onCreateRole(body)
        else onUpdateRole(dialog.id, body)
        break
      }
    }

    setDialog(null)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    if (deleteTarget.kind === "barberia") onDeleteBarberia(deleteTarget.id)
    if (deleteTarget.kind === "barbero") onDeleteBarbero(deleteTarget.id)
    if (deleteTarget.kind === "usuario") onDeleteUsuario(deleteTarget.id)
    if (deleteTarget.kind === "rol") onDeleteRole(deleteTarget.id)
    setDeleteTarget(null)
  }

  function editBarberia(barberia: Barberia) {
    openDialog("barberia", {
      nombre: barberia.nombre,
      direccion: barberia.direccion,
      telefono: barberia.telefono,
      descripcion: barberia.descripcion,
      estado: barberia.estado,
    }, barberia.id_barberia)
  }

  function editBarbero(barbero: Barbero) {
    openDialog("barbero", {
      id_usuario: String(barbero.id_usuario),
      id_barberia: String(barbero.id_barberia),
      especialidad: barbero.especialidad,
      estado: barbero.estado,
    }, barbero.id_barbero)
  }

  function editUsuario(usuario: UsuarioGestion) {
    openDialog("usuario", {
      id_rol: String(usuario.id_rol),
      rol: usuario.rol,
      nombre: usuario.nombre,
      correo: usuario.correo,
      telefono: usuario.telefono,
      password: "",
      estado: usuario.estado,
    }, usuario.id_usuario)
  }

  function editRole(role: RolCatalogo) {
    openDialog("rol", { nombre: role.nombre }, role.id_rol)
  }

  function renderDialogFields() {
    if (!dialog) return null
    const branchOptions = barberias.map((barberia) => ({ value: String(barberia.id_barberia), label: barberia.nombre }))
    const roleOptions = roles.map((role) => ({ value: String(role.id_rol), label: role.nombre }))
    const dayOptions = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"].map((day) => ({ value: day, label: day }))
    const statusOptions = (options: string[]) => options.map((value) => ({ value, label: value }))

    if (dialog.kind === "barberia") {
      return (
        <FieldGroup className="gap-4">
          <FormInput id="branch-name" label="Nombre de la sede" required value={form.nombre ?? ""} onChange={(event) => updateForm("nombre", event.target.value)} />
          <FormInput id="branch-address" label="Dirección" required value={form.direccion ?? ""} onChange={(event) => updateForm("direccion", event.target.value)} />
          <FormInput id="branch-phone" label="Teléfono" type="tel" required value={form.telefono ?? ""} onChange={(event) => updateForm("telefono", event.target.value)} />
          <FormTextarea id="branch-description" label="Descripción" required value={form.descripcion ?? ""} onChange={(event) => updateForm("descripcion", event.target.value)} />
          <FormSelect id="branch-state" label="Estado" options={statusOptions(["Activa", "Inactiva"])} value={form.estado ?? "Activa"} onChange={(event) => updateForm("estado", event.target.value)} />
        </FieldGroup>
      )
    }

    if (dialog.kind === "barbero") {
      return (
        <FieldGroup className="gap-4">
          {dialog.id === null ? (
            <FormSelect
              id="barber-user"
              label="Usuario vinculado"
              placeholder="Selecciona un usuario barbero"
              required
              options={eligibleBarberUsers.map((usuario) => ({ value: String(usuario.id_usuario), label: `${usuario.nombre} · ${usuario.correo}` }))}
              value={form.id_usuario ?? ""}
              onChange={(event) => updateForm("id_usuario", event.target.value)}
            />
          ) : null}
          <FormSelect id="barber-branch" label="Sede" options={branchOptions} required value={form.id_barberia ?? ""} onChange={(event) => updateForm("id_barberia", event.target.value)} />
          <FormInput id="barber-specialty" label="Especialidad" required value={form.especialidad ?? ""} onChange={(event) => updateForm("especialidad", event.target.value)} />
          {dialog.id !== null ? <FormSelect id="barber-state" label="Disponibilidad" options={statusOptions(["Disponible", "No disponible"])} value={form.estado ?? "Disponible"} onChange={(event) => updateForm("estado", event.target.value)} /> : null}
        </FieldGroup>
      )
    }

    if (dialog.kind === "servicio") {
      return (
        <FieldGroup className="gap-4">
          <FormSelect id="service-branch" label="Sede" options={branchOptions} required value={form.id_barberia ?? ""} onChange={(event) => updateForm("id_barberia", event.target.value)} />
          <FormInput id="service-name" label="Nombre del servicio" required value={form.nombre ?? ""} onChange={(event) => updateForm("nombre", event.target.value)} />
          <FormTextarea id="service-description" label="Descripción" required value={form.descripcion ?? ""} onChange={(event) => updateForm("descripcion", event.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput id="service-price" label="Precio (MXN)" type="number" min="1" step="1" required value={form.precio ?? ""} onChange={(event) => updateForm("precio", event.target.value)} />
            <FormInput id="service-duration" label="Duración (minutos)" type="number" min="5" step="5" required value={form.duracion_minutos ?? "45"} onChange={(event) => updateForm("duracion_minutos", event.target.value)} />
          </div>
          <FormSelect id="service-state" label="Estado" options={statusOptions(["Activo", "Inactivo"])} value={form.estado ?? "Activo"} onChange={(event) => updateForm("estado", event.target.value)} />
        </FieldGroup>
      )
    }

    if (dialog.kind === "horario") {
      return (
        <FieldGroup className="gap-4">
          <FormSelect id="schedule-branch" label="Sede" options={branchOptions} required value={form.id_barberia ?? ""} onChange={(event) => updateForm("id_barberia", event.target.value)} />
          <FormSelect id="schedule-day" label="Día de la semana" options={dayOptions} required value={form.dia_semana ?? "Lunes"} onChange={(event) => updateForm("dia_semana", event.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput id="schedule-open" label="Hora de apertura" type="time" required value={form.hora_apertura ?? "09:00"} onChange={(event) => updateForm("hora_apertura", event.target.value)} />
            <FormInput id="schedule-close" label="Hora de cierre" type="time" required value={form.hora_cierre ?? "18:00"} onChange={(event) => updateForm("hora_cierre", event.target.value)} />
          </div>
        </FieldGroup>
      )
    }

    if (dialog.kind === "cita") {
      return (
        <FieldGroup className="gap-4">
          <FormSelect id="appointment-client" label="Cliente" placeholder="Selecciona un cliente" options={clientes.map((cliente) => ({ value: String(cliente.id_cliente), label: `${cliente.nombre} · ${cliente.telefono}` }))} required value={form.id_cliente ?? ""} onChange={(event) => updateForm("id_cliente", event.target.value)} />
          <FormSelect id="appointment-branch" label="Sede" options={branchOptions} required value={form.id_barberia ?? ""} onChange={(event) => { updateForm("id_barberia", event.target.value); updateForm("id_barbero", ""); updateForm("id_servicio", "") }} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect id="appointment-barber" label="Barbero" placeholder="Selecciona" options={branchBarbers.map((barbero) => ({ value: String(barbero.id_barbero), label: barbero.barbero_nombre }))} required value={form.id_barbero ?? ""} onChange={(event) => updateForm("id_barbero", event.target.value)} />
            <FormSelect id="appointment-service" label="Servicio" placeholder="Selecciona" options={branchServices.map((servicio) => ({ value: String(servicio.id_servicio), label: `${servicio.nombre} · ${formatCurrency(servicio.precio)}` }))} required value={form.id_servicio ?? ""} onChange={(event) => updateForm("id_servicio", event.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput id="appointment-date" label="Fecha" type="date" min={todayKey()} required value={form.fecha ?? todayKey()} onChange={(event) => updateForm("fecha", event.target.value)} />
            <FormInput id="appointment-time" label="Hora" type="time" required value={form.hora ?? "09:00"} onChange={(event) => updateForm("hora", event.target.value)} />
          </div>
          <FormTextarea id="appointment-observations" label="Observaciones" value={form.observaciones ?? ""} onChange={(event) => updateForm("observaciones", event.target.value)} maxLength={500} />
        </FieldGroup>
      )
    }

    if (dialog.kind === "usuario") {
      return (
        <FieldGroup className="gap-4">
          <FormSelect id="user-role" label="Rol" options={roleOptions} required value={form.id_rol ?? "3"} onChange={(event) => {
            const selected = roles.find((role) => role.id_rol === Number(event.target.value))
            updateForm("id_rol", event.target.value)
            if (selected) updateForm("rol", selected.nombre)
          }} />
          <FormInput id="user-name" label="Nombre completo" required value={form.nombre ?? ""} onChange={(event) => updateForm("nombre", event.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput id="user-email" label="Correo electrónico" type="email" required value={form.correo ?? ""} onChange={(event) => updateForm("correo", event.target.value)} />
            <FormInput id="user-phone" label="Teléfono" type="tel" required value={form.telefono ?? ""} onChange={(event) => updateForm("telefono", event.target.value)} />
          </div>
          <FormInput id="user-password" label={dialog.id === null ? "Contraseña temporal" : "Nueva contraseña (opcional)"} type="password" minLength={8} required={dialog.id === null} value={form.password ?? ""} onChange={(event) => updateForm("password", event.target.value)} />
          <FormSelect id="user-state" label="Estado" options={statusOptions(["Activo", "Inactivo"])} value={form.estado ?? "Activo"} onChange={(event) => updateForm("estado", event.target.value)} />
        </FieldGroup>
      )
    }

    return (
      <FieldGroup className="gap-4">
        <FormInput id="role-name" label="Nombre del rol" required value={form.nombre ?? ""} onChange={(event) => updateForm("nombre", event.target.value)} />
      </FieldGroup>
    )
  }

  const dialogTitle = dialog ? ({
    barberia: dialog.id === null ? "Nueva barbería" : "Editar barbería",
    barbero: dialog.id === null ? "Agregar barbero" : "Editar barbero",
    servicio: "Nuevo servicio",
    horario: "Nuevo horario",
    cita: "Agendar cita",
    usuario: dialog.id === null ? "Crear usuario" : "Editar usuario",
    rol: dialog.id === null ? "Crear rol" : "Editar rol",
  } satisfies Record<DialogKind, string>)[dialog.kind] : ""

  return (
    <>
      <DashboardLayout
        role="Administrador"
        name={userName}
        nav={nav}
        active={active}
        onNavigate={setActive}
        title={title}
        description={description}
        headerAction={active === "citas" ? <Button onClick={() => openNew("cita")}><Plus data-icon="inline-start" />Agendar cita</Button> : undefined}
      >
        {active === "overview" ? (
          <div className="flex flex-col gap-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Citas de hoy" value={todayAppointments.length} detail="En todas las sedes" icon={CalendarDays} />
              <MetricCard label="Barberías activas" value={barberias.filter((item) => item.estado === "Activa").length} detail="Espacios en operación" icon={MapPin} />
              <MetricCard label="Barberos disponibles" value={availableBarbers.length} detail={`De ${barberos.length} en el equipo`} icon={Scissors} />
              <MetricCard label="Clientes" value={clientes.length} detail="Perfiles registrados" icon={UsersRound} />
            </div>
            <Card className="gap-0 border-white/8 bg-card/55">
              <CardHeader className="flex flex-row items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-primary">OPERACIÓN</p>
                  <CardTitle className="mt-2 font-display text-xl font-normal">Citas de hoy</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActive("citas")}>Ver todas</Button>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <AppointmentTable citas={todayAppointments} clientes={clientes} barberos={barberos} servicios={servicios} barberias={barberias} showClient showBranch emptyMessage="No hay citas para hoy." />
              </CardContent>
            </Card>
            <div className="grid gap-3 lg:grid-cols-2">
              {barberias.map((barberia) => (
                <Card key={barberia.id_barberia} className="gap-0 border-white/8 bg-card/55">
                  <CardContent className="flex items-start justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">{barberia.nombre}</h3><StatusBadge status={barberia.estado} /></div>
                      <p className="mt-2 text-xs text-muted-foreground">{barberia.direccion}</p>
                      <p className="mt-3 text-xs text-muted-foreground">{barberos.filter((item) => item.id_barberia === barberia.id_barberia).length} barberos · {servicios.filter((item) => item.id_barberia === barberia.id_barberia).length} servicios</p>
                    </div>
                    <Button size="icon" variant="ghost" aria-label={`Editar ${barberia.nombre}`} onClick={() => editBarberia(barberia)}><Pencil /></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        {active === "barberias" ? (
          <div className="flex flex-col gap-5">
            <SectionToolbar eyebrow="SEDES" title="Administrar barberías" actionLabel="Nueva barbería" onAction={() => openNew("barberia")} />
            <div className="overflow-hidden rounded-xl border border-white/8 bg-background/30">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow className="border-white/8 hover:bg-transparent"><TableHead>Sede</TableHead><TableHead>Contacto</TableHead><TableHead>Equipo</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {barberias.map((barberia) => (
                      <TableRow key={barberia.id_barberia} className="border-white/6">
                        <TableCell className="min-w-56"><span className="block font-medium text-foreground">{barberia.nombre}</span><span className="mt-1 block text-xs text-muted-foreground">{barberia.direccion}</span></TableCell>
                        <TableCell className="text-muted-foreground"><span className="block">{barberia.telefono}</span><span className="mt-1 block text-xs">{horarios.filter((item) => item.id_barberia === barberia.id_barberia).length} horarios</span></TableCell>
                        <TableCell className="text-muted-foreground">{barberos.filter((item) => item.id_barberia === barberia.id_barberia).length} barberos</TableCell>
                        <TableCell><StatusBadge status={barberia.estado} /></TableCell>
                        <TableCell><div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" aria-label={`Editar ${barberia.nombre}`} onClick={() => editBarberia(barberia)}><Pencil /></Button>
                          <Button size="icon" variant="ghost" aria-label={`Agregar horario a ${barberia.nombre}`} onClick={() => openDialog("horario", { id_barberia: String(barberia.id_barberia), dia_semana: "Lunes", hora_apertura: "09:00", hora_cierre: "18:00" })}><Clock3 /></Button>
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" aria-label={`Eliminar ${barberia.nombre}`} onClick={() => setDeleteTarget({ kind: "barberia", id: barberia.id_barberia, label: barberia.nombre })}><Trash2 /></Button>
                        </div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : null}

        {active === "barberos" ? (
          <div className="flex flex-col gap-5">
            <SectionToolbar eyebrow="EQUIPO" title="Administrar barberos" actionLabel="Agregar barbero" onAction={() => openNew("barbero")} />
            <div className="overflow-hidden rounded-xl border border-white/8 bg-background/30">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow className="border-white/8 hover:bg-transparent"><TableHead>Barbero</TableHead><TableHead>Especialidad</TableHead><TableHead>Sede</TableHead><TableHead>Disponibilidad</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {barberos.map((barbero) => (
                      <TableRow key={barbero.id_barbero} className="border-white/6">
                        <TableCell className="min-w-48"><span className="block font-medium text-foreground">{barbero.barbero_nombre}</span><span className="mt-1 block text-xs text-muted-foreground">{barbero.barbero_correo}</span></TableCell>
                        <TableCell className="text-muted-foreground">{barbero.especialidad}</TableCell>
                        <TableCell className="text-muted-foreground">{barberias.find((item) => item.id_barberia === barbero.id_barberia)?.nombre ?? barbero.barberia_nombre}</TableCell>
                        <TableCell><StatusBadge status={barbero.estado} /></TableCell>
                        <TableCell><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" aria-label={`Editar a ${barbero.barbero_nombre}`} onClick={() => editBarbero(barbero)}><Pencil /></Button><Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" aria-label={`Eliminar a ${barbero.barbero_nombre}`} onClick={() => setDeleteTarget({ kind: "barbero", id: barbero.id_barbero, label: barbero.barbero_nombre })}><Trash2 /></Button></div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {!eligibleBarberUsers.length ? <p className="border-t border-white/8 px-4 py-3 text-xs text-muted-foreground">Todos los usuarios con rol Barbero ya tienen un perfil asociado.</p> : null}
            </div>
          </div>
        ) : null}

        {active === "servicios" ? (
          <div className="flex flex-col gap-5">
            <SectionToolbar eyebrow="CARTA" title="Servicios y precios" actionLabel="Nuevo servicio" onAction={() => openNew("servicio")} />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-sm text-muted-foreground">{filteredServices.length} servicios en catálogo</p>
              <div className="w-full sm:max-w-64">
                <FormSelect id="service-filter" label="Filtrar por sede" options={[{ value: "todas", label: "Todas las sedes" }, ...barberias.map((item) => ({ value: String(item.id_barberia), label: item.nombre }))]} value={serviceBranchFilter} onChange={(event) => setServiceBranchFilter(event.target.value)} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredServices.map((servicio) => (
                <Card key={servicio.id_servicio} className="gap-0 border-white/8 bg-card/55">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Scissors className="size-4" /></span><StatusBadge status={servicio.estado} /></div>
                    <h3 className="mt-4 font-display text-xl">{servicio.nombre}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{barberias.find((item) => item.id_barberia === servicio.id_barberia)?.nombre ?? "Sede"}</p>
                    <p className="mt-3 min-h-10 text-sm leading-5 text-muted-foreground">{servicio.descripcion}</p>
                    <div className="mt-4 flex items-end justify-between border-t border-white/8 pt-4"><span className="text-xs text-muted-foreground">{servicio.duracion_minutos} min</span><span className="font-medium text-primary">{formatCurrency(servicio.precio)}</span></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        {active === "horarios" ? (
          <div className="flex flex-col gap-4">
            <SectionToolbar eyebrow="OPERACIÓN" title="Horarios por sede" actionLabel="Agregar horario" onAction={() => openNew("horario")} />
            {barberias.map((barberia) => (
              <Card key={barberia.id_barberia} className="gap-0 border-white/8 bg-card/55">
                <CardHeader className="flex flex-row items-center justify-between gap-4 p-5">
                  <div><p className="text-[10px] font-semibold tracking-[0.18em] text-primary">SEDE</p><CardTitle className="mt-2 font-display text-xl font-normal">{barberia.nombre}</CardTitle></div>
                  <Button size="sm" variant="outline" onClick={() => openDialog("horario", { id_barberia: String(barberia.id_barberia), dia_semana: "Lunes", hora_apertura: "09:00", hora_cierre: "18:00" })}><Plus data-icon="inline-start" />Añadir día</Button>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {horarios.filter((horario) => horario.id_barberia === barberia.id_barberia).map((horario) => (
                      <div key={horario.id_horario} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-background/40 px-3 py-3">
                        <span className="text-sm text-foreground">{horario.dia_semana}</span><span className="text-xs tabular-nums text-muted-foreground">{formatTime(horario.hora_apertura)} – {formatTime(horario.hora_cierre)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {active === "usuarios" ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-[10px] font-semibold tracking-[0.18em] text-primary">DIRECTORIO</p><h2 className="mt-2 font-display text-2xl">Usuarios y clientes</h2></div>
              {userView === "usuarios" ? <Button onClick={() => openNew("usuario")}><UsersRound data-icon="inline-start" />Crear usuario</Button> : null}
            </div>
            <div className="flex flex-wrap gap-2 border-b border-white/8 pb-3">
              <Button size="sm" variant={userView === "usuarios" ? "secondary" : "ghost"} onClick={() => setUserView("usuarios")}>Usuarios · {usuarios.length}</Button>
              <Button size="sm" variant={userView === "clientes" ? "secondary" : "ghost"} onClick={() => setUserView("clientes")}>Clientes · {clientes.length}</Button>
            </div>
            {userView === "usuarios" ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormSelect id="user-role-filter" label="Filtrar por rol" options={[{ value: "todas", label: "Todos los roles" }, ...roles.map((role) => ({ value: String(role.id_rol), label: role.nombre }))]} value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} />
                  <FormSelect id="user-state-filter" label="Filtrar por estado" options={[{ value: "todos", label: "Todos los estados" }, { value: "Activo", label: "Activo" }, { value: "Inactivo", label: "Inactivo" }]} value={userStateFilter} onChange={(event) => setUserStateFilter(event.target.value)} />
                </div>
                <div className="overflow-hidden rounded-xl border border-white/8 bg-background/30">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow className="border-white/8 hover:bg-transparent"><TableHead>Usuario</TableHead><TableHead>Rol</TableHead><TableHead>Teléfono</TableHead><TableHead>Último acceso</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {filteredUsers.map((usuario) => (
                          <TableRow key={usuario.id_usuario} className="border-white/6">
                            <TableCell className="min-w-48"><span className="block font-medium text-foreground">{usuario.nombre}</span><span className="mt-1 block text-xs text-muted-foreground">{usuario.correo}</span></TableCell>
                            <TableCell><StatusBadge status={usuario.rol} /></TableCell>
                            <TableCell className="text-muted-foreground">{usuario.telefono}</TableCell>
                            <TableCell className="text-muted-foreground">{usuario.ultimo_login ? formatDate(usuario.ultimo_login.slice(0, 10), { year: "numeric" }) : "Sin acceso"}</TableCell>
                            <TableCell><StatusBadge status={usuario.estado} /></TableCell>
                            <TableCell><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" aria-label={`Editar a ${usuario.nombre}`} onClick={() => editUsuario(usuario)}><Pencil /></Button><Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" aria-label={`Eliminar a ${usuario.nombre}`} onClick={() => setDeleteTarget({ kind: "usuario", id: usuario.id_usuario, label: usuario.nombre })}><Trash2 /></Button></div></TableCell>
                          </TableRow>
                        ))}
                        {!filteredUsers.length ? <TableRow><TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">No hay usuarios con estos filtros.</TableCell></TableRow> : null}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/8 bg-background/30">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow className="border-white/8 hover:bg-transparent"><TableHead>Cliente</TableHead><TableHead>Correo</TableHead><TableHead>Teléfono</TableHead><TableHead>Fecha de registro</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                    <TableBody>{clientes.map((cliente) => <TableRow key={cliente.id_cliente} className="border-white/6"><TableCell className="font-medium text-foreground">{cliente.nombre}</TableCell><TableCell className="text-muted-foreground">{cliente.correo}</TableCell><TableCell className="text-muted-foreground">{cliente.telefono}</TableCell><TableCell className="text-muted-foreground">{formatDate(cliente.fecha_registro, { year: "numeric" })}</TableCell><TableCell><StatusBadge status={cliente.estado} /></TableCell></TableRow>)}</TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {active === "roles" ? (
          <div className="flex flex-col gap-5">
            <SectionToolbar eyebrow="PERMISOS" title="Roles del sistema" actionLabel="Crear rol" onAction={() => openNew("rol")} />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {roles.map((role) => (
                <Card key={role.id_rol} className="gap-0 border-white/8 bg-card/55">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="size-4" /></span><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label={`Editar rol ${role.nombre}`} onClick={() => editRole(role)}><Pencil /></Button><Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" aria-label={`Eliminar rol ${role.nombre}`} onClick={() => setDeleteTarget({ kind: "rol", id: role.id_rol, label: role.nombre })}><Trash2 /></Button></div></div>
                    <h3 className="mt-4 font-display text-xl">{role.nombre}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{usuarios.filter((usuario) => usuario.id_rol === role.id_rol).length} cuentas asociadas</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs leading-5 text-muted-foreground">Los cambios de rol afectan los permisos y la vista asignada a cada cuenta.</p>
          </div>
        ) : null}

        {active === "citas" ? (
          <div className="flex flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Todas las citas" value={citas.length} detail="En el sistema" icon={CalendarDays} />
              <MetricCard label="Pendientes" value={citas.filter((cita) => cita.estado === "Pendiente").length} detail="Por confirmar o atender" icon={Clock3} />
              <MetricCard label="Atendidas" value={citas.filter((cita) => cita.estado === "Atendida").length} detail="Visitas completadas" icon={Scissors} />
            </div>
            <Card className="gap-0 border-white/8 bg-card/55">
              <CardHeader className="flex flex-row items-center justify-between gap-4 p-5">
                <div><p className="text-[10px] font-semibold tracking-[0.18em] text-primary">RESERVAS</p><CardTitle className="mt-2 font-display text-xl font-normal">Citas de todas las sedes</CardTitle></div>
                <Button size="sm" variant="outline" onClick={() => openNew("cita")}><Plus data-icon="inline-start" />Agendar</Button>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <AppointmentTable citas={[...citas].sort((a, b) => `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`))} clientes={clientes} barberos={barberos} servicios={servicios} barberias={barberias} showClient showBranch emptyMessage="No hay citas registradas." />
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DashboardLayout>

      <Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) setDialog(null) }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <DialogHeader>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-primary">GESTIÓN NAVAJA</p>
              <DialogTitle className="font-display text-2xl">{dialogTitle}</DialogTitle>
              <DialogDescription>Completa los datos para actualizar la información del sistema.</DialogDescription>
            </DialogHeader>
            {renderDialogFields()}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancelar</Button>
              <Button type="submit">{dialog?.id === null ? "Crear" : "Guardar cambios"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">¿Eliminar este registro?</DialogTitle>
            <DialogDescription>
              Se eliminará <span className="font-medium text-foreground">{deleteTarget?.label}</span> de la maqueta. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}><Trash2 data-icon="inline-start" />Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SectionToolbar({
  eyebrow,
  title,
  actionLabel,
  onAction,
}: {
  eyebrow: string
  title: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-[10px] font-semibold tracking-[0.18em] text-primary">{eyebrow}</p><h2 className="mt-2 font-display text-2xl">{title}</h2></div>
      <Button onClick={onAction}><Plus data-icon="inline-start" />{actionLabel}</Button>
    </div>
  )
}
