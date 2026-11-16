# UrbanFix App

Marketplace web (SPA) desarrollado como simulación laboral de 8 semanas para conectar a clientes con técnicos independientes (plomeros, electricistas, etc.) de forma estructurada.

**UrbanFix** es una plataforma web que conecta clientes con profesionales de servicios para el hogar. Permite solicitar trabajos, gestionar servicios, asignar profesionales y realizar el seguimiento de las solicitudes desde una única aplicación.

## 🌐 Demo en vivo

- **Aplicación:** [UrbanFix App](https://urbanfix-workspace-sandy.vercel.app/home)
- **API Backend:** [UrbanFix API](https://urbanfix-workspace-production.up.railway.app/api)

## 👥 Credenciales de prueba

La aplicación cuenta con usuarios de prueba para acceder a los distintos roles:

| Rol | Email | Contraseña |
|---|---|---|
| Cliente | cliente@test.com | password123 |
| Técnico | tecnico@test.com | password123 |
| Administrador | admin@urbanfix.com | password123 |

Estas credenciales están destinadas exclusivamente a pruebas y demostraciones.

## 🚀 Tecnologías utilizadas

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- Recharts

### Backend
- Node.js
- Express
- PostgreSQL
- Prisma ORM

### Infraestructura
- **Frontend:** Vercel
- **Backend:** Railway
- **Base de datos:** PostgreSQL

## ✨ Funcionalidades principales

### Clientes
- Registro e inicio de sesión.
- Visualización de servicios disponibles.
- Creación de solicitudes de trabajo.
- Consulta y seguimiento de solicitudes.
- Visualización de información del profesional asignado.

### Técnicos
- Acceso al panel de técnicos.
- Visualización de solicitudes disponibles.
- Aceptación y rechazo de solicitudes.
- Gestión de trabajos asignados.
- Actualización del estado de los trabajos.

### Administradores
- Panel de administración.
- Gestión y consulta de usuarios.
- Visualización de solicitudes.
- Dashboard de métricas.
- Gráficos e indicadores sobre el rendimiento de la plataforma.

## 📁 Estructura del proyecto

```text
urbanfix-workspace/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── Components/
│   │   ├── Pages/
│   │   ├── Assets/
│   │   ├── Services/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   ├── index.js
│   └── package.json
│
└── README.md
```

## 💻 Instalación local

Para ejecutar UrbanFix en un entorno local, es necesario instalar y ejecutar el frontend y el backend por separado.

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd urbanfix-workspace
```

### 2. Configurar el backend

Abrir una terminal y ejecutar:

```bash
cd backend
npm install
```

Crear un archivo `.env` dentro de `backend/` con las variables de entorno necesarias.

Como mínimo, configurar la conexión a PostgreSQL mediante:

```env
DATABASE_URL=postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/BASE_DE_DATOS
```

La URL anterior es un ejemplo: debe reemplazarse por la conexión correspondiente a la base de datos que se utilice.

Para aplicar las migraciones de Prisma, si el proyecto cuenta con migraciones:

```bash
npx prisma migrate deploy
```

Para cargar los datos de prueba:

```bash
npm run seed
```

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

El backend quedará disponible en:

```text
http://localhost:3001
```

### 3. Configurar el frontend

Abrir otra terminal y ejecutar:

```bash
cd frontend
npm install
```

Crear un archivo `.env` dentro de `frontend/`:

```env
VITE_API_URL=http://localhost:3001/api
```

Esta variable permite que el frontend se comunique con el backend local.

Para iniciar la aplicación:

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local de la aplicación, normalmente:

```text
http://localhost:5173
```

## 🔗 API en producción

El backend desplegado se encuentra disponible en:

```text
https://urbanfix-workspace-production.up.railway.app/api
```

Para utilizar la API de producción desde el frontend, configurar:

```env
VITE_API_URL=https://urbanfix-workspace-production.up.railway.app/api
```

## 📊 Dashboard de métricas

UrbanFix incluye un panel administrativo con indicadores y visualizaciones para analizar el funcionamiento de la plataforma, incluyendo métricas de solicitudes, usuarios, técnicos y actividad.

Los gráficos se implementan utilizando Recharts.

## 🔐 Variables de entorno

Los archivos `.env` contienen información de configuración y credenciales de conexión.

**No deben subirse al repositorio.** Se recomienda utilizar archivos `.env.example` sin contraseñas ni claves privadas para documentar las variables necesarias.

## 👨‍💻 Equipo de desarrollo

Proyecto desarrollado como plataforma web de gestión y conexión entre clientes y profesionales de servicios para el hogar.

---

**UrbanFix App — Conectamos necesidades con profesionales.**
