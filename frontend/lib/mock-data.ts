import type {
  Barbero,
  Barberia,
  Cita,
  Cliente,
  DiaSemana,
  Horario,
  RolCatalogo,
  Servicio,
  UsuarioAuth,
  UsuarioGestion,
  RolUsuario,
} from "@/lib/api"

function dateOffset(offset: number) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const demoAccounts: Record<RolUsuario, UsuarioAuth> = {
  Administrador: {
    id_usuario: 1,
    nombre: "Valentina Cruz",
    correo: "admin@barberia.com",
    telefono: "+57 312 450 8910",
    rol: "Administrador",
    id_rol: 1,
    id_cliente: null,
    id_barbero: null,
    id_barberia: 1,
  },
  Barbero: {
    id_usuario: 2,
    nombre: "Mateo Rivas",
    correo: "barbero@barberia.com",
    telefono: "+57 310 420 5060",
    rol: "Barbero",
    id_rol: 2,
    id_cliente: null,
    id_barbero: 101,
    id_barberia: 1,
  },
  Cliente: {
    id_usuario: 3,
    nombre: "Emilia Torres",
    correo: "cliente@barberia.com",
    telefono: "+57 300 303 4010",
    rol: "Cliente",
    id_rol: 3,
    id_cliente: 201,
    id_barbero: null,
    id_barberia: null,
  },
}

const today = dateOffset(0)

const barberias: Barberia[] = [
  {
    id_barberia: 1,
    id_admin: 1,
    nombre: "Navaja · Carepa",
    direccion: "Calle 80 #65-20, Centro, Carepa, Antioquia",
    telefono: "+57 312 450 8910",
    descripcion: "Un refugio para el corte impecable, el buen café y las conversaciones sin prisa en Carepa.",
    estado: "Activa",
  },
  {
    id_barberia: 2,
    id_admin: 1,
    nombre: "Navaja · Apartadó",
    direccion: "Cra 100 #95-30, Barrio Ortiz, Apartadó, Antioquia",
    telefono: "+57 320 670 4520",
    descripcion: "Técnica contemporánea, ritual clásico y una silla siempre lista para ti en Apartadó.",
    estado: "Activa",
  },
]

const barberos: Barbero[] = [
  {
    id_barbero: 101,
    id_usuario: 2,
    id_barberia: 1,
    especialidad: "Degradados y tijera",
    estado: "Disponible",
    barbero_nombre: "Mateo Rivas",
    barbero_correo: "barbero@barberia.com",
    barbero_telefono: "+57 310 420 5060",
    barberia_nombre: "Navaja · Carepa",
  },
  {
    id_barbero: 102,
    id_usuario: 4,
    id_barberia: 1,
    especialidad: "Barba clásica y perfilado",
    estado: "Disponible",
    barbero_nombre: "Gael Ortega",
    barbero_correo: "gael@barberia.com",
    barbero_telefono: "+57 311 206 7080",
    barberia_nombre: "Navaja · Carepa",
  },
  {
    id_barbero: 103,
    id_usuario: 5,
    id_barberia: 2,
    especialidad: "Corte clásico y diseño",
    estado: "No disponible",
    barbero_nombre: "Santiago Luna",
    barbero_correo: "santiago@barberia.com",
    barbero_telefono: "+57 314 407 8010",
    barberia_nombre: "Navaja · Apartadó",
  },
  {
    id_barbero: 104,
    id_usuario: 6,
    id_barberia: 2,
    especialidad: "Afeitado tradicional",
    estado: "Disponible",
    barbero_nombre: "Diego Salas",
    barbero_correo: "diego@barberia.com",
    barbero_telefono: "+57 318 503 9010",
    barberia_nombre: "Navaja · Apartadó",
  },
]

const servicios: Servicio[] = [
  {
    id_servicio: 301,
    id_barberia: 1,
    nombre: "Corte de autor",
    descripcion: "Corte a tijera o máquina, lavado y acabado con producto.",
    precio: 25000,
    duracion_minutos: 45,
    estado: "Activo",
  },
  {
    id_servicio: 302,
    id_barberia: 1,
    nombre: "Corte + barba",
    descripcion: "Corte completo y diseño de barba con toalla caliente.",
    precio: 40000,
    duracion_minutos: 75,
    estado: "Activo",
  },
  {
    id_servicio: 303,
    id_barberia: 1,
    nombre: "Afeitado clásico",
    descripcion: "Ritual de afeitado con navaja, espuma y compresa tibia.",
    precio: 20000,
    duracion_minutos: 40,
    estado: "Activo",
  },
  {
    id_servicio: 304,
    id_barberia: 2,
    nombre: "Corte ejecutivo",
    descripcion: "Un corte limpio y versátil, pensado para acompañarte toda la semana.",
    precio: 28000,
    duracion_minutos: 45,
    estado: "Activo",
  },
  {
    id_servicio: 305,
    id_barberia: 2,
    nombre: "Perfilado de barba",
    descripcion: "Diseño, definición de contornos y acabado hidratante.",
    precio: 18000,
    duracion_minutos: 35,
    estado: "Activo",
  },
]

const dayNames: DiaSemana[] = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
]

const horarios: Horario[] = barberias.flatMap((barberia) =>
  dayNames.map((dia_semana, index) => {
    const domingo = index === 6
    const sabado = index === 5
    const condesa = barberia.id_barberia === 2
    return {
      id_horario: barberia.id_barberia * 1000 + index + 1,
      id_barberia: barberia.id_barberia,
      dia_semana,
      hora_apertura: domingo ? "10:00:00" : condesa && index < 5 ? "10:00:00" : "09:00:00",
      hora_cierre: domingo ? "15:00:00" : sabado ? "18:00:00" : condesa ? "20:00:00" : "19:00:00",
    }
  }),
)

