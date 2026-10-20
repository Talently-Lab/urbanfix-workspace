import Header from "../Components/Header";
import axios from "Axios";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import SolicitudCard from "./Cliente/SolicitudCard";

function Technician() {
  const { token } = useAuth();

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("No hay una sesión activa. Iniciá sesión nuevamente.");
      return;
    }

    const getSolicitudes = async () => {
      try {
        setLoading(true);
        setError("");

        const respuesta = await axios.get(
          "http://localhost:3001/api/solicitudes",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Respuesta de la API:", respuesta.data);

        // Acepta ambos formatos posibles de respuesta.
        const data = respuesta.data;

        const listaSolicitudes = Array.isArray(data)
          ? data
          : Array.isArray(data?.solicitudes)
            ? data.solicitudes
            : [];

        setSolicitudes(listaSolicitudes);
      } catch (error) {
        console.error(
          "Error al obtener solicitudes:",
          error.response?.status,
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.error ||
            "No se pudieron cargar las solicitudes."
        );

        setSolicitudes([]);
      } finally {
        setLoading(false);
      }
    };

    getSolicitudes();
  }, [token]);

  return (
    <div>
      <Header />

      <main className="p-6">
        <h1 className="text-2xl font-bold">
          Panel del Técnico
        </h1>

        <p className="mb-6">
          Solicitudes disponibles para aceptar.
        </p>

        {loading && (
          <p>Cargando solicitudes...</p>
        )}

        {!loading && error && (
          <p className="text-red-600">{error}</p>
        )}

        {!loading && !error && solicitudes.length === 0 && (
          <p>No hay solicitudes pendientes disponibles.</p>
        )}

        {!loading && !error && solicitudes.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {solicitudes.map((solicitud) => (
              <SolicitudCard
                key={solicitud.idSolicitud}
                solicitud={solicitud}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Technician;
