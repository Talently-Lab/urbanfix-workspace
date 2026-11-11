
function CartelAviso({ mensaje, tipo = "exito", onCerrar }) {
  if (!mensaje) return null;

  const estilos = {
    exito: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
    advertencia: "border-amber-200 bg-amber-50 text-amber-800",
  };

  const iconos = {
    exito: "✓",
    error: "✕",
    info: "i",
    advertencia: "!",
  };

  return (
    <div
      role={tipo === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`mb-4 flex items-center justify-between gap-3 rounded-xl border p-4 shadow-sm ${
        estilos[tipo] || estilos.info
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-bold">
          {iconos[tipo] || iconos.info}
        </span>

        <p className="text-sm font-medium">{mensaje}</p>
      </div>

      {onCerrar && (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar aviso"
          className="rounded-lg px-2 py-1 text-lg font-bold hover:bg-black/5"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default CartelAviso;
