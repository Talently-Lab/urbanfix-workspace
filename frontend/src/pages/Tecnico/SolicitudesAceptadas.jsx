
import { useState } from "react";
import { useTecnico } from "../../context/TecnicoContext";
import CartelAviso from "../../Components/CartelAviso";

function SolicitudesAceptadas({
  servicioSeleccionado = "TODOS",
  serviciosTecnico = [],
}) {
  const {
    misTrabajos = [],
    cargando,
    error,
    ejecutarAccion,
  } = useTecnico();

  const [aviso, setAviso] = useState({
    mensaje: "",
    tipo: "info",
  });

  const [procesandoId, setProcesandoId] = useState(null);
  const [filtro, setFiltro] = useState("TODOS");

  const manejarAccion = async (solicitud, accion) => {
    const id = solicitud.idSolicitud ?? solicitud.id;

    if (!id) {
      setAviso({
        mensaje: "No se encontró el identificador de la solicitud.",
        tipo: "error",
      });
      return;
    }

    setProcesandoId(id);
    setAviso({ mensaje: "", tipo: "info" });

    try {
      const respuesta = await ejecutarAccion(id, accion);

      const mensajes = {
        iniciar: "Trabajo iniciado correctamente.",
        completar: "Trabajo completado correctamente.",
        cancelar: "El trabajo se canceló correctamente.",
      };

      setAviso({
        mensaje: respuesta?.mensaje || mensajes[accion],
        tipo: "exito",
      });
    } catch (err) {
      setAviso({
        mensaje:
          err.response?.data?.mensaje ||
          err.response?.data?.error ||
          "No se pudo realizar la acción. Intentá nuevamente.",
        tipo: "error",
      });
    } finally {
      setProcesandoId(null);
    }
  };

  const estados = {
    ACEPTADA: {
      nombre: "Aceptada",
      clases: "bg-blue-50 text-blue-700",
      punto: "bg-blue-500",
    },
    EN_PROGRESO: {
      nombre: "En progreso",
      clases: "bg-orange-50 text-orange-700",
      punto: "bg-urban-button",
    },
    COMPLETADA: {
      nombre: "Completada",
      clases: "bg-emerald-50 text-emerald-700",
      punto: "bg-emerald-500",
    },
    CANCELADA: {
      nombre: "Cancelada",
      clases: "bg-slate-100 text-slate-600",
      punto: "bg-slate-400",
    },
  };

  // Primero filtramos los trabajos por servicio.
  const trabajosPorServicio = misTrabajos.filter((trabajo) => {
    if (servicioSeleccionado === "TODOS") {
      return true;
    }

    const idServicio =
      trabajo.idServicio ??
      trabajo.servicio?.idServicio ??
      trabajo.servicioId ??
      trabajo.servicio?.id;

    if (idServicio != null) {
      return String(idServicio) === String(servicioSeleccionado);
    }

    // Alternativa por nombre si el trabajo no trae el ID.
    const servicioElegido = serviciosTecnico.find(
      (servicio) =>
        String(servicio.idServicio) === String(servicioSeleccionado)
    );

    const nombreServicio =
      trabajo.servicio?.nombreServicio ??
      trabajo.nombreServicio ??
      trabajo.categoria;

    if (!nombreServicio || !servicioElegido?.nombreServicio) {
      return false;
    }

    return (
      nombreServicio.trim().toLowerCase() ===
      servicioElegido.nombreServicio.trim().toLowerCase()
    );
  });

  // Después aplicamos el filtro por estado.
  const trabajosFiltrados = trabajosPorServicio.filter((trabajo) => {
    if (filtro === "TODOS") {
      return true;
    }

    return String(trabajo.estado || "").toUpperCase() === filtro;
  });

  // Las cantidades también respetan el servicio seleccionado.
  const cantidadPorEstado = (estado) =>
    trabajosPorServicio.filter(
      (trabajo) =>
        String(trabajo.estado || "").toUpperCase() === estado
    ).length;

  const filtros = [
    {
      valor: "TODOS",
      nombre: "Todos",
      cantidad: trabajosPorServicio.length,
    },
    {
      valor: "ACEPTADA",
      nombre: "Aceptados",
      cantidad: cantidadPorEstado("ACEPTADA"),
    },
    {
      valor: "EN_PROGRESO",
      nombre: "En progreso",
      cantidad: cantidadPorEstado("EN_PROGRESO"),
    },
    {
      valor: "COMPLETADA",
      nombre: "Completados",
      cantidad: cantidadPorEstado("COMPLETADA"),
    },
    {
      valor: "CANCELADA",
      nombre: "Cancelados",
      cantidad: cantidadPorEstado("CANCELADA"),
    },
  ];

  return (
    <section className="space-y-4">

      {/* Encabezado compacto */}
      <header>
        <p className="text-[10px] font-bold uppercase tracking-wider text-urban-secundario">
          Organización del trabajo
        </p>

        <h2 className="mt-1 text-lg font-extrabold text-urban-principal">
          Mis trabajos
        </h2>

        <p className="mt-1 text-xs text-urban-texto-secundario">
          Consultá tus trabajos asignados y actualizá su estado.
        </p>
      </header>

      {/* Resumen horizontal */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
          <p className="text-[10px] text-urban-texto-secundario">
            Total
          </p>
          <p className="mt-1 text-xl font-extrabold text-urban-principal">
            {trabajosPorServicio.length}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
          <p className="text-[10px] text-urban-texto-secundario">
            En progreso
          </p>
          <p className="mt-1 text-xl font-extrabold text-urban-button">
            {cantidadPorEstado("EN_PROGRESO")}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
          <p className="text-[10px] text-urban-texto-secundario">
            Completados
          </p>
          <p className="mt-1 text-xl font-extrabold text-emerald-600">
            {cantidadPorEstado("COMPLETADA")}
          </p>
        </div>
      </div>

      {/* Avisos */}
      {aviso.mensaje && (
        <CartelAviso
          mensaje={aviso.mensaje}
          tipo={aviso.tipo}
          onCerrar={() => setAviso({ mensaje: "", tipo: "info" })}
        />
      )}

      {error && (
        <CartelAviso
          mensaje={error}
          tipo="error"
          onCerrar={() => {}}
        />
      )}

      {/* Filtros por estado */}
      <div>
        <h3 className="text-xs font-bold text-urban-principal">
          Filtrar por estado
        </h3>

        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {filtros.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => setFiltro(opcion.valor)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                filtro === opcion.valor
                  ? "border-urban-principal bg-urban-principal text-white"
                  : "border-slate-200 bg-white text-urban-texto-secundario hover:bg-urban-fondo"
              }`}
            >
              {opcion.nombre}

              <span
                className={`rounded px-1.5 py-0.5 text-[10px] ${
                  filtro === opcion.valor
                    ? "bg-white/15 text-white"
                    : "bg-urban-fondo text-urban-principal"
                }`}
              >
                {opcion.cantidad}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Listado */}
      {cargando ? (
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : misTrabajos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-urban-fondo/50 px-4 py-8 text-center">
          <span className="text-2xl" aria-hidden="true">
            🧰
          </span>

          <h3 className="mt-2 text-sm font-bold text-urban-principal">
            Todavía no tenés trabajos asignados
          </h3>

          <p className="mt-1 text-xs text-urban-texto-secundario">
            Las solicitudes que aceptes aparecerán acá.
          </p>
        </div>
      ) : trabajosPorServicio.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-urban-fondo/50 p-5 text-center">
          <p className="text-sm font-semibold text-urban-principal">
            No hay trabajos de este servicio.
          </p>

          <p className="mt-1 text-xs text-urban-texto-secundario">
            Seleccioná otro servicio para consultar tus trabajos.
          </p>
        </div>
      ) : trabajosFiltrados.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-urban-fondo/50 p-5 text-center">
          <p className="text-sm font-semibold text-urban-principal">
            No hay trabajos en esta categoría.
          </p>

          <p className="mt-1 text-xs text-urban-texto-secundario">
            Seleccioná otro filtro para consultar tus trabajos.
          </p>
        </div>
      ) : (
        <div className="space-y-2">

          {trabajosFiltrados.map((solicitud) => {
            const id = solicitud.idSolicitud ?? solicitud.id;
            const estado = String(solicitud.estado || "").toUpperCase();

            const estadoInfo = estados[estado] || {
              nombre: estado || "Sin estado",
              clases: "bg-slate-100 text-slate-600",
              punto: "bg-slate-400",
            };

            const procesando = procesandoId === id;

            const servicio =
              solicitud.servicio?.nombreServicio ||
              solicitud.categoria ||
              solicitud.titulo ||
              "Trabajo asignado";

            const detalle =
              solicitud.detalle ||
              solicitud.descripcion ||
              "No se agregaron detalles para este trabajo.";

            const direccion =
              solicitud.direccion ||
              solicitud.domicilio ||
              solicitud.direccionServicio;

            const cliente =
              solicitud.cliente?.nombre ||
              solicitud.cliente?.nombreCompleto ||
              solicitud.nombreCliente;

            return (
              <article
                key={id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm lg:flex-row lg:items-center"
              >
                {/* Identificación y detalle */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-urban-texto-secundario">
                      #{id}
                    </span>

                    <h3 className="text-sm font-bold text-urban-principal">
                      {servicio}
                    </h3>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold ${estadoInfo.clases}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${estadoInfo.punto}`}
                      />
                      {estadoInfo.nombre}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-slate-600">
                    {detalle}
                  </p>

                  {(cliente || direccion) && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-urban-texto-secundario">
                      {cliente && (
                        <span>👤 {cliente}</span>
                      )}

                      {direccion && (
                        <span className="break-words">
                          📍 {direccion}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex shrink-0 flex-wrap gap-2 border-t border-slate-100 pt-2 lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0">
                  {estado === "ACEPTADA" && (
                    <>
                      <button
                        type="button"
                        disabled={procesando}
                        onClick={() => manejarAccion(solicitud, "iniciar")}
                        className="rounded-md bg-urban-button px-3 py-2 text-xs font-bold text-white transition hover:brightness-95 disabled:opacity-50"
                      >
                        {procesando ? "Procesando..." : "Iniciar"}
                      </button>

                      <button
                        type="button"
                        disabled={procesando}
                        onClick={() => manejarAccion(solicitud, "cancelar")}
                        className="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </>
                  )}

                  {estado === "EN_PROGRESO" && (
                    <button
                      type="button"
                      disabled={procesando}
                      onClick={() => manejarAccion(solicitud, "completar")}
                      className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {procesando ? "Procesando..." : "Completar"}
                    </button>
                  )}

                  {estado === "COMPLETADA" && (
                    <span className="self-center text-xs font-semibold text-emerald-700">
                      ✓ Trabajo completado
                    </span>
                  )}

                  {estado === "CANCELADA" && (
                    <span className="self-center text-xs text-slate-500">
                      Trabajo cancelado
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default SolicitudesAceptadas;
