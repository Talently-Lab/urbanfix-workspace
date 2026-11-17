
# Contrato de API — UrbanFix Solutions

**Última actualización:** 16 de noviembre de 2026

## 1. Información general

- **Base URL:** `/api`
- **Formato:** JSON en request y response.
- **Autenticación:** JWT. Los endpoints protegidos requieren el header `Authorization: Bearer <token>`.
- **Roles:** cada usuario tiene un único rol: `CLIENTE`, `TECNICO` o `ADMINISTRADOR`.

**Formato de error estándar:**

```json
{
  "error": "Descripción detallada del error"
}
```

**Códigos HTTP:**

- `200` OK.
- `201` Recurso creado.
- `204` Recurso eliminado.
- `400` Datos inválidos.
- `401` Token ausente o inválido.
- `403` Rol o usuario sin permiso.
- `404` Recurso inexistente.
- `409` Acción no válida para el estado actual.
- `500` Error interno del servidor.

**Fuera de alcance del MVP (previstos para versión 2.0):** pagos integrados, chat en tiempo real, reseñas/calificaciones de usuarios, geolocalización avanzada en mapa, edición de los servicios de un técnico después del registro, y edición y baja de servicios existentes por parte del administrador.

## 2. Autenticación

### POST `/api/auth/register`

Registro de usuario. **Auth:** no requiere.

**Body:**

```json
{
  "nombre": "Sofia",
  "apellido": "Rodriguez",
  "email": "sofia@mail.com",
  "password": "Password123!",
  "rol": "CLIENTE",
  "numeroTelefono": "1122334455"
}
```

**Reglas de validación:**

- `nombre` y `apellido`: obligatorios, entre 2 y 50 caracteres alfabéticos (sin números ni símbolos especiales).
- `email`: obligatorio, formato de email válido, único en el sistema (case-insensitive, responde `409` si ya existe).
- `password`: obligatorio, mínimo 8 caracteres y máximo 72 bytes.
- `rol`: admite únicamente `CLIENTE` o `TECNICO`. El rol `ADMINISTRADOR` no se asigna por este endpoint (responde `400 Rol inválido`).
- `numeroTelefono`: opcional, texto de entre 8 y 20 caracteres con formato telefónico válido.

Cuando `rol` es `TECNICO`, el body debe incluir obligatoriamente `idServicios`, una lista con al menos un id de servicio existente (entre 1 y 50 enteros válidos):

```json
{
  "idServicios": [1, 3]
}
```

Un técnico no puede registrarse sin servicios: si `idServicios` falta, viene vacío o contiene ids inexistentes, responde `400` y no se crea el usuario. Si el rol es `CLIENTE`, `idServicios` se ignora.

**Respuesta 201:**

