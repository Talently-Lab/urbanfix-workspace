
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleLabels = {
  CLIENTE: 'Cliente',
  TECNICO: 'Técnico',
  ADMINISTRADOR: 'Admin'
}

const rolePaths = {
  CLIENTE: '/Client',
  TECNICO: '/Technician',
  ADMINISTRADOR: '/Admin'
}

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 font-black text-white shadow-lg shadow-cyan-500/20">
            U
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-white">UrbanFix</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Marketplace</div>
          </div>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-slate-300 transition hover:text-cyan-300">
            Inicio
          </Link>
          {user && rolePaths[user.rol] && (
            <Link to={rolePaths[user.rol]} className="text-sm font-medium text-slate-300 transition hover:text-cyan-300">
              Mi panel
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 sm:block">
                {roleLabels[user.rol] || 'Usuario'}
              </div>
              <span className="text-sm font-medium text-slate-200">
                {user.name || user.nombre || user.email || 'Usuario'}
              </span>
            </>
          ) : (
            <Link to="/login" className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300">
              Ingresar
            </Link>
          )}

          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:brightness-110"
            >
              Salir
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
