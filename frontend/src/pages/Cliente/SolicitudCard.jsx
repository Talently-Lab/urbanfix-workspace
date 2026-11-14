import { useNavigate } from "react-router-dom";

function SolicitudCard({ solicitud }) {
  const navigate = useNavigate();

  const idSolicitud = solicitud.idSolicitud ?? solicitud.id;
  const estado = solicitud.estado?.toUpperCase() ?? "SIN ESTADO";

  const estados = {
    PENDIENTE: {
      texto: "Pendiente",
      estilo: "bg-amber-50 text-amber-700",
    },
    ACEPTADA: {
      texto: "Aceptada",
      estilo: "bg-blue-50 text-blue-700",
    },
    EN_PROGRESO: {
      texto: "En progreso",
      estilo: "bg-indigo-50 text-indigo-700",
    },
    COMPLETADA: {
      texto: "Completada",
      estilo: "bg-green-50 text-green-700",
    },
    RECHAZADA: {
      texto: "Rechazada",
      estilo: "bg-red-50 text-red-700",
    },
    CANCELADA: {
      texto: "Cancelada",
      estilo: "bg-slate-100 text-slate-600",
    },
  };

  const estadoActual = estados[estado] ?? {
    texto: estado,
    estilo: "bg-slate-100 text-slate-600",
  };

  const tieneTecnico = Boolean(solicitud.tecnico);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md">

      {/* ENCABEZADO */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-sm">
            📋
          </span>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Solicitud
            </p>
            <h3 className="text-sm font-extrabold text-urban-principal">
              #{idSolicitud}
            </h3>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${estadoActual.estilo}`}
        >
          {estadoActual.texto}
        </span>
      </div>

      {/* DETALLE */}
      <div className="my-3 border-t border-slate-100" />

      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Descripción
        </p>

        <p className="line-clamp-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">
          {solicitud.detalle || "Sin detalle disponible."}
        </p>
      </div>

      {/* ACCIÓN */}
      {tieneTecnico ? (
        <button
          type="button"
          onClick={() => navigate(`/client/solicitud/${idSolicitud}`)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-urban-principal px-3 py-2 text-xs font-bold text-white transition hover:bg-urban-button"
        >
          Ver técnico
          <span>→</span>
        </button>
      ) : (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <p className="text-[10px] font-medium text-slate-500">
            Esperando asignación de técnico
          </p>
        </div>
      )}
    </article>
  );
}

export default SolicitudCard;
