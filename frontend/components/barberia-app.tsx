"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { AdminPanel } from "@/components/admin-panel"
import { AuthDialog } from "@/components/auth-dialog"
import { BarberPanel } from "@/components/barber-panel"
import { ClientPanel } from "@/components/client-panel"
import { PublicHome } from "@/components/public-home"
import { SiteHeader } from "@/components/site-header"
import type {
  AuthResponse,
  Barbero,
  BarberoUpdate,
  Barberia,
  BarberiaCreate,
  Cita,
  CitaCreate,
  Cliente,
  EstadoCita,
  Horario,
  HorarioCreate,
  RolCatalogo,
  RolCreate,
  Servicio,
  ServicioCreate,
  UsuarioAuth,
  UsuarioCreate,
  UsuarioGestion,
  UsuarioUpdate,
  VistaApp,
} from "@/lib/api"
import { api } from "@/lib/api"
import { demoAccounts, demoData } from "@/lib/mock-data"

function nextId<T extends object>(items: T[], key: keyof T) {
  return items.reduce((largest, item) => Math.max(largest, Number(item[key]) || 0), 0) + 1
}

export function BarberiaApp() {
  const [mode, setMode] = useState<VistaApp>("public")
  const [user, setUser] = useState<UsuarioAuth | null>(null)
  const [apiToken, setApiToken] = useState<string | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [clientInitialSection, setClientInitialSection] = useState("overview")
  const [notice, setNotice] = useState<{ id: number; message: string; error: boolean } | null>(null)

  const [barberias, setBarberias] = useState<Barberia[]>(() => [...demoData.barberias])
  const [barberos, setBarberos] = useState<Barbero[]>(() => [...demoData.barberos])
  const [servicios, setServicios] = useState<Servicio[]>(() => [...demoData.servicios])
  const [horarios, setHorarios] = useState<Horario[]>(() => [...demoData.horarios])
  const [usuarios, setUsuarios] = useState<UsuarioGestion[]>(() => [...demoData.usuarios])
  const [clientes, setClientes] = useState<Cliente[]>(() => [...demoData.clientes])
  const [citas, setCitas] = useState<Cita[]>(() => [...demoData.citas])
  const [roles, setRoles] = useState<RolCatalogo[]>(() => [...demoData.roles])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 3800)
    return () => window.clearTimeout(timeout)
  }, [notice])

  function notify(message: string, error = false) {
    setNotice({ id: Date.now(), message, error })
  }

  function handleModeChange(nextMode: VistaApp) {
    setAuthOpen(false)
    if (nextMode === "public") {
      setMode("public")
      return
    }

    if (!user) {
      setAuthOpen(true)
      notify("Debes iniciar sesión para acceder a este panel.", true)
      return
    }

    if (user.rol !== nextMode) {
      notify(`Acceso denegado: Tu cuenta tiene rol de ${user.rol} y no tiene permisos para el panel de ${nextMode}.`, true)
      return
    }

    setMode(nextMode)
    setClientInitialSection("overview")
  }

  function handleLogout() {
    setUser(null)
    setApiToken(null)
    setMode("public")
    notify("Has cerrado sesión exitosamente.")
  }

  function openBooking() {
    if (user && user.rol === "Cliente") {
      setMode("Cliente")
      setClientInitialSection("booking")
      return
    }

    if (!user) {
      setAuthOpen(true)
      notify("Inicia sesión o crea una cuenta para reservar tu cita.")
      return
    }

    if (user.rol === "Administrador") {
      setMode("Administrador")
      notify("Como administrador puedes gestionar citas directamente en tu panel.")
      return
    }

    if (user.rol === "Barbero") {
      setMode("Barbero")
      notify("Como barbero puedes consultar tu agenda de citas asignadas.")
      return
    }
  }

  async function handleLogin(credentials: { correo: string; password: string }) {
    const emailLower = credentials.correo.toLowerCase().trim()

    // 1. Intentar autenticar contra el backend API real (PostgreSQL + JWT)
    try {
      const response: AuthResponse = await api.auth.login({
        correo: emailLower,
        password: credentials.password,
      })
      setUser(response.usuario)
      setMode(response.usuario.rol)
      setApiToken(response.token)
      setAuthOpen(false)
      notify(`Bienvenido, ${response.usuario.nombre}. Acceso concedido como ${response.usuario.rol}.`)
      return
    } catch (apiError) {
      // 2. Si la API no está disponible o falla, verificar credenciales configuradas
      const validPasswords: Record<string, string> = {
        "admin@barberia.com": "admin123",
        "barbero@barberia.com": "barbero123",
        "cliente@barberia.com": "cliente123",
      }

      // Verificar si es un usuario registrado recientemente
      const localUser = usuarios.find((u) => u.correo.toLowerCase() === emailLower)
      if (localUser && localUser.password && localUser.password === credentials.password) {
        const clientProfile = clientes.find((c) => c.id_usuario === localUser.id_usuario)
        const barberProfile = barberos.find((b) => b.id_usuario === localUser.id_usuario)
        const authUser: UsuarioAuth = {
          id_usuario: localUser.id_usuario,
          nombre: localUser.nombre,
          correo: localUser.correo,
          telefono: localUser.telefono,
          rol: localUser.rol,
          id_rol: localUser.id_rol,
          id_cliente: clientProfile ? clientProfile.id_cliente : null,
          id_barbero: barberProfile ? barberProfile.id_barbero : null,
          id_barberia: barberProfile ? barberProfile.id_barberia : 1,
        }
        setUser(authUser)
        setMode(authUser.rol)
        setApiToken(null)
        setAuthOpen(false)
        notify(`Bienvenido, ${authUser.nombre}. Acceso concedido como ${authUser.rol}.`)
        return
      }

      // Verificar cuentas estándar
      if (validPasswords[emailLower] && validPasswords[emailLower] === credentials.password) {
        const matchedAccount = Object.values(demoAccounts).find((acc) => acc.correo.toLowerCase() === emailLower)
        if (matchedAccount) {
          setUser(matchedAccount)
          setMode(matchedAccount.rol)
          setApiToken(null)
          setAuthOpen(false)
          notify(`Bienvenido, ${matchedAccount.nombre}. Acceso concedido como ${matchedAccount.rol}.`)
          return
        }
      }

      throw new Error(apiError instanceof Error ? apiError.message : "Credenciales inválidas. Verifica tu correo y contraseña.")
    }
  }

  async function handleRegister(details: { nombre: string; correo: string; telefono: string; password: string }) {
    if (usuarios.some((usuario) => usuario.correo.toLowerCase() === details.correo.toLowerCase())) {
      throw new Error("Ya existe una cuenta con ese correo.")
    }

    const idUsuario = nextId(usuarios, "id_usuario")
    const idCliente = nextId(clientes, "id_cliente")
    const newUser: UsuarioAuth = {
      id_usuario: idUsuario,
      nombre: details.nombre.trim(),
      correo: details.correo.trim(),
      telefono: details.telefono.trim(),
      rol: "Cliente",
      id_rol: 3,
      id_cliente: idCliente,
      id_barbero: null,
      id_barberia: null,
    }
    setUsuarios((current) => [
      ...current,
      {
        id_usuario: idUsuario,
        id_rol: 3,
        rol: "Cliente",
        nombre: newUser.nombre,
        correo: newUser.correo,
        telefono: newUser.telefono,
        password: null,
        estado: "Activo",
        ultimo_login: new Date().toISOString(),
      },
    ])
    setClientes((current) => [
      ...current,
      {
        id_cliente: idCliente,
        id_usuario: idUsuario,
        fecha_registro: new Date().toISOString().slice(0, 10),
        nombre: newUser.nombre,
        correo: newUser.correo,
        telefono: newUser.telefono,
        estado: "Activo",
      },
    ])
    setUser(newUser)
    setMode("Cliente")
    setApiToken(null)
    setClientInitialSection("overview")
    setAuthOpen(false)
    notify("Tu cuenta demo está lista. Bienvenido a Navaja.")
  }

  function createBarberia(body: BarberiaCreate) {
    const newBranch: Barberia = { ...body, id_barberia: nextId(barberias, "id_barberia") }
    setBarberias((current) => [...current, newBranch])
    notify("La barbería se agregó a la maqueta.")
  }

  function updateBarberia(id: number, changes: Partial<Barberia>) {
    setBarberias((current) => current.map((item) => item.id_barberia === id ? { ...item, ...changes } : item))
    if (changes.nombre) {
      setBarberos((current) => current.map((item) => item.id_barberia === id ? { ...item, barberia_nombre: changes.nombre ?? item.barberia_nombre } : item))
    }
    notify("La información de la sede se actualizó.")
  }

  function deleteBarberia(id: number) {
    setBarberias((current) => current.filter((item) => item.id_barberia !== id))
    setBarberos((current) => current.filter((item) => item.id_barberia !== id))
    setServicios((current) => current.filter((item) => item.id_barberia !== id))
    setHorarios((current) => current.filter((item) => item.id_barberia !== id))
    notify("La sede y sus elementos de demo se eliminaron.")
  }

  function createBarbero(body: Pick<Barbero, "id_usuario" | "id_barberia" | "especialidad">) {
    const linkedUser = usuarios.find((usuario) => usuario.id_usuario === body.id_usuario)
    const branch = barberias.find((barberia) => barberia.id_barberia === body.id_barberia)
    if (!linkedUser || !branch) return
    const newBarber: Barbero = {
      ...body,
      id_barbero: nextId(barberos, "id_barbero"),
      estado: "Disponible",
      barbero_nombre: linkedUser.nombre,
      barbero_correo: linkedUser.correo,
      barbero_telefono: linkedUser.telefono,
      barberia_nombre: branch.nombre,
    }
    setBarberos((current) => [...current, newBarber])
    notify("El perfil del barbero quedó asociado a su sede.")
  }

  function updateBarbero(id: number, changes: BarberoUpdate) {
    const branch = barberias.find((item) => item.id_barberia === changes.id_barberia)
    setBarberos((current) => current.map((item) => item.id_barbero === id
      ? { ...item, ...changes, ...(branch ? { barberia_nombre: branch.nombre } : {}) }
      : item,
    ))
    notify("El perfil del barbero se actualizó.")
  }

  function deleteBarbero(id: number) {
    setBarberos((current) => current.filter((item) => item.id_barbero !== id))
    notify("El perfil del barbero se eliminó.")
  }

  function createServicio(body: ServicioCreate) {
    const newService: Servicio = { ...body, id_servicio: nextId(servicios, "id_servicio") }
    setServicios((current) => [...current, newService])
    notify("El servicio se agregó a la carta.")
  }

  function createHorario(body: HorarioCreate) {
    const newSchedule: Horario = { ...body, id_horario: nextId(horarios, "id_horario") }
    setHorarios((current) => [...current, newSchedule])
    notify("El horario se agregó a la sede.")
  }

  function createAppointment(body: CitaCreate) {
    const newAppointment: Cita = {
      ...body,
      id_cita: nextId(citas, "id_cita"),
      estado: "Pendiente",
    }
    setCitas((current) => [...current, newAppointment])
    notify("Cita agendada. Quedó pendiente de confirmación.")
  }

  function createUsuario(body: UsuarioCreate) {
    const idUsuario = nextId(usuarios, "id_usuario")
    const newUser: UsuarioGestion = {
      ...body,
      id_usuario: idUsuario,
      password: null,
      ultimo_login: null,
    }
    setUsuarios((current) => [...current, newUser])
    if (body.rol === "Cliente") {
      setClientes((current) => [...current, {
        id_cliente: nextId(clientes, "id_cliente"),
        id_usuario: idUsuario,
        fecha_registro: new Date().toISOString().slice(0, 10),
        nombre: body.nombre,
        correo: body.correo,
        telefono: body.telefono,
        estado: body.estado,
      }])
    }
    notify("El usuario se creó en la maqueta.")
  }

  function updateUsuario(id: number, changes: UsuarioUpdate) {
    setUsuarios((current) => current.map((item) => item.id_usuario === id ? { ...item, ...changes, password: null } : item))
    setClientes((current) => current.map((item) => {
      const account = usuarios.find((usuario) => usuario.id_usuario === item.id_usuario)
      if (account?.id_usuario !== id) return item
      return { ...item, nombre: changes.nombre ?? item.nombre, correo: changes.correo ?? item.correo, telefono: changes.telefono ?? item.telefono, estado: changes.estado ?? item.estado }
    }))
    setBarberos((current) => current.map((item) => {
      if (item.id_usuario !== id) return item
      return {
        ...item,
        barbero_nombre: changes.nombre ?? item.barbero_nombre,
        barbero_correo: changes.correo ?? item.barbero_correo,
        barbero_telefono: changes.telefono ?? item.barbero_telefono,
      }
    }))
    notify("La cuenta se actualizó.")
  }

  function deleteUsuario(id: number) {
    setUsuarios((current) => current.filter((item) => item.id_usuario !== id))
    const client = clientes.find((item) => item.id_usuario === id)
    if (client) setClientes((current) => current.filter((item) => item.id_usuario !== id))
    const barber = barberos.find((item) => item.id_usuario === id)
    if (barber) setBarberos((current) => current.filter((item) => item.id_usuario !== id))
    notify("La cuenta se eliminó de la maqueta.")
  }

  function createRole(body: RolCreate) {
    if (roles.some((role) => role.nombre.toLowerCase() === body.nombre.toLowerCase())) {
      notify("Ya existe un rol con ese nombre.", true)
      return
    }
    setRoles((current) => [...current, { ...body, id_rol: nextId(roles, "id_rol") }])
    notify("El rol se agregó al catálogo.")
  }

  function updateRole(id: number, changes: Partial<RolCatalogo>) {
    setRoles((current) => current.map((item) => item.id_rol === id ? { ...item, ...changes } : item))
    notify("El rol se actualizó.")
  }

  function deleteRole(id: number) {
    if (usuarios.some((usuario) => usuario.id_rol === id)) {
      notify("No se puede eliminar un rol que tiene cuentas asociadas.", true)
      return
    }
    setRoles((current) => current.filter((item) => item.id_rol !== id))
    notify("El rol se eliminó.")
  }

  function updateAppointment(id: number, status: EstadoCita) {
    setCitas((current) => current.map((item) => item.id_cita === id ? { ...item, estado: status } : item))
    notify(status === "Atendida" ? "Cita marcada como atendida." : "La cita se marcó como no asistida.")
  }

  function updateProfile(changes: { nombre: string; telefono: string }) {
    if (!user) return
    setUser((current) => current ? { ...current, ...changes } : current)
    setUsuarios((current) => current.map((item) => item.id_usuario === user.id_usuario ? { ...item, ...changes } : item))
    setClientes((current) => current.map((item) => item.id_usuario === user.id_usuario ? { ...item, ...changes } : item))
    setBarberos((current) => current.map((item) => item.id_usuario === user.id_usuario ? {
      ...item,
      barbero_nombre: changes.nombre,
      barbero_telefono: changes.telefono,
    } : item))
    notify("Tu perfil se actualizó.")
  }

  return (
    <div className="min-h-screen">
      <SiteHeader
        mode={mode}
        user={user}
        apiSession={Boolean(apiToken)}
        onModeChange={handleModeChange}
        onLogin={() => setAuthOpen(true)}
        onLogout={handleLogout}
        onHome={() => setMode("public")}
        onBook={openBooking}
      />

      {mode === "public" ? (
        <PublicHome
          barberias={barberias}
          barberos={barberos}
          servicios={servicios}
          horarios={horarios}
          onBook={openBooking}
          onLogin={() => setAuthOpen(true)}
        />
      ) : null}

      {mode === "Cliente" && user?.rol === "Cliente" ? (
        <ClientPanel
          user={user}
          initialSection={clientInitialSection}
          barberias={barberias}
          barberos={barberos}
          servicios={servicios}
          horarios={horarios}
          citas={citas}
          clientes={clientes}
          onCreateAppointment={createAppointment}
          onUpdateProfile={updateProfile}
        />
      ) : null}

      {mode === "Barbero" && user?.rol === "Barbero" ? (
        <BarberPanel
          user={user}
          barberias={barberias}
          barberos={barberos}
          servicios={servicios}
          citas={citas}
          clientes={clientes}
          onUpdateBarber={updateBarbero}
          onUpdateAppointment={updateAppointment}
        />
      ) : null}

      {mode === "Administrador" && user?.rol === "Administrador" ? (
        <AdminPanel
          userId={user.id_usuario}
          userName={user.nombre}
          barberias={barberias}
          barberos={barberos}
          servicios={servicios}
          horarios={horarios}
          usuarios={usuarios}
          clientes={clientes}
          citas={citas}
          roles={roles}
          onCreateBarberia={createBarberia}
          onUpdateBarberia={updateBarberia}
          onDeleteBarberia={deleteBarberia}
          onCreateBarbero={createBarbero}
          onUpdateBarbero={updateBarbero}
          onDeleteBarbero={deleteBarbero}
          onCreateServicio={createServicio}
          onCreateHorario={createHorario}
          onCreateCita={createAppointment}
          onCreateUsuario={createUsuario}
          onUpdateUsuario={updateUsuario}
          onDeleteUsuario={deleteUsuario}
          onCreateRole={createRole}
          onUpdateRole={updateRole}
          onDeleteRole={deleteRole}
          onUpdateAppointment={updateAppointment}
        />
      ) : null}

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {notice ? (
        <div
          key={notice.id}
          role={notice.error ? "alert" : "status"}
          aria-live={notice.error ? "assertive" : "polite"}
          className="fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-white/12 bg-popover px-4 py-3 text-sm text-foreground shadow-2xl shadow-black/40 sm:right-6 sm:bottom-6"
        >
          {notice.error ? <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />}
          <span>{notice.message}</span>
        </div>
      ) : null}
    </div>
  )
}
