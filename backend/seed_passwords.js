require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

async function main() {
  const pA = await bcrypt.hash('admin123', 10);
  await pool.query('UPDATE usuarios SET password = $1 WHERE correo = $2', [pA, 'admin@barberia.com']);

  const pB = await bcrypt.hash('barbero123', 10);
  const rB = await pool.query(
    `INSERT INTO usuarios (id_rol, nombre, correo, telefono, password, estado)
     VALUES (2, 'Mateo Rivas', 'barbero@barberia.com', '3104205060', $1, 'Activo')
     ON CONFLICT (correo) DO UPDATE SET password = $1 RETURNING id_usuario`,
    [pB]
  );
  await pool.query(
    `INSERT INTO barberos (id_usuario, id_barberia, especialidad, estado)
     VALUES ($1, 1, 'Degradados y tijera', 'Disponible')
     ON CONFLICT (id_usuario) DO NOTHING`,
    [rB.rows[0].id_usuario]
  );

  const pC = await bcrypt.hash('cliente123', 10);
  const rC = await pool.query(
    `INSERT INTO usuarios (id_rol, nombre, correo, telefono, password, estado)
     VALUES (3, 'Emilia Torres', 'cliente@barberia.com', '3003034010', $1, 'Activo')
     ON CONFLICT (correo) DO UPDATE SET password = $1 RETURNING id_usuario`,
    [pC]
  );
  await pool.query(
    `INSERT INTO clientes (id_usuario)
     VALUES ($1)
     ON CONFLICT (id_usuario) DO NOTHING`,
    [rC.rows[0].id_usuario]
  );

  console.log('SEED COMPLETE');
  await pool.end();
}

main().catch(err => {
  console.error('SEED ERROR:', err);
  process.exit(1);
});
