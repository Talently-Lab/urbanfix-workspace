
import { useState } from "react";
import { useTecnico } from "../../context/TecnicoContext";
import CartelAviso from "../../Components/CartelAviso";

function SolicitudesAceptadas() {
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
      clases: "bg-blue-50 text-blue-700 ring-blue-200",
      punto: "bg-blue-500",
    },
    EN_PROGRESO: {
      nombre: "En progreso",
      clases: "bg-orange-50 text-orange-700 ring-orange-200",
      punto: "bg-urban-button",
    },
    COMPLETADA: {
      nombre: "Completada",
      clases: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      punto: "bg-emerald-500",
    },
    CANCELADA: {
      nombre: "Cancelada",
      clases: "bg-slate-100 text-slate-600 ring-slate-200",
      punto: "bg-slate-400",
    },
  };

  const cantidadPorEstado = (estado) =>
    misTrabajos.filter(
      (trabajo) =>
        String(trabajo.estado || "").toUpperCase() === estado
    ).length;

  const trabajosFiltrados = misTrabajos.filter((trabajo) => {
    if (filtro === "TODOS") return true;

    return (
      String(trabajo.estado || "").toUpperCase() === filtro
    );
  });

  const filtros = [
    {
      valor: "TODOS",
      nombre: "Todos",
      cantidad: misTrabajos.length,
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
    <section className="space-y-6">
      {/* Encabezado */}
      <header>
        <p className="text-sm font-bold uppercase tracking-wider text-urban-secundario">
          Organización del trabajo
        </p>

        <h2 className="mt-2 text-2xl font-extrabold text-urban-principal">
          Mis trabajos
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-urban-texto-secundario">
          Consultá tus trabajos asignados y actualizá su estado a
          medida que avanzás.
        </p>
      </header>

      {/* Resumen */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-urban-texto-secundario">
            Total de trabajos
          </p>
          <p className="mt-2 text-3xl font-extrabold text-urban-principal">
            {misTrabajos.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-urban-texto-secundario">
            En progreso
          </p>
          <p className="mt-2 text-3xl font-extrabold text-urban-button">
            {cantidadPorEstado("EN_PROGRESO")}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-urban-texto-secundario">
            Completados
          </p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600">
            {cantidadPorEstado("COMPLETADA")}
          </p>
        </div>
      </div>

      {/* Avisos */}
      {aviso.mensaje && (
        <CartelAviso
          mensaje={aviso.mensaje}
          tipo={aviso.tipo}
          onCerrar={() =>
            setAviso({ mensaje: "", tipo: "info" })
          }
        />
      )}

      {error && (
        <CartelAviso
          mensaje={error}
          tipo="error"
          onCerrar={() => {}}
        />
      )}

      {/* Filtros */}
      <div>
        <h3 className="text-sm font-bold text-urban-principal">
          Filtrar por estado
        </h3>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {filtros.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => setFiltro(opcion.valor)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                filtro === opcion.valor
                  ? "border-urban-principal bg-urban-principal text-white"
                  : "border-slate-200 bg-white text-urban-texto-secundario hover:bg-urban-fondo"
              }`}
            >
              {opcion.nombre}

              <span
                className={`rounded-md px-2 py-0.5 text-xs ${
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

      {/* Lista de trabajos */}
      {cargando ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="mt-4 h-6 w-2/3 rounded bg-slate-200" />
              <div className="mt-4 h-4 rounded bg-slate-100" />
              <div className="mt-2 h-4 w-4/5 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : misTrabajos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-urban-fondo/50 px-5 py-12 text-center">
          <span className="text-3xl" aria-hidden="true">
            🧰
          </span>

          <h3 className="mt-4 text-lg font-bold text-urban-principal">
            Todavía no tenés trabajos asignados
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-urban-texto-secundario">
            Las solicitudes que aceptes aparecerán acá para que
            puedas administrarlas.
          </p>
        </div>
      ) : trabajosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-urban-fondo/50 p-8 text-center">
          <p className="font-semibold text-urban-principal">
            No hay trabajos en esta categoría.
          </p>
          <p className="mt-2 text-sm text-urban-texto-secundario">
            Seleccioná otro filtro para consultar tus trabajos.
          </p>
        </div>
      ) : (
        <div className="grid items-stretch gap-4 md:grid-cols-2">
          {trabajosFiltrados.map((solicitud) => {
            const id = solicitud.idSolicitud ?? solicitud.id;
            const estado = String(
              solicitud.estado || ""
            ).toUpperCase();

            const estadoInfo = estados[estado] || {
              nombre: estado || "Sin estado",
              clases: "bg-slate-100 text-slate-600 ring-slate-200",
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
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-md"
              >
                <div
                  className={`h-1 ${
                    estado === "ACEPTADA"
                      ? "bg-blue-500"
                      : estado === "EN_PROGRESO"
                      ? "bg-urban-button"
                      : estado === "COMPLETADA"
                      ? "bg-emerald-500"
                      : "bg-slate-300"
                  }`}
                />

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-urban-texto-secundario">
                        Trabajo #{id}
                      </p>

                      <h3 className="mt-2 break-words text-xl font-extrabold text-urban-principal">
                        {servicio}
                      </h3>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${estadoInfo.clases}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${estadoInfo.punto}`}
                      />
                      {estadoInfo.nombre}
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-urban-texto-secundario">
                      Detalle del trabajo
                    </p>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                      {detalle}
                    </p>
                  </div>

                  {(cliente || direccion) && (
                    <div className="mt-5 space-y-3 rounded-xl bg-urban-fondo p-4">
                      {cliente && (
                        <div className="flex items-start gap-3">
                          <span aria-hidden="true">👤</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-urban-texto-secundario">
                              Cliente
                            </p>
                            <p className="mt-1 break-words text-sm font-semibold text-urban-principal">
                              {cliente}
                            </p>
                          </div>
                        </div>
                      )}

                      {direccion && (
                        <div className="flex items-start gap-3">
                          <span aria-hidden="true">📍</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-urban-texto-secundario">
                              Dirección
                            </p>
                            <p className="mt-1 break-words text-sm text-slate-700">
                              {direccion}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <footer className="mt-auto border-t border-slate-100 pt-5">
                    {estado === "ACEPTADA" && (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          disabled={procesando}
                          onClick={() =>
                            manejarAccion(solicitud, "iniciar")
                          }
                          className="rounded-xl bg-urban-button px-4 py-3 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {procesando ? "Procesando..." : "Iniciar trabajo"}
                        </button>

                        <button
                          type="button"
                          disabled={procesando}
                          onClick={() =>
                            manejarAccion(solicitud, "cancelar")
                          }
                          className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {procesando ? "Procesando..." : "Cancelar"}
                        </button>
                      </div>
                    )}

                    {estado === "EN_PROGRESO" && (
                      <button
                        type="button"
                        disabled={procesando}
                        onClick={() =>
                          manejarAccion(solicitud, "completar")
                        }
                        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {procesando
                          ? "Procesando..."
                          : "Completar trabajo"}
                      </button>
                    )}

                    {estado === "COMPLETADA" && (
                      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700">
                        ✓ Trabajo completado
                      </p>
                    )}

                    {estado === "CANCELADA" && (
                      <p className="rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-500">
                        Este trabajo fue cancelado.
                      </p>
                    )}
                  </footer>
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
