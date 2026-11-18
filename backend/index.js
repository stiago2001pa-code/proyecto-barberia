require("dotenv").config();
const express = require("express");
const { pool, crearTablas } = require("./db");

const authService = require("./services/authService");
const rolesService = require("./services/rolesService");
const usuariosService = require("./services/usuariosService");
const barberiasService = require("./services/barberiasService");
const clientesService = require("./services/clientesService");
const barberosService = require("./services/barberosService");
const { verificarToken, autorizarRoles } = require("./middlewares/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Helper para endpoints que todavía no tienen capa de servicio separada
async function listar(res, sql) {
  try {
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function crear(res, sql, valores) {
  try {
    const { rows } = await pool.query(sql, valores);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

app.get("/", (_req, res) => {
  res.json({ mensaje: "API de Barbería funcionando correctamente" });
});

// ==========================================
// 0. AUTENTICACIÓN
// ==========================================
app.post("/auth/registro", async (req, res) => {
  try {
    const data = await authService.registro(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { correo, password } = req.body;
    const data = await authService.login(correo, password);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

app.get("/auth/perfil", verificarToken, async (req, res) => {
  try {
    const perfil = await authService.obtenerPerfil(req.usuario.id_usuario);
    if (!perfil) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({ usuario: perfil });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 1. ROLES
// ==========================================
app.get("/roles", async (_req, res) => {
  try {
    const roles = await rolesService.obtenerTodos();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/roles/:id", async (req, res) => {
  try {
    const rol = await rolesService.obtenerPorId(req.params.id);
    if (!rol) return res.status(404).json({ mensaje: "Rol no encontrado" });
    res.json(rol);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/roles", verificarToken, autorizarRoles("Administrador"), async (req, res) => {
  try {
    const nuevoRol = await rolesService.crear(req.body);
    res.status(201).json(nuevoRol);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/roles/:id", verificarToken, autorizarRoles("Administrador"), async (req, res) => {
  try {
    const rolActualizado = await rolesService.actualizar(req.params.id, req.body);
    if (!rolActualizado) return res.status(404).json({ mensaje: "Rol no encontrado" });
    res.json(rolActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/roles/:id", verificarToken, autorizarRoles("Administrador"), async (req, res) => {
  try {
    const rolEliminado = await rolesService.eliminar(req.params.id);
    if (!rolEliminado) return res.status(404).json({ mensaje: "Rol no encontrado" });
    res.json({ mensaje: "Rol eliminado con éxito", rol: rolEliminado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. USUARIOS
// ==========================================
app.get("/usuarios", verificarToken, autorizarRoles("Administrador"), async (_req, res) => {
  try {
    const usuarios = await usuariosService.obtenerTodos();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/usuarios/:id", verificarToken, async (req, res) => {
  try {
    // Un usuario solo puede verse a sí mismo salvo que sea Administrador
    if (req.usuario.rol !== "Administrador" && req.usuario.id_usuario !== parseInt(req.params.id)) {
      return res.status(403).json({ error: "No tienes permiso para ver este usuario" });
    }
    const usuario = await usuariosService.obtenerPorId(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/usuarios", verificarToken, autorizarRoles("Administrador"), async (req, res) => {
  try {
    const nuevoUsuario = await usuariosService.crear(req.body);
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/usuarios/:id", verificarToken, async (req, res) => {
  try {
    // Un usuario solo puede modificarse a sí mismo salvo que sea Administrador
    if (req.usuario.rol !== "Administrador" && req.usuario.id_usuario !== parseInt(req.params.id)) {
      return res.status(403).json({ error: "No tienes permiso para modificar este usuario" });
    }
    const usuarioActualizado = await usuariosService.actualizar(req.params.id, req.body);
    if (!usuarioActualizado) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    res.json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/usuarios/:id", verificarToken, autorizarRoles("Administrador"), async (req, res) => {
  try {
    const usuarioEliminado = await usuariosService.eliminar(req.params.id);
    if (!usuarioEliminado) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    res.json({ mensaje: "Usuario eliminado con éxito", usuario: usuarioEliminado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. BARBERÍAS
// ==========================================
app.get("/barberias", async (_req, res) => {
  try {
    const barberias = await barberiasService.obtenerTodos();
    res.json(barberias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/barberias/:id", async (req, res) => {
  try {
    const barberia = await barberiasService.obtenerPorId(req.params.id);
    if (!barberia) return res.status(404).json({ mensaje: "Barbería no encontrada" });
    res.json(barberia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/barberias", verificarToken, autorizarRoles("Administrador"), async (req, res) => {
  try {
    const nuevaBarberia = await barberiasService.crear(req.body);
    res.status(201).json(nuevaBarberia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/barberias/:id", verificarToken, autorizarRoles("Administrador"), async (req, res) => {
  try {
    const barberiaActualizada = await barberiasService.actualizar(req.params.id, req.body);
    if (!barberiaActualizada) return res.status(404).json({ mensaje: "Barbería no encontrada" });
    res.json(barberiaActualizada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/barberias/:id", verificarToken, autorizarRoles("Administrador"), async (req, res) => {
  try {
    const barberiaEliminada = await barberiasService.eliminar(req.params.id);
    if (!barberiaEliminada) return res.status(404).json({ mensaje: "Barbería no encontrada" });
    res.json({ mensaje: "Barbería eliminada con éxito", barberia: barberiaEliminada });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. CLIENTES
// ==========================================
app.get("/clientes", verificarToken, autorizarRoles("Administrador", "Barbero"), async (_req, res) => {
  try {
    const clientes = await clientesService.obtenerTodos();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/clientes/:id", verificarToken, async (req, res) => {
  try {
    const cliente = await clientesService.obtenerPorId(req.params.id);
    if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/clientes", verificarToken, autorizarRoles("Administrador"), async (req, res) => {
  try {
    const nuevoCliente = await clientesService.crear(req.body);
    res.status(201).json(nuevoCliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/clientes/:id", verificarToken, autorizarRoles("Administrador"), async (req, res) => {
  try {
    const clienteActualizado = await clientesService.actualizar(req.params.id, req.body);
    if (!clienteActualizado) return res.status(404).json({ mensaje: "Cliente no encontrado" });
    res.json(clienteActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/clientes/:id", verificarToken, autorizarRoles("Administrador"), async (req, res) => {
  try {
    const clienteEliminado = await clientesService.eliminar(req.params.id);
    if (!clienteEliminado) return res.status(404).json({ mensaje: "Cliente no encontrado" });
    res.json({ mensaje: "Cliente eliminado con éxito", cliente: clienteEliminado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. BARBEROS
// ==========================================
app.get("/barberos", async (_req, res) => {
  try {
    const barberos = await barberosService.obtenerTodos();
    res.json(barberos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/barberos/:id", async (req, res) => {
  try {
    const barbero = await barberosService.obtenerPorId(req.params.id);
    if (!barbero) return res.status(404).json({ mensaje: "Barbero no encontrado" });
    res.json(barbero);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/barberos", verificarToken, autorizarRoles("Administrador"), async (req, res) => {
  try {
    const nuevoBarbero = await barberosService.crear(req.body);
    res.status(201).json(nuevoBarbero);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/barberos/:id", verificarToken, autorizarRoles("Administrador", "Barbero"), async (req, res) => {
  try {
    const barberoActualizado = await barberosService.actualizar(req.params.id, req.body);
    if (!barberoActualizado) return res.status(404).json({ mensaje: "Barbero no encontrado" });
    res.json(barberoActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/barberos/:id", verificarToken, autorizarRoles("Administrador"), async (req, res) => {
  try {
    const barberoEliminado = await barberosService.eliminar(req.params.id);
    if (!barberoEliminado) return res.status(404).json({ mensaje: "Barbero no encontrado" });
    res.json({ mensaje: "Barbero eliminado con éxito", barbero: barberoEliminado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. SERVICIOS DE BARBERÍA
// ==========================================
app.get("/servicios", (_req, res) => listar(res, "SELECT * FROM servicios ORDER BY id_servicio"));

app.post("/servicios", verificarToken, autorizarRoles("Administrador"), (req, res) => {
  const { id_barberia, nombre, descripcion, precio, duracion_minutos } = req.body;
  return crear(
    res,
    `INSERT INTO servicios (id_barberia, nombre, descripcion, precio, duracion_minutos)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id_barberia, nombre, descripcion, precio, duracion_minutos]
  );
});

// ==========================================
// 7. HORARIOS
// ==========================================
app.get("/horarios", (_req, res) => listar(res, "SELECT * FROM horarios ORDER BY id_horario"));

app.post("/horarios", verificarToken, autorizarRoles("Administrador"), (req, res) => {
  const { id_barberia, dia_semana, hora_apertura, hora_cierre } = req.body;
  return crear(
    res,
    `INSERT INTO horarios (id_barberia, dia_semana, hora_apertura, hora_cierre)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [id_barberia, dia_semana, hora_apertura, hora_cierre]
  );
});

// ==========================================
// 8. CITAS
// ==========================================
app.get("/citas", verificarToken, async (req, res) => {
  try {
    // Si es Administrador: ve todas las citas
    // Si es Barbero: ve solo las citas asignadas a su barbero
    // Si es Cliente: ve solo sus citas
    let sql = "SELECT * FROM citas ORDER BY fecha DESC, hora DESC";
    let params = [];

    if (req.usuario.rol === "Barbero" && req.usuario.id_barbero) {
      sql = "SELECT * FROM citas WHERE id_barbero = $1 ORDER BY fecha DESC, hora DESC";
      params = [req.usuario.id_barbero];
    } else if (req.usuario.rol === "Cliente" && req.usuario.id_cliente) {
      sql = "SELECT * FROM citas WHERE id_cliente = $1 ORDER BY fecha DESC, hora DESC";
      params = [req.usuario.id_cliente];
    }

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/citas", verificarToken, (req, res) => {
  const { id_barberia, id_barbero, id_servicio, fecha, hora, observaciones } = req.body;
  
  // Si el usuario logueado es Cliente, se puede usar directamente su id_cliente
  const id_cliente = req.usuario.id_cliente || req.body.id_cliente;

  if (!id_cliente) {
    return res.status(400).json({ error: "id_cliente es obligatorio para registrar una cita" });
  }

  return crear(
    res,
    `INSERT INTO citas (id_barberia, id_cliente, id_barbero, id_servicio, fecha, hora, observaciones)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [id_barberia, id_cliente, id_barbero, id_servicio, fecha, hora, observaciones]
  );
});

async function iniciar() {
  await crearTablas();
  app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
  });
}

iniciar().catch((error) => {
  console.error("No se pudo iniciar:", error.message);
  process.exit(1);
});
