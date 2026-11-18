export type RolUsuario = "Administrador" | "Barbero" | "Cliente"
export type VistaApp = "public" | RolUsuario
export type EstadoBarberia = "Activa" | "Inactiva"
export type EstadoBarbero = "Disponible" | "No disponible"
export type EstadoServicio = "Activo" | "Inactivo"
export type EstadoCita = "Pendiente" | "Confirmada" | "Atendida" | "Cancelada" | "No asistio"
export type DiaSemana =
  | "Lunes"
  | "Martes"
  | "Miercoles"
  | "Jueves"
  | "Viernes"
  | "Sabado"
  | "Domingo"

export interface UsuarioAuth {
  id_usuario: number
  nombre: string
  correo: string
  telefono: string
  rol: RolUsuario
  id_rol: number
  id_cliente: number | null
  id_barbero: number | null
  id_barberia: number | null
}

export interface UsuarioPerfil {
  id_usuario: number
  id_rol: number
  rol: RolUsuario
  nombre: string
  correo: string
  telefono: string
  estado: "Activo" | "Inactivo"
  id_cliente: number | null
  id_barbero: number | null
  id_barberia_barbero: number | null
  id_barberia_administrada: number | null
}

export interface UsuarioGestion {
  id_usuario: number
  id_rol: number
  rol: RolUsuario
  nombre: string
  correo: string
  telefono: string
  password: string | null
  estado: "Activo" | "Inactivo"
  ultimo_login: string | null
}

export interface Barberia {
  id_barberia: number
  id_admin: number
  nombre: string
  direccion: string
  telefono: string
  descripcion: string
  estado: EstadoBarberia
}

export interface Barbero {
  id_barbero: number
  id_usuario: number
  id_barberia: number
  especialidad: string
  estado: EstadoBarbero
  barbero_nombre: string
  barbero_correo: string
  barbero_telefono: string
  barberia_nombre: string
}

export interface Servicio {
  id_servicio: number
  id_barberia: number
  nombre: string
  descripcion: string
  precio: number
  duracion_minutos: number
  estado: EstadoServicio
}

export interface Horario {
  id_horario: number
  id_barberia: number
  dia_semana: DiaSemana
  hora_apertura: string
  hora_cierre: string
}

export interface Cita {
  id_cita: number
  id_barberia: number
  id_cliente: number
  id_barbero: number
  id_servicio: number
  fecha: string
  hora: string
  estado: EstadoCita
  observaciones: string | null
}

export interface Cliente {
  id_cliente: number
  id_usuario: number
  fecha_registro: string
  nombre: string
  correo: string
  telefono: string
  estado: "Activo" | "Inactivo"
}

export interface RolCatalogo {
  id_rol: number
  nombre: RolUsuario | string
}

export interface AuthResponse {
  mensaje: string
  token: string
  usuario: UsuarioAuth
}

export interface PerfilResponse {
  usuario: UsuarioPerfil
}

export type BarberiaCreate = Omit<Barberia, "id_barberia">
export type BarberoCreate = Pick<Barbero, "id_usuario" | "id_barberia" | "especialidad">
export type BarberoUpdate = Partial<Pick<Barbero, "especialidad" | "estado" | "id_barberia">>
export type ServicioCreate = Omit<Servicio, "id_servicio">
export type HorarioCreate = Omit<Horario, "id_horario">
export type CitaCreate = Omit<Cita, "id_cita" | "estado">
export type UsuarioCreate = Omit<UsuarioGestion, "id_usuario" | "ultimo_login">
export type UsuarioUpdate = Partial<Omit<UsuarioGestion, "id_usuario">>
export type ClienteCreate = Omit<Cliente, "id_cliente">
export type RolCreate = Omit<RolCatalogo, "id_rol">

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "")

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set("Accept", "application/json")

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  })
  const responseText = await response.text()
  const payload: unknown = responseText ? JSON.parse(responseText) : undefined

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "mensaje" in payload
        ? String((payload as { mensaje: unknown }).mensaje)
        : `La solicitud falló (${response.status})`
    throw new Error(message)
  }

  return payload as T
}

const sendJson = (method: string, body?: unknown): RequestInit => ({
  method,
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
})

export const api = {
  auth: {
    login: (body: { correo: string; password: string }) =>
      request<AuthResponse>("/auth/login", sendJson("POST", body)),
    registro: (body: {
      nombre: string
      correo: string
      telefono: string
      password: string
    }) => request<AuthResponse>("/auth/registro", sendJson("POST", body)),
    perfil: (token: string) => request<PerfilResponse>("/auth/perfil", {}, token),
  },
  barberias: {
    list: () => request<Barberia[]>("/barberias"),
    getById: (id: number) => request<Barberia>(`/barberias/${id}`),
    create: (body: BarberiaCreate, token: string) =>
      request<Barberia>("/barberias", sendJson("POST", body), token),
    update: (id: number, body: Partial<Barberia>, token: string) =>
      request<Barberia>(`/barberias/${id}`, sendJson("PUT", body), token),
    delete: (id: number, token: string) =>
      request<unknown>(`/barberias/${id}`, sendJson("DELETE"), token),
  },
  barberos: {
    list: () => request<Barbero[]>("/barberos"),
    getById: (id: number) => request<Barbero>(`/barberos/${id}`),
    create: (body: BarberoCreate, token: string) =>
      request<Barbero>("/barberos", sendJson("POST", body), token),
    update: (id: number, body: BarberoUpdate, token: string) =>
      request<Barbero>(`/barberos/${id}`, sendJson("PUT", body), token),
    delete: (id: number, token: string) =>
      request<unknown>(`/barberos/${id}`, sendJson("DELETE"), token),
  },
  servicios: {
    list: () => request<Servicio[]>("/servicios"),
    create: (body: ServicioCreate, token: string) =>
      request<Servicio>("/servicios", sendJson("POST", body), token),
  },
  horarios: {
    list: () => request<Horario[]>("/horarios"),
    create: (body: HorarioCreate, token: string) =>
      request<Horario>("/horarios", sendJson("POST", body), token),
  },
  citas: {
    list: (token: string) => request<Cita[]>("/citas", {}, token),
    create: (body: CitaCreate, token: string) =>
      request<Cita>("/citas", sendJson("POST", body), token),
  },
  usuarios: {
    list: (token: string) => request<UsuarioGestion[]>("/usuarios", {}, token),
    create: (body: UsuarioCreate, token: string) =>
      request<UsuarioGestion>("/usuarios", sendJson("POST", body), token),
    update: (id: number, body: UsuarioUpdate, token: string) =>
      request<UsuarioGestion>(`/usuarios/${id}`, sendJson("PUT", body), token),
    delete: (id: number, token: string) =>
      request<unknown>(`/usuarios/${id}`, sendJson("DELETE"), token),
  },
  clientes: {
    list: (token: string) => request<Cliente[]>("/clientes", {}, token),
    create: (body: ClienteCreate, token: string) =>
      request<Cliente>("/clientes", sendJson("POST", body), token),
  },
  roles: {
    list: (token: string) => request<RolCatalogo[]>("/roles", {}, token),
    create: (body: RolCreate, token: string) =>
      request<RolCatalogo>("/roles", sendJson("POST", body), token),
    update: (id: number, body: Partial<RolCatalogo>, token: string) =>
      request<RolCatalogo>(`/roles/${id}`, sendJson("PUT", body), token),
    delete: (id: number, token: string) =>
      request<unknown>(`/roles/${id}`, sendJson("DELETE"), token),
  },
}

export { API_BASE_URL }
