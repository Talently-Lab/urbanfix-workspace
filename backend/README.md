# UrbanFix — Backend

Backend de la aplicación **UrbanFix Solutions**.

## Descripción

Backend desarrollado con Node.js y Express. Gestiona la API de UrbanFix, la conexión con PostgreSQL mediante Prisma y el sistema de autenticación y autorización basado en JWT.

Actualmente se encuentran implementados:

* Registro de usuarios.
* Inicio de sesión.
* Autenticación mediante JWT.
* Autorización por roles.
* Conexión con PostgreSQL.
* Organización de rutas mediante `/api`.

---

## Stack

* Node.js
* Express
* Prisma 7
* PostgreSQL
* JWT
* bcryptjs
* CORS
* Nodemon

---

## Requisitos

Antes de comenzar, tener instalado:

* Node.js 20+
* npm
* Docker Desktop

---

## Instalación

Desde la carpeta `backend`:

```bash
npm install
```

---

## Variables de entorno

Crear un archivo `.env` dentro de la carpeta `backend`.

> ⚠️ El archivo `.env` contiene información sensible y no debe subirse al repositorio.

Agregar:

```env
DATABASE_URL="postgresql://postgres:secret@localhost:5432/urbanfix_dev"
JWT_SECRET="tu_clave_secreta"
```

### Variables

* `DATABASE_URL`: cadena de conexión a PostgreSQL.
* `JWT_SECRET`: clave utilizada para firmar y validar los tokens JWT.

Cada desarrollador debe utilizar su propia clave `JWT_SECRET`.

---

## PostgreSQL local

El backend utiliza PostgreSQL para desarrollo local mediante Docker.

### Primera instalación

Crear y levantar el contenedor:

```bash
docker run --name urbanfix-db \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 \
  -d postgres
```

Crear la base de datos:

```bash
docker exec -it urbanfix-db \
  psql -U postgres -c "CREATE DATABASE urbanfix_dev;"
```

> Este comando solo es necesario la primera vez que se crea la base de datos.

### Iniciar una instalación existente

Si el contenedor ya existe pero está detenido:

```bash
docker start urbanfix-db
```

Verificar que esté ejecutándose:

```bash
docker ps
```

Debería aparecer el contenedor:

```text
urbanfix-db
```

### Detener PostgreSQL

```bash
docker stop urbanfix-db
```

---

## Prisma

El proyecto utiliza **Prisma 7** como ORM para trabajar con PostgreSQL.

El schema de la base de datos se encuentra en:

```text
prisma/schema.prisma
```

La configuración de Prisma se encuentra en:

```text
prisma7.config.ts
```

### Sincronizar el schema

Para sincronizar los modelos definidos en `schema.prisma` con la base de datos local:

```bash
npx prisma db push
```

Este comando actualiza la estructura de la base de datos según el schema de Prisma.

---

## Ejecutar el backend

Desde la carpeta `backend`:

```bash
npm run dev
```

El servidor se ejecuta por defecto en:

```text
http://localhost:3001
```

Nodemon reinicia automáticamente el servidor cuando detecta cambios en los archivos.

---

## Health Check

Para comprobar que el servidor está funcionando:

```text
GET /health
```

Ejemplo:

```bash
curl http://localhost:3001/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "timestamp": "..."
}
```

---

# Autenticación

La autenticación utiliza **JWT (JSON Web Tokens)**.

Los usuarios pueden registrarse e iniciar sesión. Una vez autenticados, reciben un token que debe enviarse en las rutas protegidas.

## Registro

```text
POST /api/auth/register
```

Ejemplo:

```json
{
  "email": "usuario@urbanfix.com",
  "password": "12345678",
  "nombre": "Juan",
  "apellido": "Pérez",
  "rol": "CLIENTE",
  "numeroTelefono": "3811234567"
}
```

Roles disponibles:

```text
CLIENTE
TECNICO
ADMINISTRADOR
```

La respuesta incluye los datos básicos del usuario y un token JWT.

---

## Login

```text
POST /api/auth/login
```

Ejemplo:

```json
{
  "email": "usuario@urbanfix.com",
  "password": "12345678"
}
```

La respuesta incluye:

* Datos del usuario.
* Token JWT.

Ejemplo:

```json
{
  "usuario": {
    "idUsuario": 1,
    "email": "usuario@urbanfix.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": "CLIENTE",
    "numeroTelefono": "3811234567"
  },
  "token": "..."
}
```

---

## Autenticación con Bearer Token

Las rutas protegidas requieren enviar el token en el header:

```text
Authorization: Bearer <token>
```

Ejemplo:

```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer TU_TOKEN"
```

---

# Estructura de rutas

Todas las rutas de la API se encuentran agrupadas bajo:

```text
/api
```

Actualmente están organizadas en:

```text
/api/auth
/api/servicios
/api/tecnicos
/api/solicitudes
/api/admin
```

La estructura permite aplicar autenticación y autorización según el tipo de usuario.

---

## Roles y autorización

El sistema contempla tres roles:

| Rol             | Descripción                          |
| --------------- | ------------------------------------ |
| `CLIENTE`       | Usuario que solicita servicios       |
| `TECNICO`       | Usuario que realiza servicios        |
| `ADMINISTRADOR` | Usuario con permisos administrativos |

El middleware de autorización verifica que el usuario autenticado tenga el rol requerido para acceder a cada recurso.

---

# Estructura del proyecto

```text
backend/
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── controllers/
│   │   └── auth.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── notImplemented.js
│   │
│   └── routes/
│       ├── index.js
│       ├── auth.routes.js
│       ├── admin.routes.js
│       ├── servicios.routes.js
│       ├── solicitudes.routes.js
│       └── tecnicos.routes.js
│
├── generated/
│   └── prisma/
│
├── .env
├── .gitignore
├── index.js
├── package.json
├── package-lock.json
├── prisma7.config.ts
└── README.md
```

### Principales directorios

**`prisma/`**
Contiene el schema de la base de datos.

**`src/controllers/`**
Contiene la lógica de las funcionalidades de la aplicación.

**`src/middleware/`**
Contiene middlewares de autenticación, autorización y funcionalidades comunes.

**`src/routes/`**
Define y organiza los endpoints de la API.

**`generated/`**
Contiene el código generado automáticamente por Prisma.

**`index.js`**
Es el punto de entrada del servidor Express.

**`prisma7.config.ts`**
Contiene la configuración utilizada por Prisma 7.

---

# Flujo básico para comenzar a trabajar

Después de clonar el proyecto:

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Crear `.env`

Configurar:

```env
DATABASE_URL="postgresql://postgres:secret@localhost:5432/urbanfix_dev"
JWT_SECRET="tu_clave_secreta"
```

### 3. Iniciar PostgreSQL

Si es la primera instalación, crear el contenedor y la base de datos siguiendo la sección **PostgreSQL local**.

Si el contenedor ya existe:

```bash
docker start urbanfix-db
```

### 4. Sincronizar Prisma

```bash
npx prisma db push
```

### 5. Iniciar el servidor

```bash
npm run dev
```

### 6. Comprobar el backend

```bash
curl http://localhost:3001/health
```

Si devuelve:

```json
{
  "status": "ok",
  "timestamp": "..."
}
```

el backend está funcionando correctamente.
