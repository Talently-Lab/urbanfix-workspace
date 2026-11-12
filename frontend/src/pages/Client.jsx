import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import SolicitudCard from "./Cliente/SolicitudCard";
import api from "../services/api.js"

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

        const respuesta = await api.get(
          "/servicios",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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

        const respuesta = await api.get(
          "/solicitudes/mias",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
      servicio.nombreServicio
        ?.toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [servicios, busqueda]);

  // Filtrar solicitudes por estado
  const solicitudesFiltradas = useMemo(() => {
    if (filtroEstado === "TODAS") return solicitudes;

    return solicitudes.filter(
      (solicitud) =>
        solicitud.estado?.toUpperCase() === filtroEstado
    );
  }, [solicitudes, filtroEstado]);

  // Contar solicitudes por estado
  const contarEstado = (estado) => {
    if (estado === "TODAS") return solicitudes.length;

    return solicitudes.filter(
      (solicitud) =>
        solicitud.estado?.toUpperCase() === estado
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
      state: {
        servicio: servicioSeleccionado,
      },
    });
  };

  // Limpiar buscador
  const limpiarBusqueda = () => {
    setBusqueda("");
    setServicioSeleccionado(null);
  };

  return (
    <div className="min-h-screen bg-[#F1F6FA] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-10">

        {/*------- BUSCADOR DE SERVICIOS ------- */}
        <section id="buscar-servicio" 
          className="scroll-mt-6 rounded-3xl border border-slate-200/80 bg-urban-principal p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-urban-button">
              Encontrá lo que necesitás
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-[#08284F]">
              ¿Qué servicio estás buscando?
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Seleccioná una categoría para comenzar tu solicitud.
            </p>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
              🔎
            </span>

            <input
              type="text"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setServicioSeleccionado(null);
              }}
              placeholder="Buscar plomería, electricidad, carpintería..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-12 text-sm text-[#08284F] outline-none transition placeholder:text-slate-400 focus:border-[#F26B4D] focus:bg-white focus:ring-4 focus:ring-[#F26B4D]/10"
            />

            {busqueda && (
              <button
                type="button"
                onClick={limpiarBusqueda}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-slate-400 hover:text-slate-700"
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>

          {/* RESULTADOS */}
          {busqueda && !servicioSeleccionado && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
              {cargandoServicios ? (
                <p className="p-5 text-sm text-slate-500">
                  Cargando servicios...
                </p>
              ) : serviciosFiltrados.length > 0 ? (
                serviciosFiltrados.map((servicio) => (
                  <button
                    key={servicio.idServicio}
                    type="button"
                    onClick={() => seleccionarServicio(servicio)}
                    className="flex w-full items-center justify-between border-b border-slate-100 px-5 py-4 text-left transition last:border-0 hover:bg-orange-50"
                  >
                    <span className="font-semibold text-[#08284F]">
                      {servicio.nombreServicio}
                    </span>

                    <span className="text-sm font-bold text-[#F26B4D]">
                      Seleccionar →
                    </span>
                  </button>
                ))
              ) : (
                <p className="p-5 text-sm text-slate-500">
                  No encontramos servicios con ese nombre.
                </p>
              )}
            </div>
          )}

          {errorServicios && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {errorServicios}
            </p>
          )}

          {/* SERVICIO SELECCIONADO */}
          {servicioSeleccionado && (
            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-700">
                  Servicio seleccionado
                </p>

                <p className="mt-1 text-lg font-extrabold text-[#08284F]">
                  {servicioSeleccionado.nombreServicio}
                </p>
              </div>

              <button
                type="button"
                onClick={solicitarServicio}
                className="rounded-xl bg-[#F26B4D] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#e85d40]"
              >
                Solicitar servicio →
              </button>
            </div>
          )}
        </section>

        {/*------- MIS SOLICITUDES -------*/}
        <section>
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#F26B4D]">
                Seguimiento de trabajos
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-[#08284F] sm:text-3xl">
                Mis solicitudes
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Revisá tus solicitudes y consultá su estado actual.
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span className="text-xl">📋</span>
              <span className="text-sm font-bold text-[#08284F]">
                {solicitudes.length} solicitudes
              </span>
            </div>
          </div>

          {/*------- BOTONES FILTROS -------*/}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-[#08284F]">
                Filtrar por estado
              </p>

              <span className="text-xs text-slate-400">
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
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                      activo
                        ? "bg-[#08284F] text-white shadow-md"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {filtro.texto}

                    <span
                      className={`rounded-lg px-2 py-0.5 text-xs ${
                        activo
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-500"
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
              className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
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

            /*------- SIN RESULTADOS -------*/
              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm flex flex-col items-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1F6FA] text-3xl">
                  📋
                </div>

                <h3 className="mt-5 text-lg font-extrabold text-[#08284F] text-center">
                  {solicitudes.length === 0
                    ? "Todavía no tenés solicitudes"
                    : "No hay solicitudes con este estado"}
                </h3>

                <p className="mt-2 w-full max-w-md text-center text-sm leading-6 text-slate-500">
                  {solicitudes.length === 0
                    ? "Cuando solicites un servicio, vas a poder consultar su seguimiento desde acá."
                    : "Probá seleccionando otro filtro para encontrar tus solicitudes."}
                </p>

                {solicitudes.length > 0 && filtroEstado !== "TODAS" && (
                  <button
                    type="button"
                    onClick={() => setFiltroEstado("TODAS")}
                    className="mt-5 rounded-xl bg-[#08284F] px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
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
                    className="mt-5 rounded-xl bg-[#F26B4D] px-5 py-3 text-sm font-bold text-white transition hover:brightness-95"
                  >
                    Buscar un servicio
                  </button>
                )}

              </div>

          ) : (
            /*------- TARJETAS -------*/
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