```json
{
  "usuario": {
    "idUsuario": 1,
    "email": "sofia@mail.com",
    "nombre": "Sofia",
    "apellido": "Rodriguez",
    "rol": "CLIENTE",
    "numeroTelefono": "1122334455"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errores:** `400` datos inválidos o rol no permitido, `409` email ya registrado.

### POST `/api/auth/login`

Login de usuario, devuelve JWT. **Auth:** no requiere.

Registra automáticamente el evento `LOGIN_EXITOSO` y actualiza la fecha `ultimoLogin` del usuario para métricas de retención (DAU).

**Body:**

```json
{
  "email": "sofia@mail.com",
  "password": "Password123!"
}
```

**Respuesta 200:**

```json
{
  "usuario": {
    "idUsuario": 1,
    "email": "sofia@mail.com",
    "nombre": "Sofia",
    "apellido": "Rodriguez",
    "rol": "CLIENTE",
    "numeroTelefono": "1122334455"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errores:** `400` faltan email o contraseña, `401` credenciales incorrectas.

### GET `/api/auth/me`

Devuelve los datos esenciales del usuario correspondiente al token enviado. **Auth:** cualquier usuario autenticado.

No recibe body.

**Respuesta 200:**

```json
{
  "usuario": {
    "idUsuario": 1,
    "nombre": "Sofia",
    "email": "sofia@mail.com",
    "rol": "CLIENTE"
  }
}
```

**Errores:** `401` token ausente o inválido.

## 3. Usuarios y Perfil

### GET `/api/users/me`

Devuelve el perfil completo del usuario autenticado. **Auth:** cualquier usuario autenticado (`CLIENTE`, `TECNICO`, `ADMINISTRADOR`).

No recibe body.

**Respuesta 200:**

```json
{
  "idUsuario": 1,
  "email": "sofia@mail.com",
  "nombre": "Sofia",
  "apellido": "Rodriguez",
  "rol": "CLIENTE",
  "numeroTelefono": "1122334455",
  "fechaCreacion": "2026-10-01T13:00:00.000Z"
}
```

**Errores:** `401` no autenticado, `404` usuario no encontrado.

### PATCH `/api/users/me`

Permite al usuario autenticado modificar datos personales de su perfil propio. **Auth:** cualquier usuario autenticado.

**Body:**

```json
{
  "nombre": "Sofia Elena",
  "numeroTelefono": "1199887766"
}
```

**Reglas de validación:**

- Al menos uno de los dos campos (`nombre` o `numeroTelefono`) debe enviarse.
- `nombre`: texto entre 2 y 50 letras alfabéticas sin números ni símbolos.
- `numeroTelefono`: texto válido entre 8 y 20 caracteres, o `null` / `""` para eliminar el teléfono registrado.

**Respuesta 200:**

```json
{
  "idUsuario": 1,
  "email": "sofia@mail.com",
  "nombre": "Sofia Elena",
  "apellido": "Rodriguez",
  "rol": "CLIENTE",
  "numeroTelefono": "1199887766"
}
```

**Errores:** `400` datos inválidos o body vacío, `401` no autenticado, `404` usuario no encontrado.

## 4. Servicios

### GET `/api/servicios`

Lista los servicios disponibles en la plataforma ordenados alfabéticamente. **Auth:** público (no requiere token).

No recibe body.

**Respuesta 200:**

```json
{
  "servicios": [
    {
      "idServicio": 4,
      "nombreServicio": "Carpintería",
      "descripcion": "Muebles, puertas y arreglos en madera"
    },
    {
      "idServicio": 2,
      "nombreServicio": "Electricidad",
      "descripcion": "Instalaciones y reparaciones eléctricas"
    },
    {
      "idServicio": 3,
      "nombreServicio": "Gasista",
      "descripcion": "Instalación y revisión de artefactos y redes de gas"
    },
    {
      "idServicio": 1,
      "nombreServicio": "Plomería",
      "descripcion": "Reparación e instalación de cañerías y sanitarios"
    }
  ]
}
```

### GET `/api/servicios/:id/tecnicos`

Lista los técnicos que ofrecen un servicio dado. **Auth:** administrador.

No recibe body.

**Respuesta 200:**

```json
{
  "tecnicos": [
    {
      "idUsuario": 8,
      "nombre": "María",
      "apellido": "Gómez"
    }
  ]
}
```

**Errores:** `400` id inválido, `404` servicio inexistente.

### POST `/api/admin/servicios`

Crea un nuevo servicio en la plataforma. **Auth:** administrador.

**Body:**

```json
{
  "nombreServicio": "Pintura",
  "descripcion": "Pintura de interiores y exteriores"
}
```

**Validaciones:**

- `nombreServicio`: obligatorio, texto hasta 100 caracteres.
- `descripcion`: obligatorio, texto hasta 500 caracteres.

**Respuesta 201:**

```json
{
  "mensaje": "Servicio creado correctamente",
  "servicio": {
    "idServicio": 5,
    "nombreServicio": "Pintura",
    "descripcion": "Pintura de interiores y exteriores"
  }
}
```

**Errores:** `400` datos inválidos, `409` ya existe un servicio con ese nombre.

## 5. Técnicos

### GET `/api/tecnicos/me/servicios`

Lista los servicios que ofrece el técnico autenticado. **Auth:** técnico.

No recibe body.

**Respuesta 200:**

```json
{
  "servicios": [
    {
      "idServicio": 1,
      "nombreServicio": "Plomería"
    }
  ]
}
```

## 6. Solicitudes

### GET `/api/solicitudes`

Lista las solicitudes disponibles para aceptar. **Auth:** técnico.

No recibe body; el usuario se identifica por el token. Devuelve únicamente las solicitudes en estado `PENDIENTE`, sin técnico asignado, cuyo servicio ofrece el técnico autenticado (según `TecnicoServicio`), excluyendo aquellas que ese técnico ya rechazó.

Ordenadas de la más reciente a la más antigua.

**Respuesta 200 (lista directa):**

```json
[
  {
    "idSolicitud": 3,
    "detalle": "Arreglo de canilla que gotea",
    "direccion": "Av. Rivadavia 4500",
    "estado": "PENDIENTE",
    "idCliente": 5,
    "idServicio": 1,
    "idTecnico": null,
    "fechaCreacion": "2026-10-01T13:00:00.000Z",
    "fechaAceptacion": null,
    "fechaFinalizacion": null,
    "servicio": {
      "nombreServicio": "Plomería"
    },
    "cliente": {
      "nombre": "Juan",
      "apellido": "Pérez"
    }
  }
]
```

### POST `/api/solicitudes`

Crea una solicitud de trabajo. **Auth:** cliente.

**Body:**

```json
{
  "idServicio": 1,
  "detalle": "Arreglo de canilla que gotea",
  "direccion": "Av. Rivadavia 4500",
  "instanciaFormularioId": "form-001",
  "sesionId": "sesion-abc123"
}
```

**Reglas de validación:**

- `idServicio`: obligatorio, número entero válido existente.
- `detalle`: obligatorio, texto no vacío de hasta 1000 caracteres.
- `direccion`: obligatoria, texto no vacío de hasta 200 caracteres (`400` si falta o no es válido).
- `instanciaFormularioId`: opcional, texto de hasta 100 caracteres. Se asocia al evento `SOLICITUD_CREADA` para medir abandono de formulario.
- `sesionId`: opcional, texto de hasta 100 caracteres. Se asocia al evento `SOLICITUD_CREADA` para trazabilidad de analítica.

**Respuesta 201:**

```json
{
  "idSolicitud": 10,
  "detalle": "Arreglo de canilla que gotea",
  "direccion": "Av. Rivadavia 4500",
  "estado": "PENDIENTE",
  "idCliente": 5,
  "idServicio": 1,
  "idTecnico": null,
  "fechaCreacion": "2026-10-01T13:00:00.000Z",
  "fechaAceptacion": null,
  "fechaFinalizacion": null,
  "servicio": {
    "nombreServicio": "Plomería"
  },
  "cliente": {
    "nombre": "Juan",
    "apellido": "Pérez",
    "numeroTelefono": "1122334455"
  }
}
```

**Errores:** `400` datos inválidos, `404` servicio inexistente.

### GET `/api/solicitudes/mias`

Lista las solicitudes del cliente autenticado, en cualquier estado, de la más reciente a la más antigua. **Auth:** cliente.

No recibe body.

**Respuesta 200:**

```json
[
  {
    "idSolicitud": 10,
    "detalle": "Arreglo de canilla que gotea",
    "direccion": "Av. Rivadavia 4500",
    "estado": "ACEPTADA",
    "idCliente": 5,
    "idServicio": 1,
    "idTecnico": 8,
    "fechaCreacion": "2026-10-01T13:00:00.000Z",
    "fechaAceptacion": "2026-10-01T14:10:00.000Z",
    "fechaFinalizacion": null,
    "servicio": {
      "nombreServicio": "Plomería"
    },
    "tecnico": {
      "nombre": "María",
      "apellido": "Gómez",
      "numeroTelefono": "1199887766"
    }
  }
]
```

### GET `/api/solicitudes/asignadas`

Lista las solicitudes que el técnico autenticado aceptó, en cualquier estado, ordenadas por fecha de aceptación más reciente. **Auth:** técnico.

No recibe body.

**Respuesta 200:**

```json
{
  "solicitudes": [
    {
      "idSolicitud": 10,
      "detalle": "Arreglo de canilla que gotea",
      "direccion": "Av. Rivadavia 4500",
      "estado": "ACEPTADA",
      "fechaCreacion": "2026-10-01T13:00:00.000Z",
      "fechaAceptacion": "2026-10-01T14:10:00.000Z",
      "fechaFinalizacion": null,
      "servicio": {
        "idServicio": 1,
        "nombreServicio": "Plomería"
      },
      "cliente": {
        "idUsuario": 5,
        "nombre": "Juan",
        "apellido": "Pérez",
        "numeroTelefono": "1122334455"
      }
    }
  ]
}
```

### GET /api/solicitudes/:id

Detalle de una solicitud puntual, incluyendo el estado del rechazo por técnicos. **Auth**: cliente dueño de la solicitud, técnico asignado, técnico que ofrece el servicio, o administrador.

No recibe body.

**Respuesta 200**

```json
{
  "solicitud": {
    "idSolicitud": 10,
    "detalle": "Arreglo de canilla que gotea",
    "direccion": "Av. Rivadavia 4500",
    "estado": "ACEPTADA",
    "servicio": {
      "idServicio": 1,
      "nombreServicio": "Plomería"
    },
    "cliente": {
      "idUsuario": 5,
      "nombre": "Juan"
    },
    "tecnico": {
      "idUsuario": 8,
      "nombre": "María"
    },
    "fechaCreacion": "2026-10-01T13:00:00.000Z",
    "fechaAceptacion": "2026-10-01T14:10:00.000Z",
    "fechaFinalizacion": null,
    "rechazos": {
      "tecnicosQueRechazaron": 1,
      "tecnicosElegibles": 3
    }
  }
}
```

**Errores:** `400` id inválido, `403` el usuario no tiene relación con la solicitud, `404` solicitud inexistente.

### GET /api/solicitudes/:id/eventos

Historial de eventos de una solicitud, ordenado por fecha ascendente. **Auth:** cliente dueño de la solicitud, técnico asignado o administrador.

Un técnico que solo ofrece el servicio, sin estar asignado, no tiene acceso.

No recibe body.

**Respuesta 200** 

```json
{
  "eventos": [
    {
      "idEvento": 20,
      "nombreEvento": "SOLICITUD_CREADA",
      "fechaHora": "2026-10-01T13:00:00.000Z"
    },
    {
      "idEvento": 21,
      "nombreEvento": "SOLICITUD_RECHAZADA",
      "fechaHora": "2026-10-01T13:40:00.000Z"
    },
    {
      "idEvento": 22,
      "nombreEvento": "SOLICITUD_ACEPTADA",
      "fechaHora": "2026-10-01T14:10:00.000Z"
    }
  ]
}
```

El campo `usuario` (quién generó el evento) solo se devuelve al administrador:

```json
{
  "idEvento": 21,
  "nombreEvento": "SOLICITUD_RECHAZADA",
  "fechaHora": "2026-10-01T13:40:00.000Z",
  "usuario": {
    "idUsuario": 9,
    "nombre": "Pedro"
  }
}
```

Valores posibles de `nombreEvento` en este historial:

- `SOLICITUD_CREADA`
- `SOLICITUD_ACEPTADA`
- `SOLICITUD_RECHAZADA`
- `SOLICITUD_EN_PROGRESO`
- `SOLICITUD_COMPLETADA`
- `SOLICITUD_CANCELADA`

El paso automático a `RECHAZADA` no genera un evento propio. Los eventos de pantalla y de login no tienen solicitud asociada, por lo que no aparecen acá.

**Errores:** `400` id inválido, `403` el usuario no tiene permiso sobre el historial, `404` solicitud inexistente.

### PATCH /api/solicitudes/:id/aceptar

Técnico acepta el trabajo. **Auth:** técnico.

No recibe body. `:id` es el identificador de la solicitud en la URL, por ejemplo `/api/solicitudes/10/aceptar`.

Registra el evento `SOLICITUD_ACEPTADA` y completa `fechaAceptacion`.

**Respuesta 200**

```json
{
  "mensaje": "Solicitud aceptada",
  "solicitud": {
    "idSolicitud": 10,
    "estado": "ACEPTADA",
    "idTecnico": 8
  }
}
```

**Errores:** `400` id inválido, `403` el técnico no ofrece ese servicio, `404` solicitud inexistente, `409` la solicitud ya no está disponible.

### PATCH /api/solicitudes/:id/rechazar

Técnico rechaza el trabajo. **Auth:** técnico.

No recibe body. Registra el rechazo del técnico como evento `SOLICITUD_RECHAZADA`.

La solicitud permanece en `PENDIENTE` mientras queden técnicos elegibles que no la hayan rechazado, y pasa a `RECHAZADA` recién cuando todos ellos la rechazaron.

**Respuesta 200** (quedan técnicos elegibles)

```json
{
  "mensaje": "Rechazo registrado",
  "solicitud": {
    "idSolicitud": 10,
    "estado": "PENDIENTE"
  }
}
```

**Respuesta 200** (rechazaron todos los técnicos elegibles)

```json
{
  "mensaje": "Rechazo registrado",
  "solicitud": {
    "idSolicitud": 10,
    "estado": "RECHAZADA"
  }
}
```

**Errores:** `400` id inválido, `403` el técnico no ofrece ese servicio, `404` solicitud inexistente, `409` la solicitud no está `PENDIENTE` o el técnico ya la rechazó.

### PATCH /api/solicitudes/:id/iniciar

Técnico comienza el trabajo. **Auth:** técnico asignado a la solicitud.

No recibe body. Pasa la solicitud de `ACEPTADA` a `EN_PROGRESO` y registra el evento `SOLICITUD_EN_PROGRESO`.

**Respuesta 200**

```json
{
  "mensaje": "Solicitud en progreso",
  "solicitud": {
    "idSolicitud": 10,
    "estado": "EN_PROGRESO"
  }
}
```

**Errores:** `400` id inválido, `403` la solicitud no está asignada a este técnico, `404` solicitud inexistente, `409` la solicitud no está `ACEPTADA`.

### PATCH /api/solicitudes/:id/completar

Técnico finaliza el trabajo. **Auth:** técnico asignado a la solicitud.

No recibe body. Pasa la solicitud de `EN_PROGRESO` a `COMPLETADA`, completa `fechaFinalizacion` y registra el evento `SOLICITUD_COMPLETADA`.

**Respuesta 200**

```json
{
  "mensaje": "Solicitud completada",
  "solicitud": {
    "idSolicitud": 10,
    "estado": "COMPLETADA",
    "fechaFinalizacion": "2026-10-05T15:30:00.000Z"
  }
}
```

**Errores:** `400` id inválido, `403` la solicitud no está asignada a este técnico, `404` solicitud inexistente, `409` la solicitud no está `EN_PROGRESO`.

### PATCH /api/solicitudes/:id/cancelar

Cliente o técnico cancela la solicitud. **Auth:** cliente dueño de la solicitud o técnico asignado.

No recibe body. Solo puede ejecutarse si la solicitud está en `PENDIENTE` o `ACEPTADA`. Registra el evento `SOLICITUD_CANCELADA`.

**Respuesta 200**

```json
{
  "mensaje": "Solicitud cancelada",
  "solicitud": {
    "idSolicitud": 10,
    "estado": "CANCELADA"
  }
}
```

**Errores:** `400` id inválido, `403` el usuario no es parte de la solicitud, `404` solicitud inexistente, `409` el estado actual no permite cancelar.

---

## 7. Eventos de pantalla

### POST /api/eventos

Permite que el front registre eventos de pantalla que el backend no puede detectar por sí solo.

Los eventos de estado de una solicitud y el login se registran únicamente desde el backend.

**Auth:** opcional.

Si el request trae un token válido, el evento se guarda con el `idUsuario`; si falta o es inválido, se registra como anónimo.

**Body**

```json
{
  "nombreEvento": "SOLICITUD_INICIADA",
  "sesionId": "sesion-abc123",
  "instanciaFormularioId": "form-001"
}
```

- `nombreEvento` solo admite `VISTA_LOGIN`, `VISTA_REGISTRO` y `SOLICITUD_INICIADA`. Cualquier otro valor responde `400`.
- `SOLICITUD_INICIADA` se envía cuando se muestra el formulario de crear solicitud. Requiere un cliente autenticado (`403` si no) y un `instanciaFormularioId`, que debe ser único cada vez que se abre el formulario.
- Ese mismo id se envía después en `POST /api/solicitudes` si el cliente completa el formulario.
- `sesionId` e `instanciaFormularioId` deben ser texto de hasta 100 caracteres.

**Respuesta 201:** evento registrado.

**Errores:** `400` datos inválidos o evento no permitido, `403` `SOLICITUD_INICIADA` sin un cliente autenticado.

---

## 8. Administración

### GET /api/admin/usuarios

Lista todos los usuarios registrados. **Auth:** administrador.

No recibe body.

**Respuesta 200**

```json
{
  "usuarios": [
    {
      "idUsuario": 1,
      "nombre": "Sofia",
      "email": "sofia@mail.com",
      "rol": "CLIENTE"
    },
    {
      "idUsuario": 8,
      "nombre": "María",
      "email": "maria@mail.com",
      "rol": "TECNICO"
    }
  ]
}
```

### GET /api/admin/solicitudes

Lista todas las solicitudes, sin importar estado ni dueño. **Auth:** administrador.

No recibe body.

**Respuesta 200**

```json
{
  "solicitudes": [
    {
      "idSolicitud": 3,
      "detalle": "Arreglo de canilla",
      "estado": "PENDIENTE",
      "direccion": "Av. Rivadavia 4500",
      "fechaCreacion": "2026-10-01T13:00:00.000Z",
      "fechaAceptacion": null,
      "fechaFinalizacion": null,
      "servicio": { "idServicio": 1, "nombreServicio": "Plomería" },
      "cliente": { "idUsuario": 5, "nombre": "Juan", "apellido": "Pérez", "email": "juan@mail.com" },
      "tecnico": null
    }
  ]
}
```

### PATCH /api/admin/solicitudes/:id/cancelar

El administrador cancela una solicitud. **Auth:** administrador.

No recibe body. Registra el evento `SOLICITUD_CANCELADA`.

**Respuesta 200**

{
  "mensaje": "Solicitud cancelada",
  "solicitud": {
    "idSolicitud": 10,
    "estado": "CANCELADA"
  }
}

**Errores:** `400` id inválido, `404` solicitud inexistente, `409` el estado actual no permite cancelar.

### GET /api/admin/metricas

> En desarrollo. El formato es una propuesta y puede ajustarse con Data.

Devuelve los KPIs del dashboard del administrador. Excluye a los usuarios de prueba. **Auth:** administrador.

No recibe body.

**Respuesta 200**

```json
{
  "metricas": {
    "matchRate": 62.5,
    "timeToMatchMinutos": 45,
    "ratioClientesTecnicos": 3.2,
    "liquidity": 80,
    "conversionRegistro": 40,
    "activationRate": 75,
    "registeredCount": 6,
    "registrationViewsCount": 10,
    "requestCount": 6,
    "dau": 35,
    "abandonoSolicitud": {
      "totalIntentos": 20,
      "totalCompletados": 15,
      "totalAbandonados": 5,
      "tasaAbandono": 25
    }
  }
}
```

---

## 9. Estados y reglas de negocio

| Estado | Quién lo produce | Endpoint | Evento que registra |
| :--- | :--- | :--- | :--- |
| `PENDIENTE` | Cliente | `POST /api/solicitudes` | `SOLICITUD_CREADA` |
| `ACEPTADA` | Técnico | `PATCH /api/solicitudes/:id/aceptar` | `SOLICITUD_ACEPTADA` |
| `EN_PROGRESO` | Técnico | `PATCH /api/solicitudes/:id/iniciar` | `SOLICITUD_EN_PROGRESO` |
| `COMPLETADA` | Técnico | `PATCH /api/solicitudes/:id/completar` | `SOLICITUD_COMPLETADA` |
| `RECHAZADA` | Sistema | Resultado de `PATCH /api/solicitudes/:id/rechazar` | `SOLICITUD_RECHAZADA` (individual) |
| `CANCELADA` | Cliente, técnico o admin | `PATCH /api/solicitudes/:id/cancelar` o `/api/admin/solicitudes/:id/cancelar` | `SOLICITUD_CANCELADA` |

### Flujo de estados

```text
Cliente crea
     |
  PENDIENTE
     |
     |-------------------|
     v                    v
  ACEPTADA           Técnico rechaza
     |                    |
     v                    v
 EN_PROGRESO      Quedan técnicos elegibles -> PENDIENTE
     |                    |
     v                    v
 COMPLETADA       Rechazaron todos -> RECHAZADA
```

`PENDIENTE` y `ACEPTADA` admiten además la transición a `CANCELADA`.

### Rechazo individual

Un rechazo de un técnico no cambia el estado general de la solicitud. La solicitud sigue `PENDIENTE` para que el resto de los técnicos que ofrecen ese servicio puedan aceptarla.

Recién pasa a `RECHAZADA` cuando la cantidad de técnicos distintos que la rechazaron iguala a la cantidad de técnicos que ofrecen ese servicio (`TecnicoServicio`).

Este conteo está disponible en `GET /api/solicitudes/:id` y el detalle de cada rechazo en `GET /api/solicitudes/:id/eventos` (para el administrador).

### Concurrencia

Aceptar, iniciar, completar y cancelar actualizan la solicitud solo si sigue en el estado esperado.

Si dos usuarios actúan a la vez (por ejemplo, un técnico acepta mientras el cliente cancela), solo uno lo logra y el otro recibe `409`.

---

## 10. Tipos de evento

| Evento | Lo registra | Cuándo |
|---|---|---|
| `SOLICITUD_CREADA` | Backend | Al crear una solicitud (guarda `instanciaFormularioId` si llega) |
| `SOLICITUD_ACEPTADA` | Backend | Al aceptar una solicitud |
| `SOLICITUD_RECHAZADA` | Backend | Cada vez que un técnico rechaza |
| `SOLICITUD_EN_PROGRESO` | Backend | Al iniciar el trabajo |
| `SOLICITUD_COMPLETADA` | Backend | Al completar el trabajo |
| `SOLICITUD_CANCELADA` | Backend | Al cancelar |
| `LOGIN_EXITOSO` | Backend | Al hacer login correctamente |
| `VISTA_LOGIN` | Front, vía `POST /api/eventos` | Al mostrar la pantalla de login |
| `VISTA_REGISTRO` | Front, vía `POST /api/eventos` | Al mostrar la pantalla de registro |
| `SOLICITUD_INICIADA` | Front, vía `POST /api/eventos` | Al mostrar el formulario de crear solicitud (no confundir con `SOLICITUD_EN_PROGRESO`) |

---

## 11. Resumen de endpoints

| Método | Endpoint | Permiso |
|---|---|---|
| POST | `/api/auth/register` | Público |
| POST | `/api/auth/login` | Público |
| GET | `/api/auth/me` | Autenticado |
| GET | `/api/users/me` | Autenticado |
| PATCH | `/api/users/me` | Autenticado |
| POST | `/api/eventos` | Público (token opcional) |
| GET | `/api/servicios` | Público |
| GET | `/api/servicios/:id/tecnicos` | Admin |
| POST | `/api/admin/servicios` | Admin |
| PATCH | /api/admin/solicitudes/:id/cancelar | Administrador |
| GET | `/api/tecnicos/me/servicios` | Técnico |
| GET | `/api/solicitudes` | Técnico |
| POST | `/api/solicitudes` | Cliente |
| GET | `/api/solicitudes/mias` | Cliente |
| GET | `/api/solicitudes/asignadas` | Técnico |
| GET | `/api/solicitudes/:id` | Cliente / Técnico / Admin |
| GET | `/api/solicitudes/:id/eventos` | Cliente dueño / Técnico asignado / Admin |
| PATCH | `/api/solicitudes/:id/aceptar` | Técnico |
| PATCH | `/api/solicitudes/:id/rechazar` | Técnico |
| PATCH | `/api/solicitudes/:id/iniciar` | Técnico asignado |
| PATCH | `/api/solicitudes/:id/completar` | Técnico asignado |
| PATCH | `/api/solicitudes/:id/cancelar` | Cliente dueño / Técnico asignado |
| GET | `/api/admin/usuarios` | Admin |
| GET | `/api/admin/solicitudes` | Admin |
| GET | `/api/admin/metricas` | Admin |