
import { useState } from "react";
import { useTecnico } from "../../context/TecnicoContext";
import CartelAviso from "../../Components/CartelAviso";

function SolicitudesDisponibles() {
  const {
    solicitudesPendientes = [],
    cargando,
    error,
    ejecutarAccion,
  } = useTecnico();

  const [aviso, setAviso] = useState({
    mensaje: "",
    tipo: "info",
  });

  const [procesandoId, setProcesandoId] = useState(null);

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
        aceptar: "Solicitud aceptada correctamente.",
        rechazar: "El rechazo se registró correctamente.",
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

  return (
    <section className="space-y-6">
      {/* Encabezado */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-urban-principal">
            Solicitudes disponibles
          </h2>

          <p className="mt-2 text-sm leading-6 text-urban-texto-secundario">
            Revisá los detalles antes de aceptar un nuevo trabajo.
          </p>
        </div>

        <span className="w-fit rounded-full bg-urban-fondo px-3 py-1.5 text-sm font-semibold text-urban-principal">
          {solicitudesPendientes.length} disponibles
        </span>
      </header>

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

      {cargando ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-200 p-5"
            >
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="mt-4 h-6 w-2/3 rounded bg-slate-200" />
              <div className="mt-4 h-4 rounded bg-slate-100" />
              <div className="mt-2 h-4 w-4/5 rounded bg-slate-100" />
              <div className="mt-6 h-10 rounded-xl bg-slate-200" />
            </div>
          ))}
        </div>
      ) : solicitudesPendientes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-urban-fondo/60 px-5 py-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
            📋
          </span>

          <h3 className="mt-4 text-lg font-bold text-urban-principal">
            No hay solicitudes disponibles
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-urban-texto-secundario">
            Cuando haya nuevos trabajos pendientes, aparecerán en
            esta sección.
          </p>
        </div>
      ) : (
        <div className="grid items-stretch gap-5 md:grid-cols-2">
          {solicitudesPendientes.map((solicitud) => {
            const id = solicitud.idSolicitud ?? solicitud.id;
            const procesando = procesandoId === id;

            const servicio =
              solicitud.servicio?.nombreServicio ||
              solicitud.categoria ||
              "Servicio solicitado";

            const detalle =
              solicitud.detalle ||
              solicitud.descripcion ||
              "No se agregaron detalles.";

            const cliente =
              solicitud.cliente?.nombre ||
              solicitud.cliente?.nombreCompleto ||
              solicitud.nombreCliente;

            const direccion =
              solicitud.direccion ||
              solicitud.domicilio ||
              solicitud.direccionServicio;

            return (
              <article
                key={id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="h-1 bg-urban-button" />

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-urban-texto-secundario">
                        Solicitud #{id}
                      </p>

                      <h3 className="mt-2 break-words text-xl font-extrabold text-urban-principal">
                        {solicitud.titulo || servicio}
                      </h3>
                    </div>

                    <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                      Pendiente
                    </span>
                  </div>

                  <div className="mt-5 rounded-xl bg-urban-fondo p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-urban-texto-secundario">
                      Servicio solicitado
                    </p>

                    <p className="mt-1 text-sm font-semibold text-urban-principal">
                      {servicio}
                    </p>
                  </div>

                  <div className="mt-5">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-urban-texto-secundario">
                      Descripción
                    </h4>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                      {detalle}
                    </p>
                  </div>

                  {(cliente || direccion) && (
                    <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                      {cliente && (
                        <div className="flex items-start gap-3">
                          <span aria-hidden="true">👤</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-urban-texto-secundario">
                              Cliente
                            </p>
                            <p className="mt-1 break-words text-sm font-medium text-urban-principal">
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

                  <footer className="mt-auto grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={procesando}
                      onClick={() =>
                        manejarAccion(solicitud, "aceptar")
                      }
                      className="rounded-xl bg-urban-button px-4 py-3 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {procesando ? "Procesando..." : "Aceptar solicitud"}
                    </button>

                    <button
                      type="button"
                      disabled={procesando}
                      onClick={() =>
                        manejarAccion(solicitud, "rechazar")
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-urban-texto-secundario transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {procesando ? "Procesando..." : "Rechazar"}
                    </button>
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

export default SolicitudesDisponibles;
