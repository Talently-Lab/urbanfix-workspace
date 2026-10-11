
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleMeta = {
  CLIENTE: {
    label: 'Cliente',
    accent: 'from-cyan-500 to-blue-500',
    description: 'Solicita servicios y sigue tus trabajos.',
  },
  TECNICO: {
    label: 'Técnico',
    accent: 'from-purple-500 to-violet-600',
    description: 'Gestiona pedidos y disponibilidad.',
  },
  ADMINISTRADOR: {
    label: 'Administrador',
    accent: 'from-amber-400 to-orange-500',
    description: 'Supervisa servicios y actividad.',
  },
}

const rolePaths = {
  CLIENTE: '/Client',
  TECNICO: '/Technician',
  ADMINISTRADOR: '/Admin',
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { user, login, sessionError } = useAuth()

  useEffect(() => {
    if (user?.rol && rolePaths[user.rol]) {
      navigate(rolePaths[user.rol], { replace: true })
    }
  }, [user, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Completá tu email y contraseña para continuar.')
      return
    }

    setSubmitting(true)

    try {
      const usuario = await login(email.trim(), password)
      const destination = rolePaths[usuario.rol]

      if (!destination) {
        setError('El servidor devolvió un rol que no está habilitado en la aplicación.')
        return
      }

      navigate(destination, { replace: true })
    } catch (err) {
      const status = err.response?.status

      if (status === 401) {
        setError('El email o la contraseña son incorrectos.')
      } else if (status === 400) {
        setError(err.response?.data?.error || 'Revisá los datos ingresados.')
      } else if (err.response) {
        setError(err.response.data?.error || 'No se pudo iniciar sesión.')
      } else {
        setError('No se pudo conectar con el servidor. Verificá que el backend esté iniciado.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),transparent_35%),linear-gradient(135deg,#020817_0%,#0f172a_35%,#111827_100%)] px-4 py-12 text-slate-100">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col justify-center rounded-[32px] border border-slate-800/80 bg-slate-900/60 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-sm sm:p-10">
          <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
            UrbanFix
          </div>

          <h1 className="max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl">
            Conecta clientes con profesionales de confianza en minutos.
          </h1>

          <p className="mt-5 max-w-lg text-base text-slate-300 sm:text-lg">
            Resolvemos trabajos de hogar, mantenimiento y reparación con una experiencia moderna, rápida y segura.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {Object.entries(roleMeta).map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className={`mb-3 h-2.5 w-16 rounded-full bg-gradient-to-r ${value.accent}`} />
                <p className="text-sm font-semibold text-white">{value.label}</p>
                <p className="mt-2 text-xs text-slate-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/50 backdrop-blur-sm sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Acceso</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Iniciar sesión</h2>
          </div>

          {location.state?.message && (
            <p className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200" role="status">
              {location.state.message}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                Correo
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="correo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Ingresá tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {error && (
              <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            {sessionError && !error && (
              <div role="alert" className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                {sessionError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-400">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="font-semibold text-cyan-300 hover:text-cyan-200">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
