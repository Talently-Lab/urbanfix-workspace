import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'
import { requireArrayResponse } from '../services/response'
import { DashboardState } from '../Components/DashboardState.js'
import { DashboardWelcome } from '../Components/DashboardWelcome.js'
import { useAuth } from '../context/AuthContext'

function Client() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [services, setServices] = useState([])
  const [detail, setDetail] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  const fetchDashboard = useCallback(async () => {
    const [requestsResponse, servicesResponse] = await Promise.all([
      api.get('/solicitudes/mias'),
      api.get('/servicios'),
    ])

    return {
      requests: requireArrayResponse(requestsResponse.data, 'solicitudes'),
      services: requireArrayResponse(servicesResponse.data, 'servicios'),
    }
  }, [])

  useEffect(() => {
    let active = true

    fetchDashboard()
      .then(({ requests: loadedRequests, services: loadedServices }) => {
        if (!active) return
        setRequests(loadedRequests)
        setServices(loadedServices)
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.error || 'No se pudo conectar con el servidor.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [fetchDashboard])

  const createRequest = async (event) => {
    event.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      const response = await api.post('/solicitudes', {
        idServicio: Number(serviceId),
        detalle: detail.trim(),
      })
      if (!Number.isInteger(response.data?.solicitud?.idSolicitud)) {
        throw new Error('La respuesta del servidor fue inesperada. Revisá el historial antes de volver a enviar.')
      }
      setDetail('')
      setRequests((current) => [response.data.solicitud, ...current])

      try {
        const { requests: loadedRequests, services: loadedServices } = await fetchDashboard()
        setRequests(loadedRequests)
        setServices(loadedServices)
      } catch (refreshError) {
        setError(refreshError.response?.data?.error || 'La solicitud se creó, pero no se pudo actualizar el panel.')
      }
    } catch (requestError) {
      setFormError(requestError.response?.data?.error || requestError.message || 'No se pudo crear la solicitud.')
    } finally {
      setSubmitting(false)
    }
  }

  const activeCount = requests.filter((request) =>
    ['PENDIENTE', 'ACEPTADA', 'EN_PROGRESO'].includes(request.estado)
  ).length

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Cliente</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white">Mis solicitudes</h1>
          <DashboardWelcome user={user} />
        </div>

        <section className="mb-8 rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-bold text-white">Solicitar un servicio</h2>
          {loading ? (
            <DashboardState loading />
          ) : error ? (
            <DashboardState error={error} />
          ) : services.length === 0 ? (
            <DashboardState empty="Todavía no hay servicios disponibles para solicitar." />
          ) : (
            <form onSubmit={createRequest} className="mt-5 grid gap-4 md:grid-cols-[1fr_2fr_auto] md:items-end">
              <label className="block text-sm text-slate-200">
                Servicio
                <select className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" value={serviceId || services[0].idServicio} onChange={(event) => setServiceId(event.target.value)} required>
                  {services.map((service) => (
                    <option key={service.idServicio} value={service.idServicio}>{service.nombreServicio}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-200">
                Detalle
                <input className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-500" value={detail} onChange={(event) => setDetail(event.target.value)} required maxLength={2000} placeholder="Describí qué necesitás resolver" />
              </label>
              <button type="submit" disabled={submitting} className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                {submitting ? 'Enviando...' : 'Crear solicitud'}
              </button>
              {formError && <p role="alert" className="text-sm text-rose-200 md:col-span-3">{formError}</p>}
            </form>
          )}
        </section>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Solicitudes registradas</p>
            <p className="mt-3 text-3xl font-black text-white">{loading ? '—' : requests.length}</p>
          </div>
          <div className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Solicitudes activas</p>
            <p className="mt-3 text-3xl font-black text-white">{loading ? '—' : activeCount}</p>
          </div>
        </div>

        <section className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="mb-5 text-xl font-bold text-white">Historial</h2>
          {loading || error || requests.length === 0 ? (
            <DashboardState loading={loading} error={error} empty="Todavía no creaste solicitudes." />
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <article key={request.idSolicitud} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{request.servicio?.nombreServicio || 'Servicio'}</h3>
                      <p className="mt-1 text-sm text-slate-300">{request.detalle}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {request.tecnico
                          ? `Técnico: ${request.tecnico.nombre} ${request.tecnico.apellido}`
                          : 'Aún sin técnico asignado'}
                      </p>
                    </div>
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">{request.estado}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Client
