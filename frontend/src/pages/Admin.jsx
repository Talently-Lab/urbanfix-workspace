import { useEffect, useState } from 'react'
import api from '../services/api'
import { requireArrayResponse } from '../services/response'
import { DashboardState } from '../Components/DashboardState.js'
import { DashboardWelcome } from '../Components/DashboardWelcome.js'
import { useAuth } from '../context/AuthContext'

function Admin() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [requests, setRequests] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      api.get('/admin/usuarios'),
      api.get('/admin/solicitudes'),
      api.get('/servicios'),
    ])
      .then(([usersResponse, requestsResponse, servicesResponse]) => {
        if (!active) return
        setUsers(requireArrayResponse(usersResponse.data, 'usuarios'))
        setRequests(requireArrayResponse(requestsResponse.data, 'solicitudes'))
        setServices(requireArrayResponse(servicesResponse.data, 'servicios'))
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.error || 'No se pudieron cargar los datos del panel.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const stats = [
    { label: 'Usuarios registrados', value: users.length },
    { label: 'Solicitudes registradas', value: requests.length },
    { label: 'Servicios disponibles', value: services.length },
  ]

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">Administrador</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white">Panel general</h1>
          <DashboardWelcome user={user} />
        </div>

        {error && <div className="mb-6"><DashboardState error={error} /></div>}

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-4 text-3xl font-black text-white">{loading || error ? '—' : item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="mb-5 text-xl font-bold text-white">Usuarios</h2>
            {loading || error || users.length === 0 ? (
              <DashboardState loading={loading} error={error} empty="Todavía no hay usuarios registrados." />
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <article key={user.idUsuario} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{user.nombre}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">{user.rol}</span>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="mb-5 text-xl font-bold text-white">Solicitudes</h2>
            {loading || error || requests.length === 0 ? (
              <DashboardState loading={loading} error={error} empty="Todavía no hay solicitudes registradas." />
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <article key={request.idSolicitud} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{request.servicio?.nombreServicio || 'Servicio'}</p>
                        <p className="mt-1 text-sm text-slate-400">{request.detalle}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          Cliente: {request.cliente?.nombre || '—'} · Técnico: {request.tecnico?.nombre || 'Sin asignar'}
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">{request.estado}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="mb-5 text-xl font-bold text-white">Servicios disponibles</h2>
          {loading || error || services.length === 0 ? (
            <DashboardState loading={loading} error={error} empty="Todavía no hay servicios registrados." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article key={service.idServicio} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <h3 className="font-semibold text-white">{service.nombreServicio}</h3>
                  <p className="mt-2 text-sm text-slate-400">{service.descripcion}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Admin
