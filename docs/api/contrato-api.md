# Contrato de API — UrbanFix Solutions

**Sprint:** Semana 2 — Diseño de API

## 1. Información general

- **Base URL:** `/api`
- **Formato:** JSON en request y response.
- **Autenticación:** JWT. Los endpoints protegidos requieren el header `Authorization: Bearer <token>`.
- **Roles:** cada usuario tiene un único rol: `CLIENTE`, `TECNICO` o `ADMINISTRADOR`.
- **Formato de error:**

  ```json
  { "error": "La solicitud ya fue aceptada por otro técnico" }
  ```

- **Códigos HTTP:** `200` OK · `201` recurso creado · `204` recurso eliminado · `400` datos inválidos · `401` token ausente o inválido · `403` rol o usuario sin permiso · `404` recurso inexistente · `409` acción no válida para el estado actual.

Fuera de alcance del MVP: pagos integrados, chat en tiempo real, reseñas de usuarios, geolocalización avanzada, y edición de perfil propio o de los servicios de un técnico después del registro.

---

## 2. Autenticación

### POST /api/auth/register

Registro de usuario. **Auth:** no requiere.

**Body**

```json
{
  "nombre": "Sofia",
  "apellido": "Rodriguez",
  "email": "sofia@mail.com",
  "password": "123456",
  "rol": "CLIENTE",
  "numeroTelefono": "1122334455"
}
```

`rol` admite `CLIENTE` o `TECNICO`; `ADMINISTRADOR` no se asigna por este endpoint. Cuando `rol` es `TECNICO`, el body incluye además `idServicios`:

```json
"idServicios": [1, 3]
```

**Respuesta 201**

```json
{
  "mensaje": "Usuario creado correctamente",
  "usuario": { "idUsuario": 1, "nombre": "Sofia", "email": "sofia@mail.com", "rol": "CLIENTE" }
}
```

**Errores:** `400` datos inválidos, `409` email ya registrado.

### POST /api/auth/login

Login, devuelve JWT. **Auth:** no requiere.

**Body**

```json
{ "email": "sofia@mail.com", "password": "123456" }
```

