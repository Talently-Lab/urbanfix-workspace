import { useEffect, useState } from "react";
import api from "../Services/api.js";

function MostrarTecnicos({ tecnicoId }) {
  const [tecnico, setTecnico] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tecnicoId) {
      setCargando(false);
      return;
    }

    const obtenerTecnico = async () => {
      try {
        setCargando(true);
        setError("");

        const respuesta = await api.get(`/servicios/${tecnicoId}/tecnicos`);
        console.log(respuesta)
        // Ajustá esta parte si tu API devuelve otra estructura.
        const datos = respuesta.data;
        setTecnico(datos.tecnico ?? datos);
      } catch (err) {
        console.error("Error al obtener el técnico:", err);
        setError("No se pudo obtener la información del técnico.");
      } finally {
        setCargando(false);
      }
    };

    obtenerTecnico();
  }, [tecnicoId]);

  if (cargando) {
    return <p className="text-sm text-slate-500">Cargando técnico...</p>;
  }

  if (error || !tecnico) {
    return (
      <p className="text-sm text-slate-500">
        {error || "No se encontró información del técnico."}
      </p>
    );
  }

  return (
    <div className="space-y-1">
      <p className="font-semibold text-slate-800">
        {tecnico.nombre ?? tecnico.nombreCompleto ?? "Nombre no disponible"}
      </p>

      {tecnico.email && (
        <p className="text-sm text-slate-600">
          Email: {tecnico.email}
        </p>
      )}

      {tecnico.telefono && (
        <p className="text-sm text-slate-600">
          Teléfono: {tecnico.telefono}
        </p>
      )}
    </div>
  );
}

export default MostrarTecnicos;