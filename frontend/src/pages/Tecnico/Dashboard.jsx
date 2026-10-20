import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Header from "../../Components/Header";

function Dashboard() {
  const { token } = useAuth();

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(null);

  const fetchSolicitudes = useCallback(async () => {
    try {
      setError("");

      const respuesta = await api.get("/solicitudes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = respuesta.data;

      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data?.solicitudes)
          ? data.solicitudes
          : [];

      setSolicitudes(lista);
    } catch (err) {
      console.error("Error al cargar solicitudes:", err);

      setError(
        err.response?.data?.error ||
          "No se pudieron cargar las solicitudes."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setError("No hay una sesión activa.");
      setLoading(false);
      return;
    }

    fetchSolicitudes();
  }, [token, fetchSolicitudes]);

  const handleAceptar = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro que querés aceptar este trabajo?"
      )
    ) {
      return;
    }

    try {
      setProcesando(id);

      await api.patch(
        `/solicitudes/${id}/aceptar`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.alert(
        "¡Trabajo aceptado con éxito! Ya podés consultar los datos del cliente."
      );

      await fetchSolicitudes();
    } catch (err) {
      console.error("Error al aceptar solicitud:", err);

      window.alert(
        err.response?.data?.error ||
          "No se pudo aceptar la solicitud. Quizás otro técnico ya la tomó."
      );

      await fetchSolicitudes();
    } finally {
      setProcesando(null);
    }
  };

  const handleRechazar = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro que querés rechazar esta solicitud?"
      )
    ) {
      return;
    }

    try {
      setProcesando(id);

      await api.patch(
        `/solicitudes/${id}/rechazar`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchSolicitudes();
    } catch (err) {
      console.error("Error al rechazar solicitud:", err);

      window.alert(
        err.response?.data?.error ||
          "No se pudo rechazar la solicitud."
      );

      await fetchSolicitudes();
    } finally {
      setProcesando(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Encabezado */}
      <Header></Header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Resumen */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Solicitudes disponibles
          </p>

          <p className="mt-2 text-4xl font-bold text-slate-900">
            {solicitudes.length}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Trabajos pendientes que coinciden con tus servicios.
          </p>
        </section>

        {/* Cargando */}
        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="font-medium text-slate-700">
              Cargando solicitudes...
            </p>
          </div>
        )}

        {/* Error de carga */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
          >
            <p className="font-semibold">
              No pudimos cargar las solicitudes
            </p>

            <p className="mt-1 text-sm">{error}</p>

            <button
              onClick={() => {
                setLoading(true);
                fetchSolicitudes();
              }}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Intentar nuevamente
            </button>
          </div>
        )}

        {/* Lista vacía */}
        {!loading && !error && solicitudes.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <div className="text-4xl">🧰</div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              No hay trabajos disponibles
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Cuando haya nuevas solicitudes de tus servicios,
              aparecerán acá.
            </p>
          </div>
        )}

        {/* Tarjetas */}
        {!loading && !error && solicitudes.length > 0 && (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                Nuevas oportunidades
              </h2>

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                {solicitudes.length} pendiente(s)
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {solicitudes.map((solicitud) => (
                <article
                  key={solicitud.idSolicitud}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                        {solicitud.servicio?.nombreServicio ||
                          "Servicio"}
                      </p>

                      <h3 className="mt-2 text-lg font-bold text-slate-900">
                        Solicitud #{solicitud.idSolicitud}
                      </h3>
                    </div>

                    <span className="shrink-0 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                      {solicitud.estado}
                    </span>
                  </div>

                  <div className="my-5 flex-1 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Descripción
                      </p>

                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                        {solicitud.detalle || "Sin descripción"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Cliente
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {solicitud.cliente?.nombre || "No especificado"}
                        {solicitud.cliente?.apellido
                          ? ` ${solicitud.cliente.apellido}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  {/* Acciones solo para solicitudes pendientes */}
                  {solicitud.estado === "PENDIENTE" ? (
                    <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
                      <button
                        onClick={() =>
                          handleAceptar(solicitud.idSolicitud)
                        }
                        disabled={procesando !== null}
                        className="flex-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {procesando === solicitud.idSolicitud
                          ? "Procesando..."
                          : "Aceptar"}
                      </button>

                      <button
                        onClick={() =>
                          handleRechazar(solicitud.idSolicitud)
                        }
                        disabled={procesando !== null}
                        className="flex-1 rounded-lg border border-red-200 bg-white px-3 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    </div>
                  ) : (
                    <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
                      Esta solicitud ya no está pendiente.
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
