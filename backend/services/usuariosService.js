const { pool } = require("../db");
const bcrypt = require("bcryptjs");

async function obtenerTodos() {
  const { rows } = await pool.query(
    `SELECT u.id_usuario, u.id_rol, r.nombre AS rol, u.nombre, u.correo, u.telefono, u.estado, u.created_at, u.ultimo_login
     FROM usuarios u
     LEFT JOIN roles r ON u.id_rol = r.id_rol
     ORDER BY u.id_usuario`
  );
  return rows;
}

async function obtenerPorId(id) {
  const { rows } = await pool.query(
    `SELECT u.id_usuario, u.id_rol, r.nombre AS rol, u.nombre, u.correo, u.telefono, u.estado, u.created_at, u.ultimo_login
     FROM usuarios u
     LEFT JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.id_usuario = $1`,
    [id]
  );
  return rows[0] || null;
}

async function crear({ id_rol, nombre, correo, telefono, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO usuarios (id_rol, nombre, correo, telefono, password)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_usuario, id_rol, nombre, correo, telefono, estado, created_at`,
    [id_rol, nombre, correo, telefono, hashedPassword]
  );
  return rows[0];
}

async function actualizar(id, { id_rol, nombre, correo, telefono, password, estado }) {
  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const { rows } = await pool.query(
    `UPDATE usuarios
     SET id_rol = COALESCE($1, id_rol),
         nombre = COALESCE($2, nombre),
         correo = COALESCE($3, correo),
         telefono = COALESCE($4, telefono),
         password = COALESCE($5, password),
         estado = COALESCE($6, estado)
     WHERE id_usuario = $7
     RETURNING id_usuario, id_rol, nombre, correo, telefono, estado, created_at, ultimo_login`,
    [id_rol, nombre, correo, telefono, hashedPassword, estado, id]
  );
  return rows[0] || null;
}

async function eliminar(id) {
  const { rows } = await pool.query(
    "DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario, nombre, correo",
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
