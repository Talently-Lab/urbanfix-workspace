
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProtectedRouteAccess } from './protectedRouteAccess.js'

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const access = getProtectedRouteAccess({ loading, user, allowedRole })

  if (access.type === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="rounded-full border border-cyan-400/30 bg-slate-900/80 px-5 py-3 text-sm font-medium tracking-[0.2em] text-cyan-300 uppercase shadow-2xl shadow-cyan-500/10">
          Cargando...
        </div>
      </div>
    )
  }

  if (access.type === 'redirect' && !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (access.type === 'redirect') {
    return <Navigate to={access.to} replace />
  }

  return children
}

export default ProtectedRoute
