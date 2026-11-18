const { pool } = require("../db");

async function obtenerTodos() {
  const { rows } = await pool.query("SELECT * FROM barberias ORDER BY id_barberia");
  return rows;
}

async function obtenerPorId(id) {
  const { rows } = await pool.query("SELECT * FROM barberias WHERE id_barberia = $1", [id]);
  return rows[0] || null;
}

async function crear({ id_admin, nombre, direccion, telefono, descripcion }) {
  const { rows } = await pool.query(
    `INSERT INTO barberias (id_admin, nombre, direccion, telefono, descripcion)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id_admin, nombre, direccion, telefono, descripcion]
  );
  return rows[0];
}

async function actualizar(id, { id_admin, nombre, direccion, telefono, descripcion, estado }) {
  const { rows } = await pool.query(
    `UPDATE barberias
     SET id_admin = COALESCE($1, id_admin),
         nombre = COALESCE($2, nombre),
         direccion = COALESCE($3, direccion),
         telefono = COALESCE($4, telefono),
         descripcion = COALESCE($5, descripcion),
         estado = COALESCE($6, estado)
     WHERE id_barberia = $7
     RETURNING *`,
    [id_admin, nombre, direccion, telefono, descripcion, estado, id]
  );
  return rows[0] || null;
}

async function eliminar(id) {
  const { rows } = await pool.query(
    "DELETE FROM barberias WHERE id_barberia = $1 RETURNING *",
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
