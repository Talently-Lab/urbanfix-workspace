import assert from 'node:assert/strict'
import test from 'node:test'
import { getProtectedRouteAccess } from './protectedRouteAccess.js'

const roles = [
  ['CLIENTE', 'client', '/Client'],
  ['TECNICO', 'technician', '/Technician'],
  ['ADMINISTRADOR', 'admin', '/Admin'],
]

test('protected routes wait for session restoration before redirecting', () => {
  assert.deepEqual(
    getProtectedRouteAccess({ loading: true, user: null, allowedRole: 'CLIENTE' }),
    { type: 'loading' }
  )
  assert.deepEqual(
    getProtectedRouteAccess({ loading: false, user: null, allowedRole: 'CLIENTE' }),
    { type: 'redirect', to: '/login' }
  )
})

test('each canonical role is allowed only on its own dashboard', () => {
  for (const [role, alias, path] of roles) {
    assert.deepEqual(
      getProtectedRouteAccess({
        loading: false,
        user: { rol: role },
        allowedRole: alias,
      }),
      { type: 'allow' }
    )

    for (const [otherRole, otherAlias] of roles) {
      if (role !== otherRole) {
        assert.deepEqual(
          getProtectedRouteAccess({
            loading: false,
            user: { rol: role },
            allowedRole: otherAlias,
          }),
          { type: 'redirect', to: path }
        )
      }
    }
  }
})
