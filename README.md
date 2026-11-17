
# UrbanFix Solutions

Plataforma web para conectar a clientes con técnicos profesionales independientes (plomería, electricidad, gas, carpintería), con gestión de solicitudes, trazabilidad por estados y métricas analíticas.

Proyecto desarrollado durante la simulación laboral de 8 semanas en Talently Lab.

## Enlaces del proyecto

- **Aplicación Frontend (Vercel):** [https://urbanfix-workspace-sandy.vercel.app/home](https://urbanfix-workspace-sandy.vercel.app/home)
- **API Backend (Railway):** [https://urbanfix-workspace-production.up.railway.app/api](https://urbanfix-workspace-production.up.railway.app/api)
- **Health Check:** [https://urbanfix-workspace-production.up.railway.app/health](https://urbanfix-workspace-production.up.railway.app/health)
- **Contrato de API:** [docs/api/contrato-api.md](docs/api/contrato-api.md)

> *Nota: La demo en vivo está alojada en entornos de prueba (Vercel y Railway) y estará disponible hasta aproximadamente el 10/12/2026.*

---

## Control de Acceso por Roles (RBAC) y Modelo de Negocio

El núcleo de la arquitectura backend implementa un sistema de autorización basado en roles (RBAC) mediante JWT y middlewares dedicados.

| Rol | Permisos y Capacidades |
|---|---|
| `CLIENTE` | Registro público, creación de solicitudes, visualización del historial propio (`/api/solicitudes/mias`) y cancelación de solicitudes pendientes o aceptadas. Edición del perfil propio (`/api/users/me`). |
| `TECNICO` | Registro con selección obligatoria de al menos un oficio/servicio existente. Acceso al panel de solicitudes disponibles de sus oficios (`/api/solicitudes`), aceptación, inicio, finalización y rechazo individual de trabajos. |
| `ADMINISTRADOR` | Sin registro público (creación controlada por base de datos). Visualización de todos los usuarios y solicitudes con filtros, creación de nuevos servicios, cancelación administrativa de solicitudes y acceso exclusivo al dashboard de KPIs. |

### Ciclo de vida de las solicitudes

Las solicitudes transicionan siguiendo las reglas de negocio definidas en el contrato de API.

```text
Cliente crea
     │
     ▼
 PENDIENTE ──(Técnico rechaza)──> ¿Quedan técnicos elegibles?
     │                                    │           │
     │                                   SÍ           NO
     │                                    │           │
     │                                    ▼           ▼
     │                                PENDIENTE   RECHAZADA
     │
     ▼
  ACEPTADA
     │
     ▼
 EN_PROGRESO
     │
     ▼
 COMPLETADA
```

Tanto en estado `PENDIENTE` como en `ACEPTADA`, la solicitud puede pasar a `CANCELADA` por acción del cliente o del técnico. El administrador también dispone de cancelación administrativa.

---

## Alcance del MVP y Visión v2.0

Para garantizar la estabilidad de la entrega, se priorizó el núcleo transaccional y el seguimiento analítico de la plataforma.

### Incluido en el MVP

- Autenticación mediante JWT.
- Control de acceso por roles (RBAC).
- Ciclo de vida y gestión de solicitudes.
- Asignación dinámica de solicitudes según los oficios de los técnicos.
- Edición del perfil propio (`/api/users/me`).
- Cancelación administrativa de solicitudes.
- Métricas operativas y analíticas.

### Previsto para v2.0

- Integración de pagos.
- Chat en tiempo real.
- Sistema de calificaciones y reseñas.
- Geolocalización avanzada en mapa.
- Edición y baja de servicios existentes por parte del administrador.
- Alta y eliminación de técnicos desde el panel administrativo.

---

## Dashboard de métricas

El panel de administración incluye un dashboard con indicadores de solicitudes, usuarios, técnicos y actividad (Match Rate, Time to Match, DAU, entre otros), alimentado por `GET /api/admin/metricas` y graficado con Recharts.

---

## Usuarios y Entorno de Prueba

La plataforma cuenta con usuarios de prueba precargados para cada uno de los roles, generados mediante el script de sembrado de la base de datos (`seed.js`).

Por buenas prácticas de seguridad, las credenciales no se exponen en este repositorio y son administradas mediante variables de entorno para las demostraciones y pruebas de control de calidad (QA).

---

## Tecnologías Utilizadas

### Backend

- **Lenguaje y entorno:** Node.js y Express.
- **Base de datos y ORM:** PostgreSQL y Prisma 7 (`@prisma/adapter-pg`).
- **Seguridad y criptografía:** JWT (JSON Web Tokens) y bcryptjs.
- **Arquitectura:** Controladores modulares, middlewares de autenticación y autorización por roles.

### Frontend

- **Framework y bundler:** React y Vite.
- **Estilos e interfaz:** Tailwind CSS.
- **Gráficos y métricas:** Recharts.
- **Comunicación HTTP:** Axios.

### Infraestructura Cloud

- **Frontend:** Vercel (despliegue automático desde la rama `main`).
- **Backend API:** Railway (despliegue automático desde la rama `main`).
- **Base de datos:** PostgreSQL gestionado en Railway.

---

## Estructura del Proyecto

```text
urbanfix-workspace/
│
├── docs/
│   └── api/
│       ├── contrato-api.md          # Especificación de endpoints y contratos
│       └── postman_collection.json  # Colección de pruebas de API
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # Modelos, enums y relaciones
│   │   └── seed.js                  # Usuarios, servicios y eventos de KPI
│   ├── src/
│   │   ├── controllers/             # Lógica de negocio
│   │   ├── middleware/              # Autenticación JWT y autorización RBAC
│   │   └── routes/                  # Enrutamiento modular de la API
│   ├── .env.example                 # Plantilla de variables de entorno
│   ├── index.js                     # Punto de entrada del servidor Express
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── Components/              # Componentes reutilizables de UI
│   │   ├── Pages/                   # Vistas principales
│   │   └── Services/                # Conexión con la API backend
│   └── package.json
│
└── README.md
```

---

## Instalación y Ejecución Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Talently-Lab/urbanfix-workspace.git
cd urbanfix-workspace
```

### 2. Configurar y levantar el Backend

Entrar en la carpeta del backend e instalar las dependencias:

```bash
cd backend
npm install
```

Generar el cliente de Prisma:

```bash
npx prisma generate
```

Crear el archivo `.env` tomando como base `.env.example`:

```bash
cp .env.example .env
```

Completar las variables requeridas:

```env
PORT=3001
DATABASE_URL="postgresql://USUARIO:PASSWORD@localhost:5432/urbanfix_dev"
JWT_SECRET="tu_clave_secreta_para_desarrollo"
SEED_ADMIN_PASSWORD="PasswordAdminParaSeed!"
SEED_USER_PASSWORD="PasswordUsuariosParaSeed!"
```

Sincronizar el esquema de Prisma con la base de datos PostgreSQL local:

```bash
npx prisma db push
```

Cargar los datos de prueba y eventos de métricas:

```bash
npm run seed
```

Iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

Verificar que el servidor responde correctamente:

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

### 3. Configurar y levantar el Frontend

En una nueva terminal, entrar en la carpeta frontend e instalar las dependencias:

```bash
cd frontend
npm install
```

Crear el archivo `.env` apuntando al backend local:

```env
VITE_API_URL=http://localhost:3001/api
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en:

`http://localhost:5173`


Para usar la API de producción en lugar del backend local, configurar en `frontend/.env`:

```env
VITE_API_URL=https://urbanfix-workspace-production.up.railway.app/api
```

---

## Despliegue en Producción (Railway)

La arquitectura productiva del backend se encuentra desplegada en Railway con las siguientes características:

- **Servidor Node.js:** ejecuta el backend escuchando en el puerto asignado dinámicamente por la plataforma (`PORT`).
- **Conectividad interna:** el backend se comunica con PostgreSQL mediante la variable `DATABASE_URL`, utilizando la red privada de Railway.
- **Mantenimiento y sembrado:** la base de datos permite tareas administrativas y ejecución controlada del script `seed.js` desde terminales autorizadas.
- **Despliegue automático:** cada fusión (merge) a la rama `main` dispara automáticamente la construcción y el despliegue del servicio.

---

**UrbanFix Solutions — Conectando necesidades con profesionales.**
