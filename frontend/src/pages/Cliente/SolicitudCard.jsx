import React from "react";

function SolicitudCard({ solicitud }) {
  const estados = {
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    ACEPTADA: "bg-blue-100 text-blue-800",
    EN_PROGRESO: "bg-purple-100 text-purple-800",
    COMPLETADA: "bg-green-100 text-green-800",
    RECHAZADA: "bg-red-100 text-red-800",
    CANCELADA: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="flex w-80 flex-col gap-3 rounded-xl border p-4 shadow-sm">
      <h2 className="text-lg font-bold">
        {solicitud.servicio?.nombreServicio || "Servicio"}
      </h2>

      <span>
        🔧 Categoría: {solicitud.servicio?.nombreServicio || "No especificada"}
      </span>

      <span
        className={`self-start rounded-full px-3 py-1 text-xs font-medium ${
          estados[solicitud.estado] || "bg-gray-100 text-gray-600"
        }`}
      >
        {solicitud.estado}
      </span>

      <p>🔍 Descripción: {solicitud.detalle}</p>

      <p>
        👤 Cliente:{" "}
        {solicitud.cliente?.nombre || "No especificado"}
      </p>
    </div>
  );
}

export default SolicitudCard;
