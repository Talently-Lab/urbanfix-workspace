# Contrato de API — UrbanFix Solutions

Documento de diseño de los endpoints del backend. Semana 2.

---

## 1. POST /api/auth/register
**Auth:** No requiere.

**Recibe (body):**
{ "nombre": "Sofia", "apellido": "Rodriguez", "email": "sofia@mail.com", "password": "123456", "rol": "CLIENTE", "numeroTelefono": "1122334455" }

**Devuelve:**
{ "mensaje": "Usuario creado correctamente", "usuario": { "idUsuario": 1, "nombre": "Sofia", "email": "sofia@mail.com", "rol": "CLIENTE" } }

---

## 2. POST /api/auth/login
**Auth:** No requiere.

**Recibe (body):**
{ "email": "sofia@mail.com", "password": "123456" }

**Devuelve:**
{ "token": "eyJhbGciOiJIUzI1NiIs...", "usuario": { "idUsuario": 1, "nombre": "Sofia", "rol": "CLIENTE" } }

---

## 3. GET /api/solicitudes
**Auth:** Técnico.

**Recibe (body):** No recibe. Es un GET, la URL sola alcanza. El servidor identifica al usuario por el token que viaja en los headers.

**Devuelve:** Lista de solicitudes en estado PENDIENTE.
{ "solicitudes": [ { "idSolicitud": 3, "detalle": "Arreglo de canilla que gotea", "estado": "PENDIENTE", "servicio": { "idServicio": 1, "nombreServicio": "Plomería" }, "cliente": { "idUsuario": 5, "nombre": "Juan" } } ] }

---

## 4. POST /api/solicitudes
**Auth:** Cliente.

**Recibe (body):**
{ "idServicio": 1, "detalle": "Arreglo de canilla que gotea" }

**Devuelve:**
{ "mensaje": "Solicitud creada correctamente", "solicitud": { "idSolicitud": 10, "detalle": "Arreglo de canilla que gotea", "estado": "PENDIENTE", "idCliente": 5, "idServicio": 1 } }

---

## 5. GET /api/solicitudes/mias
**Auth:** Cliente.

**Recibe (body):** No recibe. Muestra solo las solicitudes propias del usuario logueado.

**Devuelve:**
{ "solicitudes": [ { "idSolicitud": 10, "detalle": "Arreglo de canilla que gotea", "estado": "PENDIENTE" } ] }

---

## 6. PATCH /api/solicitudes/:id/aceptar
**Auth:** Técnico.

**Recibe (body):** No recibe. El :id es un parámetro de ruta (path param): va el número real de la solicitud en la URL, ej. /api/solicitudes/12/aceptar.

**Devuelve:**
{ "mensaje": "Solicitud aceptada", "solicitud": { "idSolicitud": 10, "estado": "ACEPTADA", "idTecnico": 8 } }

---

## 7. PATCH /api/solicitudes/:id/rechazar
**Auth:** Técnico.

**Recibe (body):** No recibe. El :id va en la URL, igual que en el endpoint anterior.

**Devuelve:**
{ "mensaje": "Solicitud rechazada", "solicitud": { "idSolicitud": 10, "estado": "RECHAZADA" } }

---

## 8. GET /api/admin/usuarios
**Auth:** Admin.

**Recibe (body):** No recibe.

**Devuelve:** Lista completa de todos los usuarios registrados.
{ "usuarios": [ { "idUsuario": 1, "nombre": "Sofia", "email": "sofia@mail.com", "rol": "CLIENTE" }, { "idUsuario": 8, "nombre": "María", "email": "maria@mail.com", "rol": "TECNICO" } ] }

---

## 9. GET /api/admin/solicitudes
**Auth:** Admin.

**Recibe (body):** No recibe.

**Devuelve:** Lista completa de todas las solicitudes, sin importar estado ni dueño.
{ "solicitudes": [ { "idSolicitud": 3, "estado": "PENDIENTE", "cliente": { "idUsuario": 5, "nombre": "Juan" } }, { "idSolicitud": 4, "estado": "COMPLETADA", "cliente": { "idUsuario": 6, "nombre": "Ana" }, "tecnico": { "idUsuario": 8, "nombre": "María" } } ] }
