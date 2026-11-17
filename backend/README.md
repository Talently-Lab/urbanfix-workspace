# UrbanFix — Backend

API REST de **UrbanFix Solutions**, desarrollada con Node.js, Express, PostgreSQL y Prisma 7. Implementa autenticación con JWT, control de acceso por roles (`CLIENTE`, `TECNICO`, `ADMINISTRADOR`), gestión del ciclo de vida de las solicitudes, registro de eventos y métricas para el dashboard del administrador.

La visión general del proyecto está en el [README principal](../README.md) y el detalle de cada endpoint en el [contrato de API](../docs/api/contrato-api.md).

## Stack

Node.js, Express, Prisma 7 (`@prisma/adapter-pg`), PostgreSQL, JWT, bcryptjs y CORS. Nodemon para desarrollo.

## Requisitos

- Node.js y npm.
- PostgreSQL local (instalado de forma nativa o con Docker).

## Instalación y ejecución

Desde la carpeta `backend`:

```bash
npm install
npx prisma generate
```

Crear el archivo `.env` a partir de `.env.example`. El archivo `.env` contiene información sensible y no debe subirse al repositorio.

```env
PORT=3001
DATABASE_URL="postgresql://USUARIO:PASSWORD@localhost:5432/urbanfix_dev"
JWT_SECRET="tu_clave_secreta_para_desarrollo"
SEED_ADMIN_PASSWORD="PasswordAdminParaSeed!"
SEED_USER_PASSWORD="PasswordUsuariosParaSeed!"
```

Crear las tablas, cargar los datos de prueba e iniciar el servidor:

```bash
npx prisma db push
npm run seed
npm run dev
```

El servidor queda disponible en `http://localhost:3001`. Para verificarlo:

```bash
curl http://localhost:3001/health
```

### PostgreSQL con Docker (opcional)

```bash
docker run --name urbanfix-db -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres
docker exec -it urbanfix-db psql -U postgres -c "CREATE DATABASE urbanfix_dev;"
```

La próxima vez alcanza con `docker start urbanfix-db`. En ese caso, la `DATABASE_URL` es `postgresql://postgres:secret@localhost:5432/urbanfix_dev`.

## Prisma

El schema está en `prisma/schema.prisma` y la configuración de Prisma 7 (incluida la URL de la base) en `prisma7.config.ts`. El cliente se genera en `generated/prisma`, que está ignorado por Git: hay que correr `npx prisma generate` después de clonar y cada vez que cambie el schema. El script `prisma/seed.js` carga usuarios, servicios, solicitudes y eventos de prueba.

## Scripts

- `npm run dev`: servidor en modo desarrollo.
- `npm start`: servidor en producción.
- `npm run build`: genera el cliente de Prisma.
- `npm run seed`: carga los datos de prueba.

## Estructura de rutas

Todas las rutas están bajo `/api` y se agrupan por módulo: `/api/auth`, `/api/users`, `/api/servicios`, `/api/tecnicos`, `/api/solicitudes`, `/api/eventos` y `/api/admin`. Los middlewares `authenticate` y `authorize` validan el token y el rol en cada ruta protegida.

## Ciclo de vida de las solicitudes

Una solicitud pasa por los estados `PENDIENTE`, `ACEPTADA`, `EN_PROGRESO` y `COMPLETADA`, y puede terminar en `CANCELADA` (desde `PENDIENTE` o `ACEPTADA`) o en `RECHAZADA` cuando todos los técnicos elegibles para el servicio la rechazaron. Cada transición registra un evento en la tabla `Evento`. Las reglas completas están en el [contrato de API](../docs/api/contrato-api.md).

## Estructura del proyecto

```text
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── controllers/   # Lógica de negocio por módulo
│   ├── middleware/    # Autenticación JWT y autorización por rol
│   └── routes/        # Definición de endpoints
├── .env.example
├── index.js           # Punto de entrada del servidor
├── prisma7.config.ts
└── package.json
```

## Despliegue

El backend está desplegado en Railway (directorio raíz `backend`, rama `main`) con PostgreSQL gestionado en Railway. Cada merge a `main` dispara un nuevo despliegue automático. Variables requeridas en producción: `DATABASE_URL` (referenciada a la base de Railway), `JWT_SECRET` y `NODE_ENV=production`; `PORT` lo asigna la plataforma. El esquema y el seed se ejecutan de forma manual contra la base de producción, no en cada despliegue. El detalle está en el [README principal](../README.md).