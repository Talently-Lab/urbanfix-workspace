import { useNavigate } from "react-router-dom";

function SolicitudCard({ solicitud }) {
  const navigate = useNavigate();

  const idSolicitud = solicitud.idSolicitud ?? solicitud.id;
  const estado = solicitud.estado?.toUpperCase() ?? "SIN ESTADO";

  const estados = {
    PENDIENTE: {
      texto: "Pendiente",
      estilo: "bg-amber-100 text-amber-800",
    },
    ACEPTADA: {
      texto: "Aceptada",
      estilo: "bg-blue-100 text-blue-800",
    },
    EN_PROGRESO: {
      texto: "En progreso",
      estilo: "bg-indigo-100 text-indigo-800",
    },
    COMPLETADA: {
      texto: "Completada",
      estilo: "bg-green-100 text-green-800",
    },
    RECHAZADA: {
      texto: "Rechazada",
      estilo: "bg-red-100 text-red-800",
    },
    CANCELADA: {
      texto: "Cancelada",
      estilo: "bg-slate-100 text-slate-700",
    },
  };

  const estadoActual = estados[estado] ?? {
    texto: estado,
    estilo: "bg-slate-100 text-slate-700",
  };

  const tieneTecnico = Boolean(solicitud.tecnico);

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Número de solicitud
          </p>

          <h3 className="mt-1 text-xl font-extrabold text-urban-principal">
            #{idSolicitud}
          </h3>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${estadoActual.estilo}`}
        >
          {estadoActual.texto}
        </span>
      </div>

      <div className="my-5 border-t border-slate-100" />

      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Título
        </p>

        <p className="mt-2 text-base font-bold text-urban-principal">
          {solicitud.titulo || "Solicitud de servicio"}
        </p>

        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Detalle
        </p>

        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {solicitud.detalle || "Sin detalle disponible."}
        </p>
      </div>

      {tieneTecnico ? (
        <button
          type="button"
          onClick={() =>
            navigate(`/Client/solicitud/${idSolicitud}`)
          }
          className="mt-5 w-full rounded-xl bg-urban-principal px-4 py-3 text-sm font-bold text-white transition hover:brightness-110"
        >
          Ver información del técnico →
        </button>
      ) : (
        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-center text-xs font-medium text-slate-500">
          Todavía no hay un técnico asignado
        </div>
      )}
    </article>
  );
}

export default SolicitudCard;