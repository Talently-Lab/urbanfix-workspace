import { useState } from "react";
import { useTecnico } from "../../context/TecnicoContext";
import CartelAviso from "../../Components/CartelAviso";

// Estilos visuales para cada servicio
const estilosServicios = {
  plomeria: {
    icono: "💧",
    fondo: "bg-blue-50",
    texto: "text-blue-700",
    borde: "border-blue-200",
  },
  electricidad: {
    icono: "⚡",
    fondo: "bg-amber-50",
    texto: "text-amber-700",
    borde: "border-amber-200",
  },
  carpinteria: {
    icono: "🔨",
    fondo: "bg-orange-50",
    texto: "text-orange-700",
    borde: "border-orange-200",
  },
  gasista: {
    icono: "🔥",
    fondo: "bg-red-50",
    texto: "text-red-700",
    borde: "border-red-200",
  },
};

// Obtener el estilo correspondiente al servicio
const obtenerEstiloServicio = (nombre) => {
  const clave = (nombre || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");

  return (
    estilosServicios[clave] || {
      icono: "🔧",
      fondo: "bg-slate-50",
      texto: "text-slate-700",
      borde: "border-slate-200",
    }
  );
};

function SolicitudesDisponibles({
  servicioSeleccionado = "TODOS",
  serviciosTecnico = [],
}) {
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

  // Aceptar o rechazar una solicitud
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

  // Filtrar solicitudes por el servicio seleccionado
  const solicitudesFiltradas = solicitudesPendientes.filter(
    (solicitud) => {
      if (servicioSeleccionado === "TODOS") {
        return true;
      }

      const idServicio =
        solicitud.idServicio ??
        solicitud.servicio?.idServicio ??
        solicitud.servicioId ??
        solicitud.servicio?.id;

      if (idServicio != null) {
        return (
          String(idServicio) === String(servicioSeleccionado)
        );
      }

      // Alternativa por nombre si no viene el ID
      const servicioElegido = serviciosTecnico.find(
        (servicio) =>
          String(servicio.idServicio) ===
          String(servicioSeleccionado)
      );

      const nombreServicio =
        solicitud.servicio?.nombreServicio ??
        solicitud.nombreServicio ??
        solicitud.categoria;

      if (
        !nombreServicio ||
        !servicioElegido?.nombreServicio
      ) {
        return false;
      }

      return (
        nombreServicio.trim().toLowerCase() ===
        servicioElegido.nombreServicio.trim().toLowerCase()
      );
    }
  );

  return (
    <section className="space-y-4">

      {/* Encabezado */}
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-extrabold text-urban-principal">
            Solicitudes disponibles
          </h2>

          <p className="mt-1 text-xs text-urban-texto-secundario">
            Revisá los detalles antes de aceptar un nuevo trabajo.
          </p>
        </div>

        <span className="rounded-lg bg-urban-fondo px-3 py-1.5 text-xs font-bold text-urban-principal">
          {solicitudesFiltradas.length} disponibles
        </span>
      </header>

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

      {/* Cargando */}
      {cargando ? (
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
              <div className="mt-3 h-8 w-32 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : solicitudesPendientes.length === 0 ? (

        /* Sin solicitudes */
        <div className="rounded-lg border border-dashed border-slate-300 bg-urban-fondo/50 px-4 py-8 text-center">
          <span className="text-2xl" aria-hidden="true">
            📋
          </span>

          <h3 className="mt-2 text-sm font-bold text-urban-principal">
            No hay solicitudes disponibles
          </h3>

          <p className="mx-auto mt-1 max-w-md text-xs text-urban-texto-secundario">
            Cuando haya nuevos trabajos pendientes, aparecerán en esta sección.
          </p>
        </div>
      ) : solicitudesFiltradas.length === 0 ? (

        /* No hay solicitudes para el servicio elegido */
        <div className="rounded-lg border border-slate-200 bg-urban-fondo/50 p-6 text-center">
          <p className="text-sm font-semibold text-urban-principal">
            No hay solicitudes de este servicio.
          </p>

          <p className="mt-1 text-xs text-urban-texto-secundario">
            Probá seleccionando otro servicio.
          </p>
        </div>
      ) : (

        /* Cards de solicitudes */
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {solicitudesFiltradas.map((solicitud) => {
            const id =
              solicitud.idSolicitud ?? solicitud.id;

            const procesando = procesandoId === id;

            const servicio =
              solicitud.servicio?.nombreServicio ||
              solicitud.nombreServicio ||
              solicitud.categoria ||
              "Servicio solicitado";

            const estiloServicio =
              obtenerEstiloServicio(servicio);

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
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                {/* Información */}
                <div className="min-w-0">

                  {/* Encabezado */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold tracking-wide text-urban-texto-secundario">
                      SOLICITUD #{id}
                    </span>

                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                      Pendiente
                    </span>
                  </div>

                  {/* Servicio destacado */}
                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${estiloServicio.fondo} ${estiloServicio.texto} ${estiloServicio.borde}`}
                    >
                      <span>{estiloServicio.icono}</span>
                      {servicio}
                    </span>
                  </div>

                  {/* Detalle del problema */}
                  <p className="mt-3 break-words text-sm font-medium leading-6 text-slate-700">
                    {detalle}
                  </p>

                  {/* Cliente y dirección */}
                  {(cliente || direccion) && (
                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-urban-texto-secundario">

                      {cliente && (
                        <div className="flex items-start gap-2">
                          <span>👤</span>
                          <span>{cliente}</span>
                        </div>
                      )}

                      {direccion && (
                        <div className="flex items-start gap-2">
                          <span>📍</span>
                          <span className="break-words">
                            {typeof direccion === "object"
                              ? [
                                  direccion.calle,
                                  direccion.altura,
                                  direccion.numero,
                                  direccion.localidad,
                                  direccion.ciudad,
                                ]
                                  .filter(Boolean)
                                  .join(" ")
                              : direccion}
                          </span>
                        </div>
                      )}

                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">

                  <button
                    type="button"
                    disabled={procesando}
                    onClick={() =>
                      manejarAccion(solicitud, "aceptar")
                    }
                    className="flex-1 rounded-lg bg-urban-button px-3 py-2.5 text-xs font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {procesando ? "Procesando..." : "Aceptar"}
                  </button>

                  <button
                    type="button"
                    disabled={procesando}
                    onClick={() =>
                      manejarAccion(solicitud, "rechazar")
                    }
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-urban-texto-secundario transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {procesando ? "Procesando..." : "Rechazar"}
                  </button>

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
