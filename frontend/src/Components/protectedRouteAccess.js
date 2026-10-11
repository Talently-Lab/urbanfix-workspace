const rolePaths = {
  CLIENTE: '/Client',
  TECNICO: '/Technician',
  ADMINISTRADOR: '/Admin',
}

const roleAliases = {
  client: 'CLIENTE',
  technician: 'TECNICO',
  admin: 'ADMINISTRADOR',
}

export function getProtectedRouteAccess({ loading, user, allowedRole }) {
  if (loading) {
    return { type: 'loading' }
  }

  if (!user) {
    return { type: 'redirect', to: '/login' }
  }

  const currentRole = roleAliases[user.role] || user.rol
  const requiredRole = roleAliases[allowedRole] || allowedRole

  if (currentRole !== requiredRole) {
    return {
      type: 'redirect',
      to: rolePaths[currentRole] || '/login',
    }
  }

  return { type: 'allow' }
}
