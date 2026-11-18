const { pool } = require("../db");

async function obtenerTodos() {
  const { rows } = await pool.query(`
    SELECT c.id_cliente, c.id_usuario, c.fecha_registro,
           u.nombre, u.correo, u.telefono, u.estado
    FROM clientes c
    LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
    ORDER BY c.id_cliente
  `);
  return rows;
}

async function obtenerPorId(id) {
  const { rows } = await pool.query(
    `
    SELECT c.id_cliente, c.id_usuario, c.fecha_registro,
           u.nombre, u.correo, u.telefono, u.estado
    FROM clientes c
    LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
    WHERE c.id_cliente = $1
    `,
    [id]
  );
  return rows[0] || null;
}

async function crear({ id_usuario }) {
  const { rows } = await pool.query(
    "INSERT INTO clientes (id_usuario) VALUES ($1) RETURNING *",
    [id_usuario]
  );
  return rows[0];
}

async function actualizar(id, { id_usuario }) {
  const { rows } = await pool.query(
    "UPDATE clientes SET id_usuario = COALESCE($1, id_usuario) WHERE id_cliente = $2 RETURNING *",
    [id_usuario, id]
  );
  return rows[0] || null;
}

async function eliminar(id) {
  const { rows } = await pool.query(
    "DELETE FROM clientes WHERE id_cliente = $1 RETURNING *",
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
