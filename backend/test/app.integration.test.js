const assert = require('node:assert/strict');
const test = require('node:test');
const jwt = require('jsonwebtoken');
const { createApp } = require('../index');

const testSecret = 'test-only-secret-for-auth-unit-tests';

async function withServer(callback) {
  const server = createApp().listen(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  try {
    const address = server.address();
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

test('health remains available when database and JWT configuration are missing', async () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalJwtSecret = process.env.JWT_SECRET;
  delete process.env.DATABASE_URL;
  delete process.env.JWT_SECRET;

  try {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/health`);
      assert.equal(response.status, 200);
      assert.equal((await response.json()).status, 'ok');
    });
  } finally {
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
  }
});

test('auth routes report missing JWT configuration without preventing app startup', async () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;

  try {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/me`);
      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), {
        error: 'La autenticación no está configurada'
      });
    });
  } finally {
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
  }
});

test('auth routes reject missing credentials with 401 without accessing the database', async () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = testSecret;
  const originalDatabaseUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;

  try {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/me`);
      assert.equal(response.status, 401);
      assert.deepEqual(await response.json(), { error: 'Token requerido' });
    });
  } finally {
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
  }
});

test('authenticated routes report missing database configuration as 503', async () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalJwtSecret = process.env.JWT_SECRET;
  delete process.env.DATABASE_URL;
  process.env.JWT_SECRET = testSecret;
  const token = jwt.sign({ userId: 1, role: 'CLIENTE' }, testSecret, { expiresIn: '1m' });
  const originalError = console.error;
  console.error = () => {};

  try {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/servicios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      assert.equal(response.status, 503);
    });
  } finally {
    console.error = originalError;
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
  }
});
