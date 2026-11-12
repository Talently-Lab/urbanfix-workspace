const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');
const jwt = require('jsonwebtoken');

const jwtSecret = 'test-only-secret-for-workflow-tests-32';
process.env.JWT_SECRET = jwtSecret;

const users = new Map([
  [1, { rol: 'CLIENTE' }],
  [2, { rol: 'TECNICO' }],
  [3, { rol: 'ADMINISTRADOR' }],
]);
const requests = new Map();
const events = [];
let nextRequestId = 1;

function resetState() {
  requests.clear();
  events.length = 0;
  nextRequestId = 1;
}

function matchesRequest(request, where = {}) {
  if (where.idSolicitud !== undefined && request.idSolicitud !== where.idSolicitud) return false;
  if (where.idCliente !== undefined && request.idCliente !== where.idCliente) return false;
  if (where.idTecnico !== undefined && request.idTecnico !== where.idTecnico) return false;
  if (where.estado !== undefined) {
    if (typeof where.estado === 'string' && request.estado !== where.estado) return false;
    if (where.estado.in && !where.estado.in.includes(request.estado)) return false;
  }
  if (where.idServicio?.in && !where.idServicio.in.includes(request.idServicio)) return false;
  return true;
}

const prisma = {
  usuario: {
    findUnique: async ({ where }) => users.get(where.idUsuario) ?? null,
  },
  servicio: {
    findUnique: async ({ where }) => where.idServicio === 1
      ? { idServicio: 1, nombreServicio: 'Plomería' }
      : null,
  },
  tecnicoServicio: {
    findMany: async ({ where }) => where.idTecnico === 2 ? [{ idServicio: 1 }] : [],
    findUnique: async ({ where }) => (
      where.idTecnico_idServicio.idTecnico === 2 &&
      where.idTecnico_idServicio.idServicio === 1
        ? { idTecnico: 2, idServicio: 1 }
        : null
    ),
    count: async ({ where }) => where.idServicio === 1 ? 1 : 0,
  },
  solicitud: {
    create: async ({ data }) => {
      const request = {
        ...data,
        idSolicitud: nextRequestId++,
        idTecnico: data.idTecnico ?? null,
        estado: 'PENDIENTE',
        fechaCreacion: new Date(),
        fechaAceptacion: null,
        fechaFinalizacion: null,
        servicio: { idServicio: data.idServicio, nombreServicio: 'Plomería' },
        cliente: { idUsuario: data.idCliente, nombre: 'Cliente', apellido: 'Prueba' },
        tecnico: null,
      };
      requests.set(request.idSolicitud, request);
      return request;
    },
    findMany: async ({ where }) => [...requests.values()].filter((item) => matchesRequest(item, where)),
    findUnique: async ({ where }) => requests.get(where.idSolicitud) ?? null,
    updateMany: async ({ where, data }) => {
      const request = requests.get(where.idSolicitud);
      if (!request || !matchesRequest(request, where)) return { count: 0 };
      Object.assign(request, data);
      return { count: 1 };
    },
  },
  evento: {
    create: async ({ data }) => {
      const event = { ...data, idEvento: events.length + 1, fechaHora: new Date() };
      events.push(event);
      return event;
    },
    findFirst: async ({ where }) => events.find((item) => (
      item.idSolicitud === where.idSolicitud &&
      item.idUsuario === where.idUsuario &&
      item.nombreEvento === where.nombreEvento
    )) ?? null,
    count: async ({ where }) => events.filter((item) => (
      item.idSolicitud === where.idSolicitud &&
      item.nombreEvento === where.nombreEvento
    )).length,
  },
  $transaction: async (callback) => callback(prisma),
};

const prismaPath = require.resolve('../src/lib/prisma');
const previousPrismaModule = require.cache[prismaPath];
const mockedPrismaModule = new Module(prismaPath);
mockedPrismaModule.filename = prismaPath;
mockedPrismaModule.loaded = true;
mockedPrismaModule.exports = () => prisma;
require.cache[prismaPath] = mockedPrismaModule;

const { createApp } = require('../index');

test.after(() => {
  if (previousPrismaModule) require.cache[prismaPath] = previousPrismaModule;
  else delete require.cache[prismaPath];
});

