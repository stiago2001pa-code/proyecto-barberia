const { pool } = require("../db");

async function obtenerTodos() {
  const { rows } = await pool.query(`
    SELECT b.id_barbero, b.id_usuario, b.id_barberia, b.especialidad, b.estado,
           u.nombre AS barbero_nombre, u.correo AS barbero_correo, u.telefono AS barbero_telefono,
           bar.nombre AS barberia_nombre
    FROM barberos b
    LEFT JOIN usuarios u ON b.id_usuario = u.id_usuario
    LEFT JOIN barberias bar ON b.id_barberia = bar.id_barberia
    ORDER BY b.id_barbero
  `);
  return rows;
}

async function obtenerPorId(id) {
  const { rows } = await pool.query(
    `
    SELECT b.id_barbero, b.id_usuario, b.id_barberia, b.especialidad, b.estado,
           u.nombre AS barbero_nombre, u.correo AS barbero_correo, u.telefono AS barbero_telefono,
           bar.nombre AS barberia_nombre
    FROM barberos b
    LEFT JOIN usuarios u ON b.id_usuario = u.id_usuario
    LEFT JOIN barberias bar ON b.id_barberia = bar.id_barberia
    WHERE b.id_barbero = $1
    `,
    [id]
  );
  return rows[0] || null;
}

async function crear({ id_usuario, id_barberia, especialidad }) {
  const { rows } = await pool.query(
    `INSERT INTO barberos (id_usuario, id_barberia, especialidad)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [id_usuario, id_barberia, especialidad]
  );
  return rows[0];
}

async function actualizar(id, { id_usuario, id_barberia, especialidad, estado }) {
  const { rows } = await pool.query(
    `UPDATE barberos
     SET id_usuario = COALESCE($1, id_usuario),
         id_barberia = COALESCE($2, id_barberia),
         especialidad = COALESCE($3, especialidad),
         estado = COALESCE($4, estado)
     WHERE id_barbero = $5
     RETURNING *`,
    [id_usuario, id_barberia, especialidad, estado, id]
  );
  return rows[0] || null;
}

async function eliminar(id) {
  const { rows } = await pool.query(
    "DELETE FROM barberos WHERE id_barbero = $1 RETURNING *",
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