const usuarios: UsuarioGestion[] = [
  {
    id_usuario: 1,
    id_rol: 1,
    rol: "Administrador",
    nombre: "Valentina Cruz",
    correo: "admin@barberia.com",
    telefono: "+57 312 450 8910",
    password: null,
    estado: "Activo",
    ultimo_login: new Date().toISOString(),
  },
  {
    id_usuario: 2,
    id_rol: 2,
    rol: "Barbero",
    nombre: "Mateo Rivas",
    correo: "barbero@barberia.com",
    telefono: "+57 310 420 5060",
    password: null,
    estado: "Activo",
    ultimo_login: new Date().toISOString(),
  },
  {
    id_usuario: 3,
    id_rol: 3,
    rol: "Cliente",
    nombre: "Emilia Torres",
    correo: "cliente@barberia.com",
    telefono: "+57 300 303 4010",
    password: null,
    estado: "Activo",
    ultimo_login: new Date().toISOString(),
  },
  {
    id_usuario: 4,
    id_rol: 2,
    rol: "Barbero",
    nombre: "Gael Ortega",
    correo: "gael@barberia.com",
    telefono: "+57 311 206 7080",
    password: null,
    estado: "Activo",
    ultimo_login: null,
  },
  {
    id_usuario: 5,
    id_rol: 2,
    rol: "Barbero",
    nombre: "Santiago Luna",
    correo: "santiago@barberia.com",
    telefono: "+57 314 407 8010",
    password: null,
    estado: "Activo",
    ultimo_login: null,
  },
  {
    id_usuario: 6,
    id_rol: 2,
    rol: "Barbero",
    nombre: "Diego Salas",
    correo: "diego@barberia.com",
    telefono: "+57 318 503 9010",
    password: null,
    estado: "Activo",
    ultimo_login: null,
  },
  {
    id_usuario: 7,
    id_rol: 3,
    rol: "Cliente",
    nombre: "Nicolás Herrera",
    correo: "nicolas@email.com",
    telefono: "+57 315 603 8010",
    password: null,
    estado: "Activo",
    ultimo_login: null,
  },
]

const clientes: Cliente[] = [
  {
    id_cliente: 201,
    id_usuario: 3,
    fecha_registro: "2025-08-12",
    nombre: "Emilia Torres",
    correo: "cliente@barberia.com",
    telefono: "+57 300 303 4010",
    estado: "Activo",
  },
  {
    id_cliente: 202,
    id_usuario: 7,
    fecha_registro: "2025-10-04",
    nombre: "Nicolás Herrera",
    correo: "nicolas@email.com",
    telefono: "+57 315 603 8010",
    estado: "Activo",
  },
  {
    id_cliente: 203,
    id_usuario: 8,
    fecha_registro: "2025-11-18",
    nombre: "Andrés Medina",
    correo: "andres@email.com",
    telefono: "+57 316 706 2090",
    estado: "Activo",
  },
  {
    id_cliente: 204,
    id_usuario: 9,
    fecha_registro: "2026-01-26",
    nombre: "Mariana Solís",
    correo: "mariana@email.com",
    telefono: "+57 317 802 6010",
    estado: "Activo",
  },
]

const citas: Cita[] = [
  {
    id_cita: 501,
    id_barberia: 1,
    id_cliente: 201,
    id_barbero: 101,
    id_servicio: 301,
    fecha: today,
    hora: "10:30:00",
    estado: "Confirmada",
    observaciones: "Degradado bajo, conservar largo arriba.",
  },
  {
    id_cita: 502,
    id_barberia: 1,
    id_cliente: 201,
    id_barbero: 102,
    id_servicio: 302,
    fecha: dateOffset(-12),
    hora: "11:00:00",
    estado: "Atendida",
    observaciones: "Primera visita.",
  },
  {
    id_cita: 503,
    id_barberia: 2,
    id_cliente: 202,
    id_barbero: 104,
    id_servicio: 305,
    fecha: today,
    hora: "12:00:00",
    estado: "Pendiente",
    observaciones: "Mantener el contorno natural.",
  },
  {
    id_cita: 504,
    id_barberia: 1,
    id_cliente: 203,
    id_barbero: 101,
    id_servicio: 301,
    fecha: dateOffset(1),
    hora: "13:00:00",
    estado: "Confirmada",
    observaciones: "Corte clásico, laterales cortos.",
  },
  {
    id_cita: 505,
    id_barberia: 2,
    id_cliente: 204,
    id_barbero: 104,
    id_servicio: 304,
    fecha: dateOffset(0),
    hora: "15:00:00",
    estado: "Confirmada",
    observaciones: "Sin observaciones.",
  },
  {
    id_cita: 506,
    id_barberia: 1,
    id_cliente: 201,
    id_barbero: 101,
    id_servicio: 302,
    fecha: dateOffset(3),
    hora: "11:30:00",
    estado: "Pendiente",
    observaciones: "Corte y barba, por favor.",
  },
  {
    id_cita: 507,
    id_barberia: 2,
    id_cliente: 202,
    id_barbero: 103,
    id_servicio: 303,
    fecha: dateOffset(-2),
    hora: "16:30:00",
    estado: "Cancelada",
    observaciones: null,
  },
]

const roles: RolCatalogo[] = [
  { id_rol: 1, nombre: "Administrador" },
  { id_rol: 2, nombre: "Barbero" },
  { id_rol: 3, nombre: "Cliente" },
]

export const demoData = {
  barberias,
  barberos,
  servicios,
  horarios,
  usuarios,
  clientes,
  citas,
  roles,
}