**Respuesta 200**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": { "idUsuario": 1, "nombre": "Sofia", "rol": "CLIENTE" }
}
```

**Errores:** `401` credenciales incorrectas.

### GET /api/auth/me

Devuelve el usuario correspondiente al token enviado. **Auth:** cualquier usuario autenticado.

No recibe body.

**Respuesta 200**

```json
{ "usuario": { "idUsuario": 1, "nombre": "Sofia", "email": "sofia@mail.com", "rol": "CLIENTE" } }
```

**Errores:** `401` token ausente o inválido.

---

## 3. Servicios

### GET /api/servicios

Lista los servicios disponibles en la plataforma. **Auth:** cualquier usuario autenticado.

No recibe body.

**Respuesta 200**

```json
{
  "servicios": [
    { "idServicio": 1, "nombreServicio": "Plomería", "descripcion": "Reparación de cañerías y grifería" }
  ]
}
```

### GET /api/servicios/:id/tecnicos

Lista los técnicos que ofrecen un servicio dado. **Auth:** administrador.

No recibe body.

**Respuesta 200**

```json
{
  "tecnicos": [
    { "idUsuario": 8, "nombre": "María", "apellido": "Gómez" }
  ]
}
```

**Errores:** `404` servicio inexistente.

### POST /api/admin/servicios

Crea un nuevo servicio. **Auth:** administrador.

**Body**

```json
{ "nombreServicio": "Gasista", "descripcion": "Instalación y reparación de gas" }
```

**Respuesta 201**

```json
{ "mensaje": "Servicio creado correctamente", "servicio": { "idServicio": 5, "nombreServicio": "Gasista", "descripcion": "Instalación y reparación de gas" } }
```

**Errores:** `400` datos inválidos.

### PATCH /api/admin/servicios/:id

Edita un servicio existente. **Auth:** administrador.

**Body**

```json
{ "descripcion": "Instalación, reparación y mantenimiento de gas" }
```

**Respuesta 200**

```json
{ "mensaje": "Servicio actualizado", "servicio": { "idServicio": 5, "nombreServicio": "Gasista", "descripcion": "Instalación, reparación y mantenimiento de gas" } }
```

**Errores:** `404` servicio inexistente.

### DELETE /api/admin/servicios/:id

Elimina un servicio. **Auth:** administrador.

No recibe body.

**Respuesta 204:** sin contenido.

**Errores:** `404` servicio inexistente, `409` el servicio tiene solicitudes o técnicos asociados.

---

## 4. Técnicos

### GET /api/tecnicos/me/servicios

Lista los servicios que ofrece el técnico autenticado. **Auth:** técnico.

No recibe body.

**Respuesta 200**

```json
{
  "servicios": [
    { "idServicio": 1, "nombreServicio": "Plomería" }
  ]
}
```

---

## 5. Solicitudes

### GET /api/solicitudes

Lista las solicitudes disponibles para aceptar. **Auth:** técnico.

No recibe body; el usuario se identifica por el token. Devuelve únicamente las solicitudes en estado `PENDIENTE` cuyo servicio ofrece el técnico autenticado (según `TecnicoServicio`), excluyendo las que ese técnico ya rechazó. Un técnico solo puede ver y aceptar solicitudes de los servicios que ofrece.

**Respuesta 200**

```json
{
  "solicitudes": [
    {
      "idSolicitud": 3,
      "detalle": "Arreglo de canilla que gotea",
      "estado": "PENDIENTE",
      "servicio": { "idServicio": 1, "nombreServicio": "Plomería" },
      "cliente": { "idUsuario": 5, "nombre": "Juan" }
    }
  ]
}
```

### POST /api/solicitudes

Crea una solicitud. **Auth:** cliente.

**Body**

```json
{ "idServicio": 1, "detalle": "Arreglo de canilla que gotea" }
```

**Respuesta 201**

```json
{
  "mensaje": "Solicitud creada correctamente",
  "solicitud": {
    "idSolicitud": 10,
    "detalle": "Arreglo de canilla que gotea",
    "estado": "PENDIENTE",
    "idCliente": 5,
    "idServicio": 1
  }
}
```

**Errores:** `400` datos inválidos, `404` servicio inexistente.

### GET /api/solicitudes/mias

Lista las solicitudes del cliente autenticado, en cualquier estado. **Auth:** cliente.

No recibe body.

**Respuesta 200**

```json
{
  "solicitudes": [
    {
      "idSolicitud": 10,
      "detalle": "Arreglo de canilla que gotea",
      "estado": "ACEPTADA",
      "servicio": { "idServicio": 1, "nombreServicio": "Plomería" },
      "tecnico": { "idUsuario": 8, "nombre": "María" }
    }
  ]
}
```

`tecnico` es `null` mientras la solicitud no fue aceptada.

### GET /api/solicitudes/asignadas

Lista las solicitudes que el técnico autenticado aceptó, en cualquier estado. **Auth:** técnico.

No recibe body.

**Respuesta 200**

```json
{
  "solicitudes": [
    { "idSolicitud": 10, "detalle": "Arreglo de canilla que gotea", "estado": "ACEPTADA" }
  ]
}
```

### GET /api/solicitudes/:id

Detalle de una solicitud puntual, incluyendo el estado del rechazo por técnicos. **Auth:** cliente dueño de la solicitud, técnico asignado o elegible, o administrador.

No recibe body.

**Respuesta 200**

```json
{
  "solicitud": {
    "idSolicitud": 10,
    "detalle": "Arreglo de canilla que gotea",
    "estado": "ACEPTADA",
    "servicio": { "idServicio": 1, "nombreServicio": "Plomería" },
    "cliente": { "idUsuario": 5, "nombre": "Juan" },
    "tecnico": { "idUsuario": 8, "nombre": "María" },
    "fechaCreacion": "2026-10-01T13:00:00.000Z",
    "fechaAceptacion": "2026-10-01T14:10:00.000Z",
    "fechaFinalizacion": null,
    "rechazos": { "tecnicosQueRechazaron": 1, "tecnicosElegibles": 3 }
  }
}
```

`rechazos` indica cuántos de los técnicos que ofrecen el servicio ya la rechazaron, sobre el total de técnicos elegibles para ese servicio.

**Errores:** `403` el usuario no tiene relación con la solicitud, `404` solicitud inexistente.

### GET /api/solicitudes/:id/eventos

Historial de eventos de una solicitud. **Auth:** cliente dueño de la solicitud, técnico asignado, o administrador.

No recibe body.

**Respuesta 200**

```json
{
  "eventos": [
    { "idEvento": 20, "nombreEvento": "SOLICITUD_CREADA", "fechaHora": "2026-10-01T13:00:00.000Z", "usuario": { "idUsuario": 5, "nombre": "Juan" } },
    { "idEvento": 21, "nombreEvento": "SOLICITUD_RECHAZADA", "fechaHora": "2026-10-01T13:40:00.000Z", "usuario": { "idUsuario": 9, "nombre": "Pedro" } },
    { "idEvento": 22, "nombreEvento": "SOLICITUD_ACEPTADA", "fechaHora": "2026-10-01T14:10:00.000Z", "usuario": { "idUsuario": 8, "nombre": "María" } }
  ]
}
```

**Errores:** `403` el usuario no tiene relación con la solicitud, `404` solicitud inexistente.

Los valores que puede tomar nombreEvento son: SOLICITUD_CREADA, SOLICITUD_ACEPTADA, SOLICITUD_RECHAZADA, SOLICITUD_EN_PROGRESO, SOLICITUD_COMPLETADA, SOLICITUD_CANCELADA. El paso automático a RECHAZADA no genera un evento propio.

### PATCH /api/solicitudes/:id/aceptar

Técnico acepta el trabajo. **Auth:** técnico.

No recibe body. `:id` es el identificador de la solicitud en la URL, por ejemplo `/api/solicitudes/10/aceptar`.

**Respuesta 200**

```json
{
  "mensaje": "Solicitud aceptada",
  "solicitud": { "idSolicitud": 10, "estado": "ACEPTADA", "idTecnico": 8 }
}
```

**Errores:** `403` el técnico no ofrece ese servicio, `404` solicitud inexistente, `409` la solicitud ya no está `PENDIENTE`.

### PATCH /api/solicitudes/:id/rechazar

Técnico rechaza el trabajo. **Auth:** técnico.

No recibe body. Registra el rechazo del técnico como evento `SOLICITUD_RECHAZADA`. La solicitud permanece en `PENDIENTE` mientras queden técnicos elegibles que no la hayan rechazado, y pasa a `RECHAZADA` recién cuando todos ellos la rechazaron.

**Respuesta 200** (quedan técnicos elegibles)

```json
{
  "mensaje": "Rechazo registrado",
  "solicitud": { "idSolicitud": 10, "estado": "PENDIENTE" }
}
```

**Respuesta 200** (rechazaron todos los técnicos elegibles)

```json
{
  "mensaje": "Rechazo registrado",
  "solicitud": { "idSolicitud": 10, "estado": "RECHAZADA" }
}
```

**Errores:** `403` el técnico no ofrece ese servicio, `404` solicitud inexistente, `409` la solicitud no está `PENDIENTE` o el técnico ya la rechazó.

### PATCH /api/solicitudes/:id/iniciar

Técnico comienza el trabajo. **Auth:** técnico asignado a la solicitud.

No recibe body. Pasa la solicitud de `ACEPTADA` a `EN_PROGRESO`.

**Respuesta 200**

```json
{
  "mensaje": "Solicitud en progreso",
  "solicitud": { "idSolicitud": 10, "estado": "EN_PROGRESO" }
}
```

**Errores:** `403` la solicitud no está asignada a este técnico, `409` la solicitud no está `ACEPTADA`.

### PATCH /api/solicitudes/:id/completar

Técnico finaliza el trabajo. **Auth:** técnico asignado a la solicitud.

No recibe body. Pasa la solicitud de `EN_PROGRESO` a `COMPLETADA` y completa `fechaFinalizacion`.

**Respuesta 200**

```json
{
  "mensaje": "Solicitud completada",
  "solicitud": { "idSolicitud": 10, "estado": "COMPLETADA", "fechaFinalizacion": "2026-10-05T15:30:00.000Z" }
}
```

**Errores:** `403` la solicitud no está asignada a este técnico, `409` la solicitud no está `EN_PROGRESO`.

### PATCH /api/solicitudes/:id/cancelar

Cliente o técnico cancela la solicitud. **Auth:** cliente dueño de la solicitud o técnico asignado.

No recibe body. Solo puede ejecutarse si la solicitud está en `PENDIENTE` o `ACEPTADA`.

**Respuesta 200**

```json
{
  "mensaje": "Solicitud cancelada",
  "solicitud": { "idSolicitud": 10, "estado": "CANCELADA" }
}
```

**Errores:** `403` el usuario no es parte de la solicitud, `409` el estado actual no permite cancelar.

---

## 6. Administración

### GET /api/admin/usuarios

Lista todos los usuarios registrados. **Auth:** administrador.

No recibe body.

**Respuesta 200**

```json
{
  "usuarios": [
    { "idUsuario": 1, "nombre": "Sofia", "email": "sofia@mail.com", "rol": "CLIENTE" },
    { "idUsuario": 8, "nombre": "María", "email": "maria@mail.com", "rol": "TECNICO" }
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
    { "idSolicitud": 3, "estado": "PENDIENTE", "cliente": { "idUsuario": 5, "nombre": "Juan" }, "tecnico": null },
    { "idSolicitud": 4, "estado": "COMPLETADA", "cliente": { "idUsuario": 6, "nombre": "Ana" }, "tecnico": { "idUsuario": 8, "nombre": "María" } }
  ]
}
```

---

## 7. Estados y reglas de negocio

| Estado    | Quién lo produce  | Endpoint |
|   ---     |       ---         |   ---      |
| `PENDIENTE` | Cliente         | `POST /api/solicitudes` |
| `ACEPTADA` | Técnico          | `PATCH /api/solicitudes/:id/aceptar` |
| `EN_PROGRESO`| Técnico       | `PATCH /api/solicitudes/:id/iniciar` |
| `COMPLETADA` | Técnico        | `PATCH /api/solicitudes/:id/completar` |
| `RECHAZADA` | Sistema         | resultado de `PATCH /api/solicitudes/:id/rechazar` |
| `CANCELADA` | Cliente o técnico | `PATCH /api/solicitudes/:id/cancelar` |

```
Cliente crea
     |
 PENDIENTE
     |
     |-------------------|
     v                    v
 ACEPTADA           técnico rechaza
     |                    |
     v                    v
