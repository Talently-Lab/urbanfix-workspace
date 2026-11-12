import assert from 'node:assert/strict'
import test from 'node:test'
import { requireArrayResponse } from './response.js'

test('requireArrayResponse returns the documented array field', () => {
  const values = [{ id: 1 }]
  assert.equal(requireArrayResponse({ records: values }, 'records'), values)
})

test('requireArrayResponse rejects missing or unexpected response shapes', () => {
  assert.throws(
    () => requireArrayResponse({}, 'records'),
    /respuesta inesperada/
  )
  assert.throws(
    () => requireArrayResponse({ records: {} }, 'records'),
    /respuesta inesperada/
  )
})
