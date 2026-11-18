const { Pool } = require("pg");

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

const pool = new Pool(poolConfig);

async function crearTablas() {
  const esquemaViejo = await pool.query(`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'servicios'
      AND column_name = 'id'
  `);

  if (esquemaViejo.rowCount > 0) {
    await pool.query("DROP TABLE IF EXISTS citas CASCADE");
    await pool.query("DROP TABLE IF EXISTS servicios CASCADE");
  }

  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE estado_usuario AS ENUM ('Activo', 'Inactivo');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE estado_barberia AS ENUM ('Activa', 'Inactiva');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE estado_barbero AS ENUM ('Disponible', 'No disponible');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE estado_servicio AS ENUM ('Activo', 'Inactivo');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE dia_semana AS ENUM (
        'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE estado_cita AS ENUM (
        'Pendiente', 'Confirmada', 'Atendida', 'Cancelada', 'No asistio'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS roles (
      id_rol SERIAL PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario SERIAL PRIMARY KEY,
      id_rol INT NOT NULL,
      nombre VARCHAR(100) NOT NULL,
      correo VARCHAR(100) NOT NULL UNIQUE,
      telefono VARCHAR(20),
      password VARCHAR(255) NOT NULL,
      estado estado_usuario DEFAULT 'Activo',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ultimo_login TIMESTAMP,
      FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
    );

    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMP;

    CREATE TABLE IF NOT EXISTS barberias (
      id_barberia SERIAL PRIMARY KEY,
      id_admin INT NOT NULL,
      nombre VARCHAR(100) NOT NULL,
      direccion VARCHAR(200) NOT NULL,
      telefono VARCHAR(20),
      descripcion TEXT,
      estado estado_barberia DEFAULT 'Activa',
      FOREIGN KEY (id_admin) REFERENCES usuarios(id_usuario)
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id_cliente SERIAL PRIMARY KEY,
      id_usuario INT NOT NULL UNIQUE,
      fecha_registro DATE DEFAULT CURRENT_DATE,
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    );

    CREATE TABLE IF NOT EXISTS barberos (
      id_barbero SERIAL PRIMARY KEY,
      id_usuario INT NOT NULL UNIQUE,
      id_barberia INT NOT NULL,
      especialidad VARCHAR(100),
      estado estado_barbero DEFAULT 'Disponible',
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
      FOREIGN KEY (id_barberia) REFERENCES barberias(id_barberia)
    );

    CREATE TABLE IF NOT EXISTS servicios (
      id_servicio SERIAL PRIMARY KEY,
      id_barberia INT NOT NULL,
      nombre VARCHAR(100) NOT NULL,
      descripcion TEXT,
      precio DECIMAL(10,2) NOT NULL,
      duracion_minutos INT NOT NULL,
      estado estado_servicio DEFAULT 'Activo',
      FOREIGN KEY (id_barberia) REFERENCES barberias(id_barberia)
    );

    CREATE TABLE IF NOT EXISTS horarios (
      id_horario SERIAL PRIMARY KEY,
      id_barberia INT NOT NULL,
      dia_semana dia_semana NOT NULL,
      hora_apertura TIME NOT NULL,
      hora_cierre TIME NOT NULL,
      FOREIGN KEY (id_barberia) REFERENCES barberias(id_barberia)
    );

    CREATE TABLE IF NOT EXISTS citas (
      id_cita SERIAL PRIMARY KEY,
      id_barberia INT NOT NULL,
      id_cliente INT NOT NULL,
      id_barbero INT NOT NULL,
      id_servicio INT NOT NULL,
      fecha DATE NOT NULL,
      hora TIME NOT NULL,
      estado estado_cita DEFAULT 'Pendiente',
      observaciones VARCHAR(255),
      FOREIGN KEY (id_barberia) REFERENCES barberias(id_barberia),
      FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
      FOREIGN KEY (id_barbero) REFERENCES barberos(id_barbero),
      FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
    );

    CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
    CREATE INDEX IF NOT EXISTS idx_citas_barbero ON citas(id_barbero);
    CREATE INDEX IF NOT EXISTS idx_citas_cliente ON citas(id_cliente);
    CREATE INDEX IF NOT EXISTS idx_citas_barberia ON citas(id_barberia);

    INSERT INTO roles (nombre) VALUES
      ('Administrador'),
      ('Barbero'),
      ('Cliente')
    ON CONFLICT (nombre) DO NOTHING;

    INSERT INTO usuarios (id_rol, nombre, correo, telefono, password, estado)
    VALUES (
      1,
      'Juan Admin',
      'admin@barberia.com',
      '3001112233',
      '$2b$10$plWrVmo90NJ6fBKyEStY5O9S/ET24S/ytVgKziOTxUBBytnjPx9BS',
      'Activo'
    )
    ON CONFLICT (correo) DO NOTHING;
  `);
}

module.exports = { pool, crearTablas };
