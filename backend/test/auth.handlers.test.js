const assert = require('node:assert/strict');
const test = require('node:test');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createAuthHandlers } = require('../src/controllers/auth.handlers');

process.env.JWT_SECRET = 'test-only-secret-for-auth-unit-tests';

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

test('login returns 401 for an unknown email', async () => {
  const handlers = createAuthHandlers({
    usuario: { findUnique: async () => null }
  });
  const response = createResponse();

  await handlers.login(
    { body: { email: 'nobody@example.invalid', password: 'not-a-password' } },
    response
  );

  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.body, {
    error: 'Email o contraseña incorrectos'
  });
});

test('login returns 401 for an incorrect password', async () => {
  const storedPassword = await bcrypt.hash('CorrectPassword123', 4);
  const handlers = createAuthHandlers({
    usuario: {
      findUnique: async () => ({
        idUsuario: 7,
        email: 'user@example.com',
        password: storedPassword,
        rol: 'CLIENTE'
      })
    }
  });
  const response = createResponse();

  await handlers.login(
    { body: { email: 'user@example.com', password: 'WrongPassword123' } },
    response
  );

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.token, undefined);
});

test('login returns a signed JWT only after bcrypt accepts the password', async () => {
  const storedPassword = await bcrypt.hash('CorrectPassword123', 4);
  const handlers = createAuthHandlers({
    usuario: {
      findUnique: async () => ({
        idUsuario: 7,
        email: 'user@example.com',
        nombre: 'Test',
        apellido: 'User',
        password: storedPassword,
        rol: 'CLIENTE',
        numeroTelefono: null
      }),
      update: async () => ({})
    },
    evento: {
      create: async () => ({})
    },
    $transaction: async (operations) => Promise.all(operations)
  });
  const response = createResponse();

  await handlers.login(
    { body: { email: 'USER@example.com', password: 'CorrectPassword123' } },
    response
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.usuario.rol, 'CLIENTE');
  assert.equal(jwt.verify(response.body.token, process.env.JWT_SECRET).userId, 7);
});

test('login reports a temporary service error when the database query fails', async () => {
  const databaseError = new Error('database unavailable');
  databaseError.code = 'P1001';
  const handlers = createAuthHandlers({
    usuario: {
      findUnique: async () => {
        throw databaseError;
      }
    }
  });
  const response = createResponse();
  const originalError = console.error;
  console.error = () => {};

  try {
    await handlers.login(
      { body: { email: 'user@example.com', password: 'CorrectPassword123' } },
      response
    );
  } finally {
    console.error = originalError;
  }

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.token, undefined);
});

test('login keeps unexpected application failures distinct from unavailable services', async () => {
  const handlers = createAuthHandlers({
    usuario: {
      findUnique: async () => {
        throw new Error('unexpected query failure');
      }
    }
  });
  const response = createResponse();
  const originalError = console.error;
  console.error = () => {};

  try {
    await handlers.login(
      { body: { email: 'user@example.com', password: 'CorrectPassword123' } },
      response
    );
  } finally {
    console.error = originalError;
  }

  assert.equal(response.statusCode, 500);
  assert.equal(response.body.token, undefined);
});

test('public registration rejects administrator accounts before database access', async () => {
  const handlers = createAuthHandlers({
    $transaction: async () => {
      throw new Error('Database must not be reached');
    }
  });
  const response = createResponse();

  await handlers.register(
    {
      body: {
        nombre: 'Admin',
        apellido: 'Test',
        email: 'admin@example.com',
        password: 'CorrectPassword123',
        rol: 'ADMINISTRADOR'
      }
    },
    response
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, 'Rol inválido');
});

test('registration stores a bcrypt hash and does not issue a token', async () => {
  let createdData;
  const transaction = {
    usuario: {
      findUnique: async () => null,
      create: async ({ data }) => {
        createdData = data;
        return {
          idUsuario: 8,
          email: data.email,
          nombre: data.nombre,
          apellido: data.apellido,
          rol: data.rol,
          numeroTelefono: data.numeroTelefono
        };
      }
    }
  };
  const handlers = createAuthHandlers({
    $transaction: (callback) => callback(transaction)
  });
  const response = createResponse();

  await handlers.register(
    {
      body: {
        nombre: ' Test ',
        apellido: ' User ',
        email: ' USER@Example.com ',
        password: 'CorrectPassword123',
        rol: 'CLIENTE'
      }
    },
    response
  );

  assert.equal(response.statusCode, 201);
  assert.equal(createdData.email, 'user@example.com');
  assert.equal(await bcrypt.compare('CorrectPassword123', createdData.password), true);
  assert.equal(response.body.token, undefined);
});

test('session endpoint returns 401 when the token user no longer exists', async () => {
  const handlers = createAuthHandlers({
    usuario: { findUnique: async () => null }
  });
  const response = createResponse();

  await handlers.me({ user: { userId: 99 } }, response);

  assert.equal(response.statusCode, 401);
});

test('session endpoint returns the current user in the documented envelope', async () => {
  const user = {
    idUsuario: 7,
    email: 'user@example.com',
    nombre: 'Test',
    apellido: 'User',
    rol: 'CLIENTE',
    numeroTelefono: null
  };
  const handlers = createAuthHandlers({
    usuario: { findUnique: async () => user }
  });
  const response = createResponse();

  await handlers.me({ user: { userId: 7 } }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { usuario: user });
});
