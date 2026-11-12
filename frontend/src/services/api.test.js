import assert from 'node:assert/strict'
import test from 'node:test'
import api from './api.js'

function withBrowserSession(callback) {
  const originalStorage = globalThis.localStorage
  const originalWindow = globalThis.window
  const values = new Map([
    ['token', 'test.jwt.token'],
    ['user', JSON.stringify({ idUsuario: 7, rol: 'CLIENTE' })],
  ])
  const events = []

  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
  }
  globalThis.window = {
    dispatchEvent: (event) => {
      events.push(event)
      return true
    },
  }

  return Promise.resolve(callback({ values, events })).finally(() => {
    if (originalStorage === undefined) delete globalThis.localStorage
    else globalThis.localStorage = originalStorage
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
  })
}

test('Axios request interceptor sends a stored Bearer token', async () => {
  const originalAdapter = api.defaults.adapter
  let authorization
  api.defaults.adapter = async (config) => {
    authorization = config.headers.get('Authorization')
    return {
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }
  }

  try {
    await withBrowserSession(async () => {
      await api.get('/auth/me')
      assert.equal(authorization, 'Bearer test.jwt.token')
    })
  } finally {
    api.defaults.adapter = originalAdapter
  }
})

test('Axios 401 interceptor clears persisted state and notifies React once', async () => {
  const originalAdapter = api.defaults.adapter
  api.defaults.adapter = async () => {
    const error = new Error('Unauthorized')
    error.response = { status: 401 }
    throw error
  }

  try {
    await withBrowserSession(async ({ values, events }) => {
      await assert.rejects(api.get('/solicitudes/mias'))
      assert.equal(values.has('token'), false)
      assert.equal(values.has('user'), false)
      assert.equal(events.length, 1)
      assert.equal(events[0].type, 'urbanfix:unauthorized')
    })
  } finally {
    api.defaults.adapter = originalAdapter
  }
})

test('Axios 403 interceptor preserves a valid session', async () => {
  const originalAdapter = api.defaults.adapter
  api.defaults.adapter = async () => {
    const error = new Error('Forbidden')
    error.response = { status: 403 }
    throw error
  }

  try {
    await withBrowserSession(async ({ values, events }) => {
      await assert.rejects(api.get('/admin/usuarios'))
      assert.equal(values.has('token'), true)
      assert.equal(values.has('user'), true)
      assert.equal(events.length, 0)
    })
  } finally {
    api.defaults.adapter = originalAdapter
  }
})
