import assert from 'node:assert/strict'
import test from 'node:test'
import {
  clearPersistedSession,
  loginWithCredentials,
  persistSession,
  restoreSession,
} from './authSession.js'

test('login sends the real credentials and accepts the backend response contract', async () => {
  let request
  const session = await loginWithCredentials(
    {
      post: async (...args) => {
        request = args
        return {
          data: {
            usuario: { idUsuario: 12, email: 'cliente@example.com', rol: 'CLIENTE' },
            token: 'signed.jwt.token',
          },
        }
      },
    },
    'cliente@example.com',
    'correct-password'
  )

  assert.deepEqual(request, [
    '/auth/login',
    { email: 'cliente@example.com', password: 'correct-password' },
  ])
  assert.equal(session.usuario.rol, 'CLIENTE')
  assert.equal(session.token, 'signed.jwt.token')
})

test('login rejects failed or unexpected authentication responses', async () => {
  await assert.rejects(
    loginWithCredentials(
      { post: async () => { throw Object.assign(new Error('Unauthorized'), { response: { status: 401 } }) } },
      'missing@example.com',
      'incorrect-password'
    ),
    (error) => error.response.status === 401
  )
  await assert.rejects(
    loginWithCredentials({ post: async () => ({ data: { usuario: null, token: 'fake' } }) }, 'x', 'y'),
    /sesión inválida/
  )
})

test('session restoration validates /auth/me and rejects expired sessions', async () => {
  const calls = []
  const user = await restoreSession({
    get: async (path) => {
      calls.push(path)
      return { data: { usuario: { idUsuario: 2, rol: 'TECNICO' } } }
    },
  })
  assert.deepEqual(calls, ['/auth/me'])
  assert.equal(user.rol, 'TECNICO')

  await assert.rejects(
    restoreSession({
      get: async () => {
        throw Object.assign(new Error('Expired'), { response: { status: 401 } })
      },
    }),
    (error) => error.response.status === 401
  )
})

test('logout removes the persisted token and user', () => {
  const values = new Map()
  const storage = {
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }

  persistSession(storage, { idUsuario: 2, rol: 'TECNICO' }, 'jwt.token')
  assert.equal(values.get('token'), 'jwt.token')
  assert.equal(JSON.parse(values.get('user')).rol, 'TECNICO')

  clearPersistedSession(storage)
  assert.equal(values.size, 0)
})
