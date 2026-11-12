import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import api from "../services/api.js";
import { useAuth } from "./AuthContext";
const TecnicoContext = createContext(null);

//Se utiliza useTecnico() para acceder a las listas de los trabajos

export function TecnicoProvider({ children }) {
  const { user, token } = useAuth();

  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [misTrabajos, setMisTrabajos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Evita que una respuesta vieja sobrescriba los datos
  // después de cerrar sesión o cambiar de usuario.
  const generacion = useRef(0);

  const limpiarSolicitudes = useCallback(() => {
    generacion.current += 1;
    setSolicitudesPendientes([]);
    setMisTrabajos([]);
    setError("");
    setCargando(false);
  }, []);

  const cargarSolicitudes = useCallback(async () => {
    if (!token) {
      limpiarSolicitudes();
      return;
    }

    const miGeneracion = generacion.current;

    setCargando(true);
    setError("");

    try {
      const [respuestaPendientes, respuestaAsignadas] =
        await Promise.all([
          api.get("/solicitudes"),
          api.get("/solicitudes/asignadas"),
        ]);

      // Si cambió la sesión durante las peticiones,
      // ignoramos los resultados anteriores.
      if (miGeneracion !== generacion.current) return;

      const normalizarLista = (respuesta) => {
        const data = respuesta.data;

        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.solicitudes)) {
          return data.solicitudes;
        }

        return [];
      };

      const pendientes = normalizarLista(respuestaPendientes);
      const asignadas = normalizarLista(respuestaAsignadas);

      setSolicitudesPendientes(
        pendientes.filter((solicitud) =>
          solicitud.estado === "PENDIENTE"
        )
      );

      setMisTrabajos(asignadas);
    } catch (err) {
      if (miGeneracion !== generacion.current) return;

      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          "No se pudieron cargar las solicitudes del técnico."
      );
    } finally {
      if (miGeneracion === generacion.current) {
        setCargando(false);
      }
    }
  }, [token, limpiarSolicitudes]);

  // Limpiar al cerrar sesión y volver a cargar al iniciar
  // sesión con un técnico.
  useEffect(() => {
    limpiarSolicitudes();

    const rol = String(user?.rol ?? user?.role ?? "")
      .trim()
      .toUpperCase();

    const esTecnico =
      rol === "TECNICO" || rol === "TECHNICIAN";

    if (token && esTecnico) {
      cargarSolicitudes();
    }

    return () => {
      // Invalida las respuestas pendientes al cambiar la sesión.
      generacion.current += 1;
    };
  }, [token, user, limpiarSolicitudes, cargarSolicitudes]);

  const ejecutarAccion = useCallback(
    async (id, accion) => {
      const accionesPermitidas = [
        "aceptar",
        "rechazar",
        "iniciar",
        "completar",
        "cancelar",
      ];

      if (!accionesPermitidas.includes(accion)) {
        throw new Error("Acción no válida.");
      }

      setError("");

      try {
        const respuesta = await api.patch(
          `/solicitudes/${id}/${accion}`
        );

        // La API confirma la acción. Actualizamos las dos listas
        // con lo que el servidor devuelve actualmente.
        await cargarSolicitudes();

        return respuesta.data;
      } catch (err) {
        const mensaje =
          err.response?.data?.mensaje ||
          err.response?.data?.error ||
          `No se pudo ${accion} la solicitud.`;

        setError(mensaje);
        throw err;
      }
    },
    [cargarSolicitudes]
  );

  const value = {
    solicitudesPendientes,
    misTrabajos,
    cargando,
    error,
    cargarSolicitudes,
    ejecutarAccion,
    limpiarSolicitudes,
  };

  return (
    <TecnicoContext.Provider value={value}>
      {children}
    </TecnicoContext.Provider>
  );
}

export function useTecnico() {
  const context = useContext(TecnicoContext);

  if (!context) {
    throw new Error(
      "useTecnico debe utilizarse dentro de TecnicoProvider."
    );
  }

  return context;
}
