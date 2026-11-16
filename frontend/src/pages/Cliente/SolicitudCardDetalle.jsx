import api from "../../Services/api";
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

        const respuesta = await api.get("/solicitudes/mias");

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

  const coloresEstado = {
    PENDIENTE: "bg-amber-100 text-amber-800",
    ACEPTADA: "bg-blue-100 text-blue-800",
    EN_PROGRESO: "bg-indigo-100 text-indigo-800",
    COMPLETADA: "bg-emerald-100 text-emerald-800",
    RECHAZADA: "bg-red-100 text-red-800",
    CANCELADA: "bg-slate-200 text-slate-700",
  };

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-urban-fondo">
        <p className="font-semibold text-urban-principal">
          Cargando solicitud...
        </p>
      </main>
    );
  }

  if (error || !solicitud) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-urban-fondo px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-sm">
          <span className="text-3xl">⚠️</span>
          <h2 className="mt-3 text-lg font-bold text-urban-principal">
            No se pudo mostrar la solicitud
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {error || "La solicitud no está disponible."}
          </p>
          <button
            onClick={() => navigate("/client/dashboard")}
            className="mt-5 rounded-lg bg-urban-button px-5 py-2.5 text-sm font-bold text-white hover:brightness-95"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  const tecnico = solicitud.tecnico;

  return (
    <main className="min-h-screen bg-urban-fondo px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* NAVEGACIÓN */}
        <button
          type="button"
          onClick={() => navigate("/client/dashboard")}
          className="mb-5 flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-urban-principal shadow-sm transition hover:text-urban-button"
        >
          <span>←</span>
          Volver a mis solicitudes
        </button>

        {/* ENCABEZADO */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-urban-button">
              Seguimiento de servicio
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-urban-principal">
              Solicitud #{solicitud.idSolicitud ?? solicitud.id}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Consultá los detalles de tu solicitud.
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-xs font-bold ${
              coloresEstado[estado] ?? "bg-slate-100 text-slate-700"
            }`}
          >
            {estados[estado] ?? estado}
          </span>
        </header>

        {/* CONTENIDO EN DOS COLUMNAS */}
        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">

          {/* COLUMNA IZQUIERDA */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-xl">
                📋
              </div>
              <div>
                <h2 className="font-bold text-urban-principal">
                  Datos de la solicitud
                </h2>
                <p className="text-xs text-slate-500">
                  Información del servicio solicitado
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Servicio
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {solicitud.servicio?.nombreServicio ?? "No especificado"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Descripción del problema
                </p>
                <div className="mt-2 rounded-lg bg-slate-50 p-3">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {solicitud.detalle || "Sin detalle disponible."}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Dirección del servicio
                </p>
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-slate-50 p-3">
                  <span>📍</span>
                  <p className="text-sm text-slate-700">
                    {solicitud.direccion || "Sin dirección especificada"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* COLUMNA DERECHA */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xl">
                👨‍🔧
              </div>
              <div>
                <h2 className="font-bold text-urban-principal">
                  Técnico asignado
                </h2>
                <p className="text-xs text-slate-500">
                  Profesional encargado del trabajo
                </p>
              </div>
            </div>

            {tecnico ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Nombre completo
                  </p>
                  <p className="mt-1 text-sm font-semibold text-urban-principal">
                    {tecnico.nombre} {tecnico.apellido}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Número de teléfono
                  </p>

                  {tecnico.numeroTelefono ? (
                    <a
                      href={`tel:${tecnico.numeroTelefono}`}
                      className="mt-1 inline-block text-sm font-semibold text-blue-700 hover:underline"
                    >
                      {tecnico.numeroTelefono}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-slate-500">
                      No disponible
                    </p>
                  )}
                </div>

                {tecnico.numeroTelefono && (
                  <a
                    href={`https://wa.me/${String(tecnico.numeroTelefono).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    <span>💬</span>
                    Contactar por WhatsApp
                  </a>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏳</span>
                  <p className="text-sm font-bold text-amber-800">
                    Técnico pendiente
                  </p>
                </div>
                <p className="mt-2 text-sm leading-5 text-amber-700">
                  Todavía no hay un técnico asignado. Cuando un profesional
                  acepte el trabajo, vas a poder consultar sus datos desde acá.
                </p>
              </div>
            )}

            {/* ESTADO DEL SERVICIO */}
            <div className="mt-5 rounded-lg border border-slate-100 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Estado actual
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    estado === "COMPLETADA"
                      ? "bg-emerald-500"
                      : estado === "RECHAZADA" || estado === "CANCELADA"
                      ? "bg-red-500"
                      : "bg-urban-button"
                  }`}
                />
                <p className="text-sm font-bold text-urban-principal">
                  {estados[estado] ?? estado}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default SolicitudCardDetalle;
