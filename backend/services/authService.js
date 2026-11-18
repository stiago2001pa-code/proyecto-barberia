const { pool } = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function login(correo, password) {
  if (!correo || !password) {
    const error = new Error("Correo y contraseña son obligatorios");
    error.status = 400;
    throw error;
  }

  // 1. Buscar usuario e información de rol
  const { rows } = await pool.query(
    `SELECT u.id_usuario, u.id_rol, r.nombre AS rol, u.nombre, u.correo, u.telefono, u.password, u.estado
     FROM usuarios u
     INNER JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.correo = $1`,
    [correo.toLowerCase().trim()]
  );

  const usuario = rows[0];
  if (!usuario) {
    const error = new Error("Credenciales inválidas");
    error.status = 401;
    throw error;
  }

  if (usuario.estado !== "Activo") {
    const error = new Error("Tu cuenta se encuentra inactiva. Contacta al administrador.");
    error.status = 403;
    throw error;
  }

  // 2. Verificar contraseña
  const passwordValido = await bcrypt.compare(password, usuario.password);
  if (!passwordValido) {
    const error = new Error("Credenciales inválidas");
    error.status = 401;
    throw error;
  }

  // 3. Actualizar fecha de último login
  await pool.query(
    "UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id_usuario = $1",
    [usuario.id_usuario]
  );

  // 4. Obtener identificadores relacionados según el rol
  let id_cliente = null;
  let id_barbero = null;
  let id_barberia = null;

  if (usuario.rol === "Cliente") {
    const resCli = await pool.query(
      "SELECT id_cliente FROM clientes WHERE id_usuario = $1",
      [usuario.id_usuario]
    );
    id_cliente = resCli.rows[0]?.id_cliente || null;
  } else if (usuario.rol === "Barbero") {
    const resBar = await pool.query(
      "SELECT id_barbero, id_barberia FROM barberos WHERE id_usuario = $1",
      [usuario.id_usuario]
    );
    if (resBar.rows[0]) {
      id_barbero = resBar.rows[0].id_barbero;
      id_barberia = resBar.rows[0].id_barberia;
    }
  } else if (usuario.rol === "Administrador") {
    const resAdmin = await pool.query(
      "SELECT id_barberia FROM barberias WHERE id_admin = $1 LIMIT 1",
      [usuario.id_usuario]
    );
    id_barberia = resAdmin.rows[0]?.id_barberia || null;
  }

  // 5. Generar Token JWT
  const payload = {
    id_usuario: usuario.id_usuario,
    correo: usuario.correo,
    nombre: usuario.nombre,
    rol: usuario.rol,
    id_rol: usuario.id_rol,
    id_cliente,
    id_barbero,
    id_barberia,
  };

  const secret = process.env.JWT_SECRET || "default_secret";
  const expiresIn = process.env.JWT_EXPIRES_IN || "8h";

  const token = jwt.sign(payload, secret, { expiresIn });

  return {
    mensaje: "Inicio de sesión exitoso",
    token,
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      telefono: usuario.telefono,
      rol: usuario.rol,
      id_rol: usuario.id_rol,
      id_cliente,
      id_barbero,
      id_barberia,
    },
  };
}

async function registro({ nombre, correo, telefono, password, id_rol }) {
  if (!nombre || !correo || !password) {
    const error = new Error("Nombre, correo y contraseña son obligatorios");
    error.status = 400;
    throw error;
  }

  const correoNormalizado = correo.toLowerCase().trim();

  // 1. Verificar si el correo ya existe
  const usuarioExistente = await pool.query(
    "SELECT id_usuario FROM usuarios WHERE correo = $1",
    [correoNormalizado]
  );
  if (usuarioExistente.rowCount > 0) {
    const error = new Error("El correo electrónico ya se encuentra registrado");
    error.status = 409;
    throw error;
  }

  // 2. Si no se especificó rol, se asigna el rol de 'Cliente' por defecto
  let rolId = id_rol;
  let nombreRol = "Cliente";

  if (!rolId) {
    const rolRes = await pool.query("SELECT id_rol FROM roles WHERE nombre = 'Cliente'");
    if (rolRes.rowCount > 0) {
      rolId = rolRes.rows[0].id_rol;
    } else {
      // Si por alguna razón no existe, usar 3 o el primero
      rolId = 3;
    }
  } else {
    const rolRes = await pool.query("SELECT nombre FROM roles WHERE id_rol = $1", [rolId]);
    if (rolRes.rowCount > 0) {
      nombreRol = rolRes.rows[0].nombre;
    }
  }

  // 3. Hashear contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Crear usuario en la base de datos
  const { rows } = await pool.query(
    `INSERT INTO usuarios (id_rol, nombre, correo, telefono, password, estado, ultimo_login)
     VALUES ($1, $2, $3, $4, $5, 'Activo', CURRENT_TIMESTAMP)
     RETURNING id_usuario, id_rol, nombre, correo, telefono, estado, created_at`,
    [rolId, nombre, correoNormalizado, telefono || null, hashedPassword]
  );

  const nuevoUsuario = rows[0];
  let id_cliente = null;

  // 5. Si es Cliente, crear automáticamente el registro en la tabla clientes
  if (nombreRol === "Cliente") {
    const clienteRes = await pool.query(
      "INSERT INTO clientes (id_usuario) VALUES ($1) RETURNING id_cliente",
      [nuevoUsuario.id_usuario]
    );
    id_cliente = clienteRes.rows[0]?.id_cliente || null;
  }

  // 6. Generar JWT para que quede logueado automáticamente
  const payload = {
    id_usuario: nuevoUsuario.id_usuario,
    correo: nuevoUsuario.correo,
    nombre: nuevoUsuario.nombre,
    rol: nombreRol,
    id_rol: nuevoUsuario.id_rol,
    id_cliente,
    id_barbero: null,
    id_barberia: null,
  };

  const secret = process.env.JWT_SECRET || "default_secret";
  const expiresIn = process.env.JWT_EXPIRES_IN || "8h";
  const token = jwt.sign(payload, secret, { expiresIn });

  return {
    mensaje: "Registro exitoso",
    token,
    usuario: {
      id_usuario: nuevoUsuario.id_usuario,
      nombre: nuevoUsuario.nombre,
      correo: nuevoUsuario.correo,
      telefono: nuevoUsuario.telefono,
      rol: nombreRol,
      id_rol: nuevoUsuario.id_rol,
      id_cliente,
      created_at: nuevoUsuario.created_at,
    },
  };
}

async function obtenerPerfil(id_usuario) {
  const { rows } = await pool.query(
    `SELECT u.id_usuario, u.id_rol, r.nombre AS rol, u.nombre, u.correo, u.telefono, u.estado,
            u.created_at, u.ultimo_login,
            c.id_cliente,
            b.id_barbero, b.id_barberia AS id_barberia_barbero,
            admin_bar.id_barberia AS id_barberia_administrada
     FROM usuarios u
     LEFT JOIN roles r ON u.id_rol = r.id_rol
     LEFT JOIN clientes c ON u.id_usuario = c.id_usuario
     LEFT JOIN barberos b ON u.id_usuario = b.id_usuario
     LEFT JOIN barberias admin_bar ON u.id_usuario = admin_bar.id_admin
     WHERE u.id_usuario = $1`,
    [id_usuario]
  );

  return rows[0] || null;
}

module.exports = {
  login,
  registro,
  obtenerPerfil,
};
