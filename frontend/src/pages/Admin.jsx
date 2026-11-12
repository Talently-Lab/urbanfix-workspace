import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { requireArrayResponse } from '../services/response'
import { DashboardState } from '../Components/DashboardState.js'
import { DashboardWelcome } from '../Components/DashboardWelcome.js'
import CartelAviso from '../Components/CartelAviso'
import { useAuth } from '../context/AuthContext'

const estadosSolicitud = [
  'PENDIENTE',
  'ACEPTADA',
  'EN_PROGRESO',
  'COMPLETADA',
  'RECHAZADA',
  'CANCELADA',
]

function Admin() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [requests, setRequests] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestFilter, setRequestFilter] = useState('TODAS')
  const [processingId, setProcessingId] = useState(null)
  const [notice, setNotice] = useState(null)

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

  const solicitudesFiltradas = useMemo(
    () => requestFilter === 'TODAS'
      ? requests
      : requests.filter((request) => request.estado === requestFilter),
    [requests, requestFilter],
  )

  const cancelarSolicitud = async (request) => {
    const id = request.idSolicitud
    if (!window.confirm(`¿Confirmás cancelar la solicitud #${id}?`)) return

    setProcessingId(id)
    setNotice(null)

    try {
      const response = await api.patch(`/admin/solicitudes/${id}/cancelar`)
      const estado = response.data?.solicitud?.estado || 'CANCELADA'
      setRequests((current) => current.map((item) => (
        item.idSolicitud === id ? { ...item, estado } : item
      )))
      setNotice({
        tipo: 'exito',
        mensaje: response.data?.mensaje || 'Solicitud cancelada correctamente.',
      })
    } catch (requestError) {
      setNotice({
        tipo: 'error',
        mensaje: requestError.response?.data?.error
          || requestError.response?.data?.mensaje
          || 'No se pudo cancelar la solicitud. Intentá nuevamente.',
      })
    } finally {
      setProcessingId(null)
    }
  }

  const stats = [
    { label: 'Usuarios registrados', value: users.length },
    { label: 'Solicitudes registradas', value: requests.length },
    { label: 'Servicios disponibles', value: services.length },
  ]

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">Administrador</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white">Panel general</h1>
          <DashboardWelcome user={user} />
        </div>

        {notice && (
          <CartelAviso
            mensaje={notice.mensaje}
            tipo={notice.tipo}
            onCerrar={() => setNotice(null)}
          />
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-4 text-3xl font-black text-white">{loading || error ? '—' : item.value}</p>
            </div>
          ))}
        </div>

        {error && <div className="mb-6"><DashboardState error={error} /></div>}

        <section className="mb-6 rounded-[28px] border border-slate-800 bg-slate-900/70 p-4 sm:p-6">
          <h2 className="mb-5 text-xl font-bold text-white">Usuarios</h2>
          {loading || error || users.length === 0 ? (
            <DashboardState loading={loading} error={error} empty="Todavía no hay usuarios registrados." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-400">
                    <th scope="col" className="px-3 py-3">Nombre</th>
                    <th scope="col" className="px-3 py-3">Correo</th>
                    <th scope="col" className="px-3 py-3">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item.idUsuario} className="border-b border-slate-800 last:border-0">
                      <td className="px-3 py-4 font-medium text-white">{item.nombre} {item.apellido}</td>
                      <td className="px-3 py-4 text-slate-300">{item.email}</td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">{item.rol}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mb-6 rounded-[28px] border border-slate-800 bg-slate-900/70 p-4 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Solicitudes</h2>
              <p className="mt-1 text-sm text-slate-400">{solicitudesFiltradas.length} de {requests.length} solicitudes</p>
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-300 sm:flex-row sm:items-center">
              Estado
              <select
                value={requestFilter}
                onChange={(event) => setRequestFilter(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
              >
                <option value="TODAS">Todos los estados</option>
                {estadosSolicitud.map((estado) => (
                  <option key={estado} value={estado}>{estado.replaceAll('_', ' ')}</option>
                ))}
              </select>
            </label>
          </div>

          {loading || error || requests.length === 0 ? (
            <DashboardState loading={loading} error={error} empty="Todavía no hay solicitudes registradas." />
          ) : solicitudesFiltradas.length === 0 ? (
            <DashboardState empty="No hay solicitudes para el estado seleccionado." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-400">
                    <th scope="col" className="px-3 py-3">Solicitud</th>
                    <th scope="col" className="px-3 py-3">Servicio</th>
                    <th scope="col" className="px-3 py-3">Cliente</th>
                    <th scope="col" className="px-3 py-3">Técnico</th>
                    <th scope="col" className="px-3 py-3">Estado</th>
                    <th scope="col" className="px-3 py-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesFiltradas.map((request) => {
                    const canCancel = ['PENDIENTE', 'ACEPTADA'].includes(request.estado)
                    const processing = processingId === request.idSolicitud

                    return (
                      <tr key={request.idSolicitud} className="border-b border-slate-800 align-top last:border-0">
                        <td className="max-w-sm px-3 py-4">
                          <p className="font-semibold text-white">#{request.idSolicitud} · {request.titulo || 'Solicitud'}</p>
                          <p className="mt-1 whitespace-pre-wrap text-slate-400">{request.detalle}</p>
                        </td>
                        <td className="px-3 py-4 text-slate-300">{request.servicio?.nombreServicio || '—'}</td>
                        <td className="px-3 py-4 text-slate-300">
                          {request.cliente?.nombre || '—'} {request.cliente?.apellido || ''}
                        </td>
                        <td className="px-3 py-4 text-slate-300">
                          {request.tecnico
                            ? `${request.tecnico.nombre || ''} ${request.tecnico.apellido || ''}`.trim()
                            : 'Sin asignar'}
                        </td>
                        <td className="px-3 py-4 font-semibold text-amber-200">{request.estado}</td>
                        <td className="px-3 py-4">
                          {canCancel ? (
                            <button
                              type="button"
                              disabled={processing}
                              onClick={() => cancelarSolicitud(request)}
                              className="whitespace-nowrap rounded-lg border border-red-400/40 px-3 py-2 text-xs font-bold text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {processing ? 'Cancelando...' : 'Cancelar'}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500">Sin acciones disponibles</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-4 sm:p-6">
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
