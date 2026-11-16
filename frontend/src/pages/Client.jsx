import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SolicitudCard from "./Cliente/SolicitudCard";
import api from "../Services/api.js";

function Client() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [servicios, setServicios] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("TODAS");

  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);

  const [errorServicios, setErrorServicios] = useState("");
  const [errorSolicitudes, setErrorSolicitudes] = useState("");

  // Obtener servicios
  useEffect(() => {
    const obtenerServicios = async () => {
      if (!token) {
        setCargandoServicios(false);
        return;
      }

      try {
        setCargandoServicios(true);
        setErrorServicios("");

        const respuesta = await api.get("/servicios", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setServicios(
          Array.isArray(respuesta.data)
            ? respuesta.data
            : respuesta.data.servicios ?? []
        );
      } catch (error) {
        console.error("Error al cargar servicios:", error);
        setErrorServicios("No se pudieron cargar los servicios.");
      } finally {
        setCargandoServicios(false);
      }
    };

    obtenerServicios();
  }, [token]);

  // Obtener solicitudes
  useEffect(() => {
    const obtenerSolicitudes = async () => {
      if (!token) {
        setCargandoSolicitudes(false);
        return;
      }

      try {
        setCargandoSolicitudes(true);
        setErrorSolicitudes("");

        const respuesta = await api.get("/solicitudes/mias", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSolicitudes(
          Array.isArray(respuesta.data)
            ? respuesta.data
            : respuesta.data.solicitudes ?? []
        );
      } catch (error) {
        console.error("Error al cargar solicitudes:", error);
        setErrorSolicitudes("No se pudieron cargar tus solicitudes.");
      } finally {
        setCargandoSolicitudes(false);
      }
    };

    obtenerSolicitudes();
  }, [token]);

  // Opciones de filtros
  const filtros = [
    { valor: "TODAS", texto: "Todas" },
    { valor: "PENDIENTE", texto: "Pendientes" },
    { valor: "ACEPTADA", texto: "Aceptadas" },
    { valor: "EN_PROGRESO", texto: "En progreso" },
    { valor: "COMPLETADA", texto: "Completadas" },
    { valor: "RECHAZADA", texto: "Rechazadas" },
    { valor: "CANCELADA", texto: "Canceladas" },
  ];

  // Filtrar servicios por nombre
  const serviciosFiltrados = useMemo(() => {
    return servicios.filter((servicio) =>
      servicio.nombreServicio?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [servicios, busqueda]);

  // Filtrar solicitudes por estado
  const solicitudesFiltradas = useMemo(() => {
    if (filtroEstado === "TODAS") return solicitudes;

    return solicitudes.filter(
      (solicitud) => solicitud.estado?.toUpperCase() === filtroEstado
    );
  }, [solicitudes, filtroEstado]);

  // Contar solicitudes por estado
  const contarEstado = (estado) => {
    if (estado === "TODAS") return solicitudes.length;

    return solicitudes.filter(
      (solicitud) => solicitud.estado?.toUpperCase() === estado
    ).length;
  };

  // Seleccionar servicio
  const seleccionarServicio = (servicio) => {
    setServicioSeleccionado(servicio);
    setBusqueda(servicio.nombreServicio);
  };

  // Ir al formulario
  const solicitarServicio = () => {
    if (!servicioSeleccionado) return;

    navigate("/client/solicitud", {
      state: { servicio: servicioSeleccionado },
    });
  };

  // Limpiar buscador
  const limpiarBusqueda = () => {
    setBusqueda("");
    setServicioSeleccionado(null);
  };

  // Resumen superior
  const resumen = [
    { titulo: "Total", valor: contarEstado("TODAS"), icono: "📋" },
    { titulo: "Pendientes", valor: contarEstado("PENDIENTE"), icono: "⏳" },
    { titulo: "En progreso", valor: contarEstado("EN_PROGRESO"), icono: "🛠️" },
    { titulo: "Completadas", valor: contarEstado("COMPLETADA"), icono: "✅" },
  ];

  return (
    <div className="min-h-screen bg-[#F1F6FA] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* ------- BANNER + BUSCADOR ------- */}
        <section
          id="buscar-servicio"
          className="relative scroll-mt-6 rounded-3xl bg-[#08284F] text-white shadow-lg"
        >
          {/* Decoración (recortada para no cortar los resultados) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-white/5" />
            <div className="absolute -bottom-32 right-20 h-64 w-64 rounded-full bg-[#F26B4D]/20 blur-2xl" />
          </div>

          <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10">
            {/* Logo sobre azul: isotipo blanco con "Fix" en coral */}
            <div className="mb-8 flex items-center gap-3">
              <img
                src="/logo-urban-coral.png"
                alt=""
                aria-hidden="true"
                className="h-10 w-auto sm:h-12"
              />
              <span
                aria-label="UrbanFix"
                className="text-2xl font-extrabold tracking-tight sm:text-3xl"
              >
                <span className="text-white">Urban</span>
                <span className="text-[#F26B4D]">Fix</span>
              </span>
            </div>

            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                <span className="h-2 w-2 rounded-full bg-[#F26B4D]" />
                Encontrá lo que necesitás
              </span>

              <h1 className="mt-4 text-3xl font-extrabold !text-white tracking-tight sm:text-4xl">
                ¿Qué servicio estás buscando?
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-base">
                Seleccioná una categoría para comenzar tu solicitud.
              </p>

              {/* BUSCADOR */}
              <div className="relative mt-6">
                <span
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-xl"
                >
                  🔎
                </span>

                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setServicioSeleccionado(null);
                  }}
                  aria-label="Buscar servicio"
                  placeholder="Buscar plomería, electricidad, carpintería..."
                  className="w-full rounded-2xl border border-transparent bg-white py-4 pl-12 pr-12 text-sm text-[#08284F] shadow-lg outline-none transition placeholder:text-slate-500 focus:ring-4 focus:ring-[#F26B4D]/40"
                />

                {busqueda && (
                  <button
                    type="button"
                    onClick={limpiarBusqueda}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl leading-none text-slate-500 hover:text-[#08284F]"
                    aria-label="Limpiar búsqueda"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* RESULTADOS */}
              {busqueda && !servicioSeleccionado && (
                <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl bg-white shadow-xl">
                  {cargandoServicios ? (
                    <p className="p-5 text-sm text-slate-600">
                      Cargando servicios...
                    </p>
                  ) : serviciosFiltrados.length > 0 ? (
                    serviciosFiltrados.map((servicio) => (
                      <button
                        key={servicio.idServicio}
                        type="button"
                        onClick={() => seleccionarServicio(servicio)}
                        className="flex w-full items-center justify-between border-b border-slate-100 px-5 py-4 text-left transition last:border-0 hover:bg-[#F1F6FA] focus:bg-[#F1F6FA] focus:outline-none"
                      >
                        <span className="font-semibold text-[#08284F]">
                          {servicio.nombreServicio}
                        </span>

                        <span className="text-sm font-bold text-[#C93C18]">
                          Seleccionar →
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="p-5 text-sm text-slate-600">
                      No encontramos servicios con ese nombre.
                    </p>
                  )}
                </div>
              )}

              {errorServicios && (
                <p
                  role="alert"
                  className="mt-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-red-700"
                >
                  {errorServicios}
                </p>
              )}

              {/* SERVICIO SELECCIONADO */}
              {servicioSeleccionado && (
                <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-xl sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      aria-hidden="true"
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1F6FA] text-2xl"
                    >
                      🛠️
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
                        Servicio seleccionado
                      </p>
                      <p className="mt-0.5 text-lg font-extrabold text-[#08284F]">
                        {servicioSeleccionado.nombreServicio}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={solicitarServicio}
                    className="rounded-xl bg-[#C93C18] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F26B4D]/40"
                  >
                    Solicitar servicio →
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ------- RESUMEN ------- */}
        <section
          aria-label="Resumen de solicitudes"
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {resumen.map((item) => (
            <div
              key={item.titulo}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F1F6FA] text-2xl"
              >
                {item.icono}
              </div>

              <div>
                <p className="text-2xl font-extrabold leading-none text-[#08284F]">
                  {cargandoSolicitudes ? "–" : item.valor}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  {item.titulo}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* ------- MIS SOLICITUDES ------- */}
        <section aria-labelledby="titulo-solicitudes">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-8 w-1.5 rounded-full bg-[#F26B4D]" />
            <div>
              <h2
                id="titulo-solicitudes"
                className="text-2xl font-extrabold text-[#08284F] sm:text-3xl"
              >
                Mis solicitudes
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Revisá tus solicitudes y consultá su estado actual.
              </p>
            </div>
          </div>

          {/* FILTROS */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-[#08284F]">
                Filtrar por estado
              </p>

              <span className="text-xs font-semibold text-slate-600">
                {solicitudesFiltradas.length} resultado(s)
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {filtros.map((filtro) => {
                const activo = filtroEstado === filtro.valor;
                const cantidad = contarEstado(filtro.valor);

                return (
                  <button
                    key={filtro.valor}
                    type="button"
                    onClick={() => setFiltroEstado(filtro.valor)}
                    aria-pressed={activo}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#08284F]/20 ${
                      activo
                        ? "bg-[#08284F] text-white shadow-md"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-[#08284F]/40 hover:bg-[#F1F6FA]"
                    }`}
                  >
                    {filtro.texto}

                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        activo
                          ? "bg-white/20 text-white"
                          : "bg-[#F1F6FA] text-[#08284F]"
                      }`}
                    >
                      {cantidad}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ERROR */}
          {errorSolicitudes && (
            <div
              role="alert"
              className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
            >
              {errorSolicitudes}
            </div>
          )}

          {/* CARGA */}
          {cargandoSolicitudes ? (
            <div className="grid gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="h-5 w-1/3 rounded bg-slate-200" />
                  <div className="mt-5 h-4 w-2/3 rounded bg-slate-100" />
                  <div className="mt-3 h-16 rounded bg-slate-100" />
                  <div className="mt-5 h-10 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : solicitudesFiltradas.length === 0 ? (
            /* ------- SIN RESULTADOS ------- */
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-[#08284F]/20 bg-white px-6 py-14 text-center shadow-sm">
              <div
                aria-hidden="true"
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1F6FA] text-3xl"
              >
                📋
              </div>

              <h3 className="mt-5 text-lg font-extrabold text-[#08284F]">
                {solicitudes.length === 0
                  ? "Todavía no tenés solicitudes"
                  : "No hay solicitudes con este estado"}
              </h3>

              <p className="mt-2 w-full max-w-md text-sm leading-6 text-slate-600">
                {solicitudes.length === 0
                  ? "Cuando solicites un servicio, vas a poder consultar su seguimiento desde acá."
                  : "Probá seleccionando otro filtro para encontrar tus solicitudes."}
              </p>

              {solicitudes.length > 0 && filtroEstado !== "TODAS" && (
                <button
                  type="button"
                  onClick={() => setFiltroEstado("TODAS")}
                  className="mt-5 rounded-xl bg-[#08284F] px-5 py-3 text-sm font-bold text-white transition hover:brightness-125 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#08284F]/30"
                >
                  Mostrar todas las solicitudes
                </button>
              )}

              {solicitudes.length === 0 && (
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("buscar-servicio")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                  className="mt-5 rounded-xl bg-[#C93C18] px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F26B4D]/40"
                >
                  Buscar un servicio
                </button>
              )}
            </div>
          ) : (
            /* ------- TARJETAS ------- */
            <div className="grid gap-5 md:grid-cols-2">
              {solicitudesFiltradas.map((solicitud) => (
                <SolicitudCard
                  key={solicitud.idSolicitud ?? solicitud.id}
                  solicitud={solicitud}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Client;
