import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../Services/api.js";
import Header from "../Components/Header";
import SolicitudCard from "./Cliente/SolicitudCard";

function Technician() {
  const { token } = useAuth();

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(null);

  // Obtener solicitudes
  const getSolicitudes = useCallback(async () => {
    try {
      setError("");

      const respuesta = await api.get("/solicitudes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = respuesta.data;

      const listaSolicitudes = Array.isArray(data)
        ? data
        : Array.isArray(data?.solicitudes)
          ? data.solicitudes
          : [];

      setSolicitudes(listaSolicitudes);
    } catch (err) {
      console.error("Error al obtener solicitudes:", err);

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
      setLoading(false);
      setError("No hay una sesión activa. Iniciá sesión nuevamente.");
      return;
    }

    getSolicitudes();
  }, [token, getSolicitudes]);

  // Aceptar solicitud
  const handleAceptar = async (id) => {
    if (!window.confirm("¿Querés aceptar esta solicitud?")) {
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

      window.alert("¡Solicitud aceptada correctamente!");

      await getSolicitudes();
    } catch (err) {
      console.error("Error al aceptar solicitud:", err);

      window.alert(
        err.response?.data?.error ||
          "No se pudo aceptar la solicitud."
      );

      await getSolicitudes();
    } finally {
      setProcesando(null);
    }
  };

  // Rechazar solicitud
  const handleRechazar = async (id) => {
    if (!window.confirm("¿Querés rechazar esta solicitud?")) {
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

      window.alert("Solicitud rechazada.");

      await getSolicitudes();
    } catch (err) {
      console.error("Error al rechazar solicitud:", err);

      window.alert(
        err.response?.data?.error ||
          "No se pudo rechazar la solicitud."
      );

      await getSolicitudes();
    } finally {
      setProcesando(null);
    }
  };

  // Mostrar únicamente solicitudes pendientes
  const solicitudesPendientes = solicitudes.filter(
    (solicitud) => solicitud.estado === "PENDIENTE"
  );

  return (
    <div className="min-h-screen bg-urban-fondo">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Encabezado */}
        <section className="mb-8">
          <h1 className="text-3xl font-extrabold text-urban-principal">
            Panel del Técnico
          </h1>

          <p className="mt-2 text-urban-texto-secundario">
            Revisá las solicitudes disponibles y elegí los trabajos
            que quieras aceptar.
          </p>
        </section>

        {/* Resumen */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-urban-texto-secundario">
            Solicitudes pendientes
          </p>

          <p className="mt-2 text-4xl font-extrabold text-urban-principal">
            {solicitudesPendientes.length}
          </p>

          <p className="mt-2 text-sm text-urban-texto-secundario">
            Trabajos que todavía esperan un técnico.
          </p>
        </section>

        {/* Cargando */}
        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="font-medium text-urban-principal">
              Cargando solicitudes...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
          >
            <p className="font-semibold">{error}</p>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                getSolicitudes();
              }}
              className="mt-4 rounded-lg bg-urban-button px-4 py-2 font-semibold text-white hover:brightness-90"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Sin solicitudes */}
        {!loading &&
          !error &&
          solicitudesPendientes.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <span className="text-4xl">🧰</span>

              <h2 className="mt-4 text-xl font-bold text-urban-principal">
                No hay solicitudes pendientes
              </h2>

              <p className="mt-2 text-urban-texto-secundario">
                Cuando haya nuevos trabajos disponibles,
                aparecerán en esta sección.
              </p>
            </div>
          )}

        {/* Tarjetas */}
        {!loading &&
          !error &&
          solicitudesPendientes.length > 0 && (
            <section>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-urban-principal">
                  Nuevas oportunidades
                </h2>

                <span className="rounded-full bg-urban-button/10 px-3 py-1 text-sm font-semibold text-urban-button">
                  {solicitudesPendientes.length} pendiente(s)
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {solicitudesPendientes.map((solicitud) => {
                  const id = solicitud.idSolicitud ?? solicitud.id;
                  return (
                  <SolicitudCard
                    key={solicitud.idSolicitud ?? solicitud.id}
                    solicitud={solicitud}
                    rol="technician"
                    onAceptar={handleAceptar}
                    onRechazar={handleRechazar}
                    procesando={
                      procesando === (solicitud.idSolicitud ?? solicitud.id)
                    }
                  />
                  );
                })}
              </div>
            </section>
          )}
      </main>
    </div>
  );
}

export default Technician;

