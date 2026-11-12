const assert = require('node:assert/strict');
const test = require('node:test');
const jwt = require('jsonwebtoken');
const { createAuthMiddleware, authorize } = require('../src/middleware/auth.middleware');

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

test('authenticate rejects missing and expired tokens', async () => {
  const { authenticate } = createAuthMiddleware(() => ({
    usuario: { findUnique: async () => ({ rol: 'CLIENTE' }) }
  }));
  const missingResponse = createResponse();
  await authenticate({ headers: {} }, missingResponse, () => {
    assert.fail('A request without a token must not authenticate');
  });
  assert.equal(missingResponse.statusCode, 401);

  const expiredToken = jwt.sign(
    { userId: 1, role: 'CLIENTE', exp: Math.floor(Date.now() / 1000) - 1 },
    process.env.JWT_SECRET
  );
  const expiredResponse = createResponse();
  await authenticate(
    { headers: { authorization: `Bearer ${expiredToken}` } },
    expiredResponse,
    () => assert.fail('An expired token must not authenticate')
  );
  assert.equal(expiredResponse.statusCode, 401);
});

test('authorize rejects a valid user whose role does not match', () => {
  const response = createResponse();
  let nextCalled = false;
  authorize('ADMINISTRADOR')(
    { user: { userId: 1, role: 'CLIENTE' } },
    response,
    () => {
      nextCalled = true;
    }
  );

  assert.equal(response.statusCode, 403);
  assert.equal(nextCalled, false);
});

test('authenticate accepts a valid token when its current database role matches', async () => {
  const token = jwt.sign(
    { userId: 1, role: 'TECNICO' },
    process.env.JWT_SECRET,
    { expiresIn: '1m' }
  );
  const { authenticate } = createAuthMiddleware(() => ({
    usuario: { findUnique: async () => ({ rol: 'TECNICO' }) }
  }));
  const response = createResponse();
  let nextCalled = false;
  const request = { headers: { authorization: `Bearer ${token}` } };

  await authenticate(request, response, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(request.user.userId, 1);
  assert.equal(request.user.role, 'TECNICO');
});

test('authenticate invalidates tokens after a user role changes', async () => {
  const token = jwt.sign(
    { userId: 1, role: 'CLIENTE' },
    process.env.JWT_SECRET,
    { expiresIn: '1m' }
  );
  const { authenticate } = createAuthMiddleware(() => ({
    usuario: { findUnique: async () => ({ rol: 'ADMINISTRADOR' }) }
  }));
  const response = createResponse();

  await authenticate(
    { headers: { authorization: `Bearer ${token}` } },
    response,
    () => assert.fail('A token with a stale role must not authenticate')
  );

  assert.equal(response.statusCode, 401);
});

test('authenticate reports 503 when the database is unavailable', async () => {
  const databaseError = new Error('database unavailable');
  databaseError.code = 'P1001';
  const { authenticate } = createAuthMiddleware(() => {
    throw databaseError;
  });
  const token = jwt.sign(
    { userId: 1, role: 'CLIENTE' },
    process.env.JWT_SECRET,
    { expiresIn: '1m' }
  );
  const response = createResponse();
  const originalError = console.error;
  console.error = () => {};

  try {
    await authenticate(
      { headers: { authorization: `Bearer ${token}` } },
      response,
      () => assert.fail('An unavailable database must not authenticate')
    );
  } finally {
    console.error = originalError;
  }

  assert.equal(response.statusCode, 503);
});

test('authenticate keeps unexpected application failures distinct from unavailable services', async () => {
  const { authenticate } = createAuthMiddleware(() => {
    throw new Error('unexpected query failure');
  });
  const token = jwt.sign(
    { userId: 1, role: 'CLIENTE' },
    process.env.JWT_SECRET,
    { expiresIn: '1m' }
  );
  const response = createResponse();
  const originalError = console.error;
  console.error = () => {};

  try {
    await authenticate(
      { headers: { authorization: `Bearer ${token}` } },
      response,
      () => assert.fail('An unexpected database failure must not authenticate')
    );
  } finally {
    console.error = originalError;
  }

  assert.equal(response.statusCode, 500);
});
