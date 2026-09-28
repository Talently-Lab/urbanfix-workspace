# UrbanFix — Backend

Backend de la aplicación UrbanFix Solutions.

## Stack

* Node.js
* Express
* Prisma 7
* PostgreSQL
* JWT
* bcryptjs
* CORS
* Nodemon

## Requisitos

* Node.js 20+
* npm
* Docker Desktop

## Instalación

Desde la carpeta `backend`:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la carpeta `backend`.

> ⚠️ El archivo `.env` no debe subirse al repositorio.

Agregar la variable de conexión a PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:secret@localhost:5432/urbanfix_dev"
```

## PostgreSQL local

Para desarrollo local se utiliza PostgreSQL mediante Docker.

Crear y levantar el contenedor:

```bash
docker run --name urbanfix-db \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 \
  -d postgres
```

Verificar que el contenedor esté ejecutándose:

```bash
docker ps
```

Crear la base de datos:

```bash
docker exec -it urbanfix-db \
  psql -U postgres -c "CREATE DATABASE urbanfix_dev;"
```

> Este comando solo es necesario la primera vez que se crea la base de datos.

Si el contenedor ya existe pero está detenido:

```bash
docker start urbanfix-db
```

Para detener el contenedor:

```bash
docker stop urbanfix-db
```

## Ejecutar en desarrollo

Desde la carpeta `backend`:

```bash
npm run dev
```

El servidor se ejecuta por defecto en:

```text
http://localhost:3001
```

Nodemon reinicia automáticamente el servidor cuando detecta cambios en los archivos.

## Endpoint de prueba

Para comprobar que el backend está funcionando:

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

## Prisma

El proyecto utiliza Prisma 7 como ORM para trabajar con PostgreSQL.

El schema se encuentra en:

```text
prisma/schema.prisma
```

La configuración de Prisma se encuentra en:

```text
prisma7.config.ts
```

Para sincronizar el schema con la base de datos local:

```bash
npx prisma db push
```

Esto sincroniza los modelos definidos en `prisma/schema.prisma` con la base de datos `urbanfix_dev`.

## Estructura actual

```text
backend/

├── prisma/
│   └── schema.prisma
├── .env
├── .gitignore
├── index.js
├── package.json
├── package-lock.json
└── prisma7.config.ts
```
