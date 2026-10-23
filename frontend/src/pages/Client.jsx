import { useEffect, useState } from 'react'
import axios from 'Axios'
import Header from '../Components/Header'
import SolicitudCard from './Cliente/SolicitudCard'
import { useAuth } from "../context/AuthContext"

function Client() {
  const { token,user } = useAuth();
  const [servicios, setServicios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [solicitudes, setSolicitudes] = useState([])
  const [error, setError] = useState('');
  // Obtener servicios
useEffect(() => {
  const getServicios = async () => {
    try {
      const respuesta = await axios.get(
        'http://localhost:3001/api/servicios',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setServicios(respuesta.data);
    } catch (error) {
      console.error(
        'Error al obtener servicios:',
        error.response?.data || error.message
      );

      setError('No se pudieron cargar los servicios.');
    }
  };

  if (token) {
    getServicios();
  }
}, [token]);

// Obtener mis solicitudes
useEffect(() => {
  const getSolicitudes = async () => {
    try {
      const respuesta = await axios.get(
        'http://localhost:3001/api/solicitudes/mias',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSolicitudes(respuesta.data);
    } catch (error) {
      console.error(
        'Error al obtener mis solicitudes:',
        error.response?.data || error.message
      );
    }
  };

  if (token) {
    getSolicitudes();
  }
}, [token]);

// Filtrar servicios por nombre
const serviciosFiltrados = servicios.filter((servicio) =>
  servicio.nombreServicio
    ?.toLowerCase()
    .includes(busqueda.toLowerCase())
);

// Seleccionar un servicio
const handleSeleccionar = (servicio) => {
  setServicioSeleccionado(servicio);
  setBusqueda(servicio.nombreServicio);
};

// Datos de prueba
const prueba = {
  titulo: 'Perdida de gas',
  estado: 'EN_PROGRESO',
  categoria: 'gas',
  descripcion: 'Empezamos a notar olor a gas en la cocina',
  direccion: 'av. siempre viva 123',
};
  return (
    <div>
      <section className="rounded-2xl bg-urban-fondo p-5 sm:p-8">
        {/* ENCABEZADO */}
        <div className="mb-6">
          <h3 className="mt-2 text-2xl font-extrabold text-urban-principal sm:text-3xl">¿Qué necesitás solucionar?</h3>
          <p className="mt-2 text-sm leading-6 text-urban-texto-secundario sm:text-base"> Encontrá el servicio que necesitás y solicitá una visita profesional. </p>
        </div>

        {/* TARJETA DEL BUSCADOR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <label htmlFor="busqueda-servicio" className="mb-2 block text-sm font-bold text-urban-principal" > Buscar un servicio</label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-xl">🔎</span>
        <input
          id="busqueda-servicio"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-urban-principal outline-none transition placeholder:text-slate-400 focus:border-urban-button focus:bg-white focus:ring-4 focus:ring-urban-button/10"
          type="text"
          placeholder="Ej.: plomería, electricidad, gas..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setServicioSeleccionado(null)
          }}
          autoComplete="off"
        />
      </div>

    {/* RESULTADOS */}
    {busqueda.trim() && !servicioSeleccionado && (
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {serviciosFiltrados.length > 0 ? (
          <>
            <p className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Servicios encontrados
            </p>

            <ul className="max-h-60 overflow-y-auto">
              {serviciosFiltrados.map((servicio) => (
                <li key={servicio.idServicio}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-urban-fondo"
                    onClick={() => handleSeleccionar(servicio)}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-urban-fondo text-lg">
                        🛠️
                      </span>

                      <span className="font-medium text-urban-principal">
                        {servicio.nombreServicio}
                      </span>
                    </span>

                    <span className="text-lg text-urban-button">
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="px-4 py-5 text-center">
            <span className="text-2xl">🔍</span>
            <p className="mt-2 font-semibold text-urban-principal">
              No encontramos ese servicio
            </p>
            <p className="mt-1 text-sm text-urban-texto-secundario">
              Probá con otro nombre o palabra clave.
            </p>
          </div>
        )}
      </div>
    )}

    {/* SERVICIO SELECCIONADO */}
    {servicioSeleccionado && (
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl">
            ✓
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Servicio seleccionado
            </p>
            <p className="mt-1 font-bold text-urban-principal">
              {servicioSeleccionado.nombreServicio}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setServicioSeleccionado(null)
            setBusqueda('')
          }}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
        >
          Cambiar
        </button>
      </div>
    )}

    {/* ERROR */}
    {error && (
      <p
        role="alert"
        className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
      >
        {error}
      </p>
    )}

    {/* BOTÓN */}
    <button
      type="button"
      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-urban-button px-5 py-4 font-bold text-white shadow-md shadow-urban-button/20 transition hover:-translate-y-0.5 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      disabled={!servicioSeleccionado}
      onClick={() => {
        console.log(
          'Servicio seleccionado:',
          servicioSeleccionado
        )
      }}
    >
      Solicitar visita
      <span aria-hidden="true">→</span>
    </button>

    <p className="mt-3 text-center text-xs text-urban-texto-secundario">
      Seleccioná un servicio para continuar con tu solicitud.
    </p>
  </div>
</section>

      <section>
        {solicitudes.length === 0 ? (
          <h3>No tenés solicitudes todavía</h3>
        ) : (
          <>
            <h2>Cantidad de solicitudes: {solicitudes.length}</h2>
          <div className='grid grid-cols-3 gap-4'>
            {solicitudes.map((a) => (
              <SolicitudCard className=''  key={a.id} solicitud={a} />
            ))}
          </div>
          </>
        )}
      </section>

      <section>
        <h3>Técnico asignado</h3>
        <h4>Calificaciones</h4>
      </section>
    </div>
  );
}

export default Client;