async function withServer(callback) {
  const server = createApp().listen(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  try {
    await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

function authHeaders(userId, role) {
  return {
    Authorization: `Bearer ${jwt.sign({ userId, role }, jwtSecret, { expiresIn: '1m' })}`,
    'Content-Type': 'application/json',
  };
}

async function send(baseUrl, path, userId, role, method = 'GET', body) {
  return fetch(`${baseUrl}/api${path}`, {
    method,
    headers: authHeaders(userId, role),
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

test('client request creation persists every form field and appears in the client list', async () => {
  resetState();
  await withServer(async (baseUrl) => {
    const createdResponse = await send(baseUrl, '/solicitudes', 1, 'CLIENTE', 'POST', {
      titulo: 'Canilla con pérdida',
      detalle: 'La canilla pierde agua debajo de la pileta.',
      direccion: 'Av. Rivadavia 4500',
      idServicio: 1,
      instanciaFormularioId: 'form-001',
    });

    assert.equal(createdResponse.status, 201);
    const created = await createdResponse.json();
    assert.equal(created.titulo, 'Canilla con pérdida');
    assert.equal(created.detalle, 'La canilla pierde agua debajo de la pileta.');
    assert.equal(created.direccion, 'Av. Rivadavia 4500');
    assert.equal(created.idServicio, 1);
    assert.equal(events.length, 1);
    assert.equal(events[0].nombreEvento, 'SOLICITUD_CREADA');
    assert.equal(events[0].instanciaFormularioId, 'form-001');

    const listResponse = await send(baseUrl, '/solicitudes/mias', 1, 'CLIENTE');
    assert.equal(listResponse.status, 200);
    const listed = await listResponse.json();
    assert.deepEqual(listed.map((item) => item.idSolicitud), [created.idSolicitud]);
    assert.equal(listed[0].titulo, 'Canilla con pérdida');
  });
});

test('request creation rejects missing, blank, malformed, and overlong fields', async () => {
  resetState();
  await withServer(async (baseUrl) => {
    const validBody = {
      titulo: 'Canilla con pérdida',
      detalle: 'La canilla pierde agua.',
      direccion: 'Av. Rivadavia 4500',
      idServicio: 1,
    };
    const invalidBodies = [
      { ...validBody, titulo: '   ' },
      { ...validBody, titulo: 't'.repeat(101) },
      { ...validBody, detalle: null },
      { ...validBody, detalle: '   ' },
      { ...validBody, detalle: 'd'.repeat(1001) },
      { ...validBody, idServicio: 0 },
      { titulo: validBody.titulo, detalle: validBody.detalle, idServicio: 1 },
      { ...validBody, direccion: '   ' },
      { ...validBody, direccion: 'd'.repeat(201) },
    ];

    for (const body of invalidBodies) {
      const response = await send(baseUrl, '/solicitudes', 1, 'CLIENTE', 'POST', body);
      assert.equal(response.status, 400);
      assert.equal(typeof (await response.json()).error, 'string');
    }

    assert.equal(requests.size, 0);
  });
});

test('technician actions and administrator filter/cancel routes update request state', async () => {
  resetState();
  await withServer(async (baseUrl) => {
    const createdResponse = await send(baseUrl, '/solicitudes', 1, 'CLIENTE', 'POST', {
      titulo: 'Trabajo para aceptar',
      detalle: 'Detalle del trabajo',
      direccion: 'Calle 123',
      idServicio: 1,
    });
    const created = await createdResponse.json();

    const availableResponse = await send(baseUrl, '/solicitudes', 2, 'TECNICO');
    assert.equal(availableResponse.status, 200);
    assert.deepEqual(
      (await availableResponse.json()).map((item) => item.idSolicitud),
      [created.idSolicitud],
    );

    const acceptResponse = await send(
      baseUrl,
      `/solicitudes/${created.idSolicitud}/aceptar`,
      2,
      'TECNICO',
      'PATCH',
      {},
    );
    assert.equal(acceptResponse.status, 200);
    assert.equal((await acceptResponse.json()).solicitud.estado, 'ACEPTADA');

    const rejectedCreateResponse = await send(baseUrl, '/solicitudes', 1, 'CLIENTE', 'POST', {
      titulo: 'Trabajo para rechazar',
      detalle: 'Otro detalle',
      direccion: 'Calle 456',
      idServicio: 1,
    });
    const rejectedRequest = await rejectedCreateResponse.json();
    const rejectResponse = await send(
      baseUrl,
      `/solicitudes/${rejectedRequest.idSolicitud}/rechazar`,
      2,
      'TECNICO',
      'PATCH',
      {},
    );
    assert.equal(rejectResponse.status, 200);
    assert.equal((await rejectResponse.json()).solicitud.estado, 'RECHAZADA');

    const filteredResponse = await send(baseUrl, '/admin/solicitudes?estado=ACEPTADA', 3, 'ADMINISTRADOR');
    assert.equal(filteredResponse.status, 200);
    assert.deepEqual(
      (await filteredResponse.json()).solicitudes.map((item) => item.idSolicitud),
      [created.idSolicitud],
    );

    const cancelResponse = await send(
      baseUrl,
      `/admin/solicitudes/${created.idSolicitud}/cancelar`,
      3,
      'ADMINISTRADOR',
      'PATCH',
      {},
    );
    assert.equal(cancelResponse.status, 200);
    assert.equal((await cancelResponse.json()).solicitud.estado, 'CANCELADA');
    assert.equal(events.at(-1).nombreEvento, 'SOLICITUD_CANCELADA');
  });
});
