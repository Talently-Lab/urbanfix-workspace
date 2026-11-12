import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { DashboardState } from './DashboardState.js'
import { DashboardWelcome, getDashboardDisplayName } from './DashboardWelcome.js'

test('dashboard welcome uses API name fields and falls back to email', () => {
  assert.equal(
    getDashboardDisplayName({ nombre: 'Sofia', apellido: 'Rodriguez', rol: 'CLIENTE' }),
    'Sofia Rodriguez'
  )
  assert.equal(getDashboardDisplayName({ email: 'sofia@example.com' }), 'sofia@example.com')
  assert.match(
    renderToStaticMarkup(DashboardWelcome({ user: { nombre: 'Sofia', apellido: 'Rodriguez' } })),
    /Sofia Rodriguez/
  )
})

test('dashboard empty, loading, and error states render without fabricated content', () => {
  const empty = renderToStaticMarkup(DashboardState({ empty: 'No hay solicitudes todavía.' }))
  assert.match(empty, /No hay solicitudes todavía/)

  const loading = renderToStaticMarkup(DashboardState({ loading: true }))
  assert.match(loading, /Cargando información/)

  const error = renderToStaticMarkup(DashboardState({ error: 'API no disponible' }))
  assert.match(error, /role="alert"/)
  assert.match(error, /API no disponible/)
})
