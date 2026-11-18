const { pool } = require("../db");

async function obtenerTodos() {
  const { rows } = await pool.query("SELECT * FROM roles ORDER BY id_rol");
  return rows;
}

async function obtenerPorId(id) {
  const { rows } = await pool.query("SELECT * FROM roles WHERE id_rol = $1", [id]);
  return rows[0] || null;
}

async function crear({ nombre }) {
  const { rows } = await pool.query(
    "INSERT INTO roles (nombre) VALUES ($1) RETURNING *",
    [nombre]
  );
  return rows[0];
}

async function actualizar(id, { nombre }) {
  const { rows } = await pool.query(
    "UPDATE roles SET nombre = COALESCE($1, nombre) WHERE id_rol = $2 RETURNING *",
    [nombre, id]
  );
  return rows[0] || null;
}

async function eliminar(id) {
  const { rows } = await pool.query(
    "DELETE FROM roles WHERE id_rol = $1 RETURNING *",
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
