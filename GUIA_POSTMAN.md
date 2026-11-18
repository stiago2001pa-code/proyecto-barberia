# 🚀 Guía Completa para Probar la API de Barbería en Postman

Esta guía está diseñada paso a paso para que cualquier persona, incluso sin experiencia previa en **Postman**, pueda probar todos los endpoints del backend, incluyendo el nuevo sistema de **Autenticación con JWT y Roles**.

---

## 📌 Tabla de Contenidos
1. [Paso Previo: Iniciar el Backend](#1-paso-previo-iniciar-el-backend)
2. [Método Rápido: Importar la Colección Lista (Recomendado)](#2-método-rápido-importar-la-colección-lista-recomendado)
3. [Cómo Funciona la Autenticación Automática en Postman](#3-cómo-funciona-la-autenticación-automática-en-postman)
4. [Cómo Usar Postman desde Cero (Paso a Paso)](#4-cómo-usar-postman-desde-cero-paso-a-paso)
5. [⚠️ Orden Recomendado para Probar los Datos](#5-⚠️-orden-recomendado-para-probar-los-datos)
6. [Listado Completo de Endpoints Disponibles](#6-listado-completo-de-endpoints-disponibles)
7. [Solución a Problemas Comunes](#7-solución-a-problemas-comunes)

---

## 1. Paso Previo: Iniciar el Backend

Antes de abrir Postman, el servidor de Node.js y la base de datos PostgreSQL deben estar encendidos.

1. Abre una terminal en la carpeta `backend`:
   ```bash
   cd backend
   ```
2. Inicia el servidor:
   ```bash
   npm run dev
   ```
   *(o con `npm start`)*
3. Deberás ver en la terminal:
   ```text
   Servidor en http://localhost:3000
   ```
> 💡 **Nota:** La URL base de todas las peticiones será: `http://localhost:3000`.

---

## 2. Método Rápido: Importar la Colección Lista (Recomendado)

En la raíz del proyecto se encuentra el archivo **`barberia_postman_collection.json`**, el cual ya contiene **todos los endpoints organizados en carpetas con sus cuerpos JSON de ejemplo y autenticación automática**.

### Pasos para importarlo:
1. Abre **Postman**.
2. En la esquina superior izquierda, haz clic en el botón **`Import`** (o **Importar**).
3. Arrastra el archivo `barberia_postman_collection.json` o haz clic en **`Files`** y selecciónalo.
4. Haz clic en **`Import`**.
5. ¡Listo! En el panel izquierdo verás la colección **"Barberia API"** con todas las carpetas:
   - `0. General`
   - `0.1. Autenticación (Auth)` *(¡Nuevo! Login, Registro y Perfil)*
   - `1. Roles`
   - `2. Usuarios`
   - `3. Barberias`
   - `4. Clientes`
   - `5. Barberos`
   - `6. Servicios de Barbería`
   - `7. Horarios`
   - `8. Citas`

---

## 3. Cómo Funciona la Autenticación Automática en Postman

La colección ya viene configurada con **Bearer Token a nivel de colección**:
1. Cuando ejecutas **`Registro de Cliente`** o **`Iniciar Sesión (Login)`**, el script de prueba integrado captura automáticamente el token JWT y lo guarda en la variable `{{token}}`.
2. Las rutas protegidas (como `/auth/perfil`, crear barberías, agendar citas, etc.) heredan automáticamente este token en su cabecera `Authorization: Bearer {{token}}`.
3. Si cambias de usuario (por ejemplo, te logueas como Admin o como Barbero), el token se actualiza automáticamente para todas las peticiones siguientes.

---

## 4. Cómo Usar Postman desde Cero (Paso a Paso)

```
+-------------------------------------------------------------------------------+
| [GET/POST/PUT/DELETE ▼]  [ http://localhost:3000/auth/login                 ] [Send] |
+-------------------------------------------------------------------------------+
|  Params  |  Authorization  |  Headers  |  Body (● raw -> JSON ▼)              |
+-------------------------------------------------------------------------------+
```

### ¿Qué significa cada método HTTP?
* **`GET`**: Consultar/obtener información (no lleva Body).
* **`POST`**: Crear un nuevo registro o autenticarse (lleva datos en el Body).
* **`PUT`**: Actualizar o modificar un registro existente (lleva datos en el Body).
* **`DELETE`**: Eliminar un registro.

### Cómo enviar datos en el `Body` (para POST y PUT):
1. Selecciona el método (**`POST`** o **`PUT`**).
2. Escribe la URL (por ejemplo: `http://localhost:3000/auth/login`).
3. Ve a la pestaña **`Body`** (debajo de la barra de URL).
4. Selecciona la opción **`raw`**.
5. Al final de esa misma línea, cambia `Text` por **`JSON`**.
6. En el cuadro de texto inferior, pega los datos entre llaves `{ ... }`.
7. Haz clic en el botón azul **`Send`**.
8. En el panel inferior verás el resultado:
   * **`Status: 200 OK`** o **`201 Created`**: La operación fue exitosa.
   * **`Status: 401 Unauthorized`**: Contraseña o correo incorrectos, o falta el token.
   * **`Status: 403 Forbidden`**: El usuario no tiene el rol necesario (ej. se requiere Administrador).
   * **`Status: 404 Not Found`**: El registro con ese ID no existe.
   * **`Status: 500 Internal Server Error`**: Error en la base de datos o servidor.

---

## 5. ⚠️ Orden Recomendado para Probar los Datos

Como la base de datos es relacional y ahora cuenta con seguridad por roles, sigue este flujo ordenado:

```
[1. Servidor Activo] ➡️ [2. Roles] ➡️ [3. Crear Usuario Admin] ➡️ [4. Login Admin]
                                                                        ⬇️
[7. Crear Cita] ⬅️ [6. Crear Servicio] ⬅️ [5. Crear Barbería, Barbero y Cliente]
```

1. **Verificar Servidor**: `GET /`
2. **Consultar Roles**: `GET /roles` (Por defecto: 1 = Administrador, 2 = Barbero, 3 = Cliente).
3. **Crear Usuario Admin**:
   - `POST /usuarios` con `id_rol: 1`. Las contraseñas ahora se encriptan con `bcryptjs` de forma automática.
4. **Login como Admin**:
   - `POST /auth/login` con las credenciales del admin. Guardará automáticamente tu token.
5. **Crear Barbería**: `POST /barberias` (autorizado solo para Administradores).
6. **Registrar Clientes**:
   - Mediante `POST /auth/registro` (crea el usuario y el cliente en un solo paso y te entrega el token).
7. **Crear Barbero**: `POST /barberos` asociando el ID de usuario y de barbería.
8. **Crear Servicios y Horarios**: Asociados a la barbería creada.
9. **Crear y Consultar Citas**: `POST /citas` y `GET /citas` (filtradas según el rol del usuario autenticado).

---

## 6. Listado Completo de Endpoints Disponibles

### 0. General
| Método | Endpoint | Descripción | Body (JSON) | Acceso |
|---|---|---|---|---|
| `GET` | `/` | Prueba rápida de conexión | *Ninguno* | Público |

---

### 0.1. Autenticación (`/auth`)
| Método | Endpoint | Descripción | Ejemplo de Body (JSON) | Acceso |
|---|---|---|---|---|
| `POST` | `/auth/registro` | Registro rápido de nuevos clientes | ```json { "nombre": "Carlos Pérez", "correo": "carlos@barberia.com", "telefono": "3001234567", "password": "Password123*" } ``` | Público |
| `POST` | `/auth/login` | Iniciar sesión y obtener Token JWT | ```json { "correo": "carlos@barberia.com", "password": "Password123*" } ``` | Público |
| `GET` | `/auth/perfil` | Ver datos del usuario autenticado | *Ninguno* | Token requerido |

---

### 1. Roles (`/roles`)
| Método | Endpoint | Descripción | Ejemplo de Body (JSON) | Acceso |
|---|---|---|---|---|
| `GET` | `/roles` | Listar todos los roles | *Ninguno* | Público |
| `GET` | `/roles/:id` | Obtener rol por ID | *Ninguno* | Público |
| `POST` | `/roles` | Crear nuevo rol | `{"nombre": "Recepcionista"}` | Admin |
| `PUT` | `/roles/:id` | Actualizar rol existente | `{"nombre": "Recepcionista Senior"}` | Admin |
| `DELETE` | `/roles/:id` | Eliminar rol por ID | *Ninguno* | Admin |

---

### 2. Usuarios (`/usuarios`)
| Método | Endpoint | Descripción | Ejemplo de Body (JSON) | Acceso |
|---|---|---|---|---|
| `GET` | `/usuarios` | Listar todos los usuarios | *Ninguno* | Admin |
| `GET` | `/usuarios/:id` | Obtener usuario por ID | *Ninguno* | Propio usuario o Admin |
| `POST` | `/usuarios` | Crear usuario Admin/Barbero/Cliente | ```json { "id_rol": 1, "nombre": "Juan Admin", "correo": "admin@barberia.com", "telefono": "3001112233", "password": "mipasswordseguro" } ``` | Admin |
| `PUT` | `/usuarios/:id` | Actualizar usuario (hashea contraseña si se incluye) | ```json { "nombre": "Carlos Gómez", "telefono": "3119876543", "estado": "Activo" } ``` | Propio usuario o Admin |
| `DELETE` | `/usuarios/:id` | Eliminar usuario por ID | *Ninguno* | Admin |

---

### 3. Barberías (`/barberias`)
| Método | Endpoint | Descripción | Ejemplo de Body (JSON) | Acceso |
|---|---|---|---|---|
| `GET` | `/barberias` | Listar barberías | *Ninguno* | Público |
| `GET` | `/barberias/:id` | Obtener barbería por ID | *Ninguno* | Público |
| `POST` | `/barberias` | Registrar barbería | ```json { "id_admin": 1, "nombre": "Barbería Élite VIP", "direccion": "Carrera 15 # 80-20", "telefono": "3105556677", "descripcion": "Servicio premium de barbería" } ``` | Admin |
| `PUT` | `/barberias/:id` | Actualizar barbería | ```json { "nombre": "Barbería Élite & Spa", "direccion": "Carrera 15 # 80-25" } ``` | Admin |
| `DELETE` | `/barberias/:id` | Eliminar barbería | *Ninguno* | Admin |

---

### 4. Clientes (`/clientes`)
| Método | Endpoint | Descripción | Ejemplo de Body (JSON) | Acceso |
|---|---|---|---|---|
| `GET` | `/clientes` | Listar clientes (con datos de usuario) | *Ninguno* | Admin / Barbero |
| `GET` | `/clientes/:id` | Obtener cliente por ID | *Ninguno* | Token requerido |
| `POST` | `/clientes` | Registrar usuario existente como cliente | ```json { "id_usuario": 3 } ``` | Admin |
| `PUT` | `/clientes/:id` | Actualizar cliente | ```json { "id_usuario": 3 } ``` | Admin |
| `DELETE` | `/clientes/:id` | Eliminar cliente | *Ninguno* | Admin |

---

### 5. Barberos (`/barberos`)
| Método | Endpoint | Descripción | Ejemplo de Body (JSON) | Acceso |
|---|---|---|---|---|
| `GET` | `/barberos` | Listar barberos | *Ninguno* | Público |
| `GET` | `/barberos/:id` | Obtener barbero por ID | *Ninguno* | Público |
| `POST` | `/barberos` | Registrar barbero | ```json { "id_usuario": 2, "id_barberia": 1, "especialidad": "Degradados, diseño y barba" } ``` | Admin |
| `PUT` | `/barberos/:id` | Actualizar datos del barbero | ```json { "especialidad": "Master Barber & Diseños", "estado": "Disponible" } ``` | Admin / Barbero |
| `DELETE` | `/barberos/:id` | Eliminar barbero | *Ninguno* | Admin |

---

### 6. Servicios de Barbería (`/servicios`)
| Método | Endpoint | Descripción | Ejemplo de Body (JSON) | Acceso |
|---|---|---|---|---|
| `GET` | `/servicios` | Listar catálogo de servicios | *Ninguno* | Público |
| `POST` | `/servicios` | Crear nuevo servicio de corte | ```json { "id_barberia": 1, "nombre": "Corte Clásico + Barba", "descripcion": "Corte con tijera/máquina y perfilado con toalla caliente", "precio": 30000, "duracion_minutos": 45 } ``` | Admin |

---

### 7. Horarios (`/horarios`)
| Método | Endpoint | Descripción | Ejemplo de Body (JSON) | Acceso |
|---|---|---|---|---|
| `GET` | `/horarios` | Listar horarios de atención | *Ninguno* | Público |
| `POST` | `/horarios` | Crear horario | ```json { "id_barberia": 1, "dia_semana": "Lunes", "hora_apertura": "08:00:00", "hora_cierre": "20:00:00" } ``` | Admin |

---

### 8. Citas (`/citas`)
| Método | Endpoint | Descripción | Ejemplo de Body (JSON) | Acceso |
|---|---|---|---|---|
| `GET` | `/citas` | Listar citas (filtradas por rol del usuario) | *Ninguno* | Token requerido |
| `POST` | `/citas` | Agendar nueva cita | ```json { "id_barberia": 1, "id_cliente": 1, "id_barbero": 1, "id_servicio": 1, "fecha": "2026-10-25", "hora": "15:00:00", "observaciones": "Cliente puntual" } ``` | Token requerido |

---

## 7. Solución a Problemas Comunes

1. **`Acceso denegado: cabecera Authorization no proporcionada` (401)**:
   * Estás llamando a una ruta protegida sin token. Primero ejecuta la petición **Login** o **Registro** para que Postman guarde el token automáticamente.
2. **`Acceso denegado. Se requiere uno de los siguientes roles: ...` (403)**:
   * Tu usuario actual no tiene los permisos suficientes (por ejemplo, un Cliente intentando crear barberías o ver la lista completa de usuarios). Inicia sesión con un usuario Administrador.
3. **`duplicate key value violates unique constraint "usuarios_correo_key"` (409)**:
   * Ya existe un usuario con ese correo electrónico. Cambia el correo por uno diferente.
4. **`Credenciales inválidas` (401)**:
   * El correo o la contraseña no coinciden con los registrados en la base de datos.
5. **`Connection refused`**:
   * Tu servidor no está corriendo. Recuerda ejecutar `npm run dev` dentro de la carpeta `backend`.
