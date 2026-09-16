# UrbanFix — Backend

Backend de la aplicación UrbanFix Solutions.

## Stack

* Node.js
* Express
* Prisma
* PostgreSQL
* JWT
* bcryptjs
* CORS
* Nodemon

## Requisitos

* Node.js 20+
* npm

## Instalación

Desde la carpeta `backend`:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la carpeta `backend`.

> ⚠️ El archivo `.env` no debe subirse al repositorio.

Las variables necesarias para la conexión con la base de datos serán definidas junto con la configuración de Prisma.

## Ejecutar en desarrollo

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

El proyecto utiliza Prisma como ORM para trabajar con PostgreSQL.

El schema se encuentra en:

```text
prisma/schema.prisma
```

La configuración de Prisma se encuentra en:

```text
prisma7.config.ts
```

La definición de modelos y la configuración de la base de datos se encuentran en proceso de definición.

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
