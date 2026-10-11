import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const steps = [
  'Elegí el servicio que necesitás',
  'Creá una solicitud con el detalle del trabajo',
  'Seguí el estado desde tu panel'
]

const rolePaths = {
  CLIENTE: '/Client',
  TECNICO: '/Technician',
  ADMINISTRADOR: '/Admin',
}

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),transparent_30%),linear-gradient(135deg,#020817_0%,#0f172a_50%,#111827_100%)] p-6 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                UrbanFix
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Soluciones rápidas para tu hogar y negocio.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-300">
                Conecta con profesionales verificados en plomería, electricidad, carpintería y más. Todo desde una sola plataforma.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to={user ? rolePaths[user.rol] || '/login' : '/login'}
                  className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-600/30 transition hover:brightness-110"
                >
                  {user ? 'Ir a mi panel' : 'Solicitar servicio'}
                </Link>
                <Link
                  to="/login"
                  className="rounded-full border border-slate-700 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200"
                >
                  Ingresar
                </Link>
              </div>

              <p className="mt-10 text-sm text-slate-300">
                Iniciá sesión para consultar tus solicitudes y el estado de tus trabajos.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
              <div className="rounded-[22px] bg-gradient-to-br from-cyan-500/20 via-slate-900 to-slate-950 p-5">
                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Tu hogar, en buenas manos</p>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">
                    Gestioná solicitudes y consultá su estado desde tu panel personal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Catálogo</p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Consultá los servicios disponibles</h2>
            <p className="mt-4 text-slate-300">
              El catálogo vigente se carga desde la plataforma cuando iniciás sesión.
            </p>
          </div>
        </section>

        <section className="mt-20 rounded-[32px] border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Proceso</p>
              <h2 className="mt-3 text-3xl font-black text-white">Así funciona UrbanFix</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-slate-200">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
