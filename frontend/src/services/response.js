export function requireArrayResponse(data, key) {
  const value = data?.[key]

  if (!Array.isArray(value)) {
    throw new Error('El servidor devolvió una respuesta inesperada. Intentá nuevamente.')
  }

  return value
}
