import { useEffect, useState } from 'react'
import api from '../services/api'
import { requireArrayResponse } from '../services/response'
import { DashboardState } from '../Components/DashboardState.js'
import { DashboardWelcome } from '../Components/DashboardWelcome.js'
import { useAuth } from '../context/AuthContext'

function Technician() {
  const { user } = useAuth()
  const [available, setAvailable] = useState([])
  const [assigned, setAssigned] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      api.get('/solicitudes'),
      api.get('/solicitudes/asignadas'),
      api.get('/tecnicos/me/servicios'),
    ])
      .then(([availableResponse, assignedResponse, servicesResponse]) => {
        if (!active) return
        setAvailable(requireArrayResponse(availableResponse.data, 'solicitudes'))
        setAssigned(requireArrayResponse(assignedResponse.data, 'solicitudes'))
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

  const renderRequests = (items, emptyMessage) => (
    loading || error || items.length === 0 ? (
      <DashboardState loading={loading} error={error} empty={emptyMessage} />
    ) : (
      <div className="space-y-4">
        {items.map((request) => (
          <article key={request.idSolicitud} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{request.servicio?.nombreServicio || 'Servicio'}</h3>
                <p className="mt-1 text-sm text-slate-300">{request.detalle}</p>
                {request.cliente && <p className="mt-2 text-xs text-slate-500">Cliente: {request.cliente.nombre}</p>}
              </div>
              <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">{request.estado}</span>
            </div>
          </article>
        ))}
      </div>
    )
  )

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-300">Técnico</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white">Mis trabajos</h1>
          <DashboardWelcome user={user} />
        </div>

        <section className="mb-8 rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-bold text-white">Servicios que ofrecés</h2>
          {loading || error || services.length === 0 ? (
            <DashboardState loading={loading} error={error} empty="No hay servicios asociados a tu perfil." />
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {services.map((service) => (
                <li key={service.idServicio} className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-sm text-violet-100">{service.nombreServicio}</li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="mb-5 text-xl font-bold text-white">Solicitudes disponibles</h2>
            {renderRequests(available, 'No hay solicitudes disponibles para tus servicios.')}
          </section>
          <section className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="mb-5 text-xl font-bold text-white">Trabajos asignados</h2>
            {renderRequests(assigned, 'Todavía no tenés trabajos asignados.')}
          </section>
        </div>
      </div>
    </main>
  )
}

export default Technician
