import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function SolicitudCardDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [solicitud, setSolicitud] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerSolicitud = async () => {
      if (!token) return;

      try {
        setCargando(true);
        setError("");

        const respuesta = await axios.get(
          "http://localhost:3001/api/solicitudes/mias",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const solicitudes = Array.isArray(respuesta.data)
          ? respuesta.data
          : respuesta.data.solicitudes ?? [];

        const encontrada = solicitudes.find(
          (item) => String(item.idSolicitud ?? item.id) === String(id)
        );

        if (!encontrada) {
          setError("No encontramos esta solicitud.");
          return;
        }

        setSolicitud(encontrada);
      } catch (error) {
        console.error(
          "Error al obtener el detalle:",
          error.response?.data || error.message
        );

        setError("No se pudo cargar la información de la solicitud.");
      } finally {
        setCargando(false);
      }
    };

    obtenerSolicitud();
  }, [id, token]);

  const estado = solicitud?.estado?.toUpperCase() ?? "";

  const estados = {
    PENDIENTE: "Pendiente",
    ACEPTADA: "Aceptada",
    EN_PROGRESO: "En progreso",
    COMPLETADA: "Completada",
    RECHAZADA: "Rechazada",
    CANCELADA: "Cancelada",
  };

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-urban-fondo px-4">
        <p className="font-semibold text-urban-principal">
          Cargando solicitud...
        </p>
      </main>
    );
  }

  if (error || !solicitud) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-urban-fondo px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">⚠️</div>

          <h2 className="mt-4 text-xl font-bold text-urban-principal">
            No se pudo mostrar la solicitud
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error || "La solicitud no está disponible."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/client/dashboard")}
            className="mt-6 rounded-xl bg-urban-button px-5 py-3 text-sm font-bold text-white hover:brightness-95"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  const tecnico = solicitud.tecnico;

  return (
    <main className="min-h-screen bg-urban-fondo px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* VOLVER */}
        <button
          type="button"
          onClick={() => navigate("/client/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-urban-principal transition hover:text-urban-button"
        >
          ← Volver a mis solicitudes
        </button>

        {/* ENCABEZADO */}
        <header className="mb-7">
          <p className="text-sm font-bold uppercase tracking-widest text-urban-button">
            Seguimiento
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-urban-principal">
            Solicitud #{solicitud.idSolicitud ?? solicitud.id}
          </h1>

          <p className="mt-2 text-sm text-urban-texto-secundario">
            Información y seguimiento de tu servicio.
          </p>
        </header>

        {/* INFORMACIÓN DE LA SOLICITUD */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-urban-principal">
              Datos de la solicitud
            </h2>

            <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-800">
              {estados[estado] ?? estado}
            </span>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Servicio
              </p>

              <p className="mt-1 font-semibold text-slate-700">
                {solicitud.servicio?.nombreServicio ?? "No especificado"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Detalle
              </p>

              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {solicitud.detalle || "Sin detalle disponible."}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Dirección
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {solicitud.direccion || "Sin dirección especificada"}
              </p>
            </div>
          </div>
        </section>

        {/* INFORMACIÓN DEL TÉCNICO */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              👨‍🔧
            </div>

            <div>
              <h2 className="text-lg font-bold text-urban-principal">
                Técnico asignado
              </h2>

              <p className="text-sm text-urban-texto-secundario">
                Información del profesional encargado.
              </p>
            </div>
          </div>

          {tecnico ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Nombre completo
                </p>

                <p className="mt-1 font-semibold text-urban-principal">
                  {tecnico.nombre} {tecnico.apellido}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Número de teléfono
                </p>

                {tecnico.numeroTelefono ? (
                  <a
                    href={`tel:${tecnico.numeroTelefono}`}
                    className="mt-1 inline-block font-semibold text-blue-700 hover:underline"
                  >
                    {tecnico.numeroTelefono}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">
                    No disponible
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                Todavía no hay un técnico asignado a esta solicitud.
              </p>

              <p className="mt-1 text-sm text-amber-700">
                Cuando un profesional acepte el trabajo, vas a poder consultar
                sus datos desde acá.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default SolicitudCardDetalle;