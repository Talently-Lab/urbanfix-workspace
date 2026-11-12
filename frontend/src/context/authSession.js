export const validRoles = ['CLIENTE', 'TECNICO', 'ADMINISTRADOR']

export function validateSessionUser(user) {
  if (
    !user ||
    !Number.isInteger(user.idUsuario) ||
    !validRoles.includes(user.rol)
  ) {
    throw new Error('El servidor devolvió una sesión inválida.')
  }

  return user
}

export async function loginWithCredentials(api, email, password) {
  const response = await api.post('/auth/login', { email, password })
  const usuario = validateSessionUser(response.data?.usuario)
  const token = response.data?.token

  if (typeof token !== 'string' || !token) {
    throw new Error('La respuesta del servidor no contiene usuario y token.')
  }

  return { usuario, token }
}

export async function restoreSession(api) {
  const response = await api.get('/auth/me')
  return validateSessionUser(response.data?.usuario)
}

export function persistSession(storage, usuario, token) {
  storage.setItem('user', JSON.stringify(usuario))
  storage.setItem('token', token)
}

export function clearPersistedSession(storage) {
  storage.removeItem('token')
  storage.removeItem('user')
}