EN_PROGRESO      quedan técnicos elegibles -> PENDIENTE
     |                    |
     v                    v
COMPLETADA       rechazaron todos -> RECHAZADA
```

`PENDIENTE` y `ACEPTADA` admiten además la transición a `CANCELADA`.

**Rechazo individual:** un rechazo de un técnico no cambia el estado general de la solicitud. La solicitud sigue `PENDIENTE` para que el resto de los técnicos que ofrecen ese servicio puedan aceptarla. Recién pasa a `RECHAZADA` cuando la cantidad de técnicos distintos que la rechazaron iguala a la cantidad de técnicos que ofrecen ese servicio (`TecnicoServicio`). Este conteo está disponible en `GET /api/solicitudes/:id` y el detalle de cada rechazo en `GET /api/solicitudes/:id/eventos`.

---

## 8. Resumen de endpoints
POST /api/auth/register — Público
POST /api/auth/login — Público
GET /api/auth/me — Autenticado
GET /api/servicios — Autenticado
GET /api/servicios/:id/tecnicos — Admin
POST /api/admin/servicios — Admin
PATCH /api/admin/servicios/:id — Admin
DELETE /api/admin/servicios/:id — Admin
GET /api/tecnicos/me/servicios — Técnico
GET /api/solicitudes — Técnico
POST /api/solicitudes — Cliente
GET /api/solicitudes/mias — Cliente
GET /api/solicitudes/asignadas — Técnico
GET /api/solicitudes/:id — Cliente/Técnico/Admin
GET /api/solicitudes/:id/eventos — Cliente/Técnico/Admin
PATCH /api/solicitudes/:id/aceptar — Técnico
PATCH /api/solicitudes/:id/rechazar — Técnico
PATCH /api/solicitudes/:id/iniciar — Técnico
PATCH /api/solicitudes/:id/completar — Técnico
PATCH /api/solicitudes/:id/cancelar — Cliente/Técnico
GET /api/admin/usuarios — Admin
GET /api/admin/solicitudes — Admin

