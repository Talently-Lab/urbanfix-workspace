const CardTotalAdmin = ({
  titulo,
  total,
  descripcion,
  icono,
  loading,
  onVerMas,
  color = "bg-blue-50",
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#08284F]">
            {titulo}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {descripcion}
          </p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${color}`}>
          {icono}
        </div>
      </div>

      <div className="my-7">
        {loading ? (
          <div className="h-12 w-20 animate-pulse rounded-lg bg-slate-200" />
        ) : (
          <span className="text-5xl font-bold tracking-tight text-[#08284F]">
            {total}
          </span>
        )}
      </div>

      <div className="flex justify-end border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onVerMas}
          className="flex items-center gap-2 text-sm font-semibold text-[#F26B4D] transition hover:text-[#d95438]"
        >
          Ver más
          <span className="text-lg">→</span>
        </button>
      </div>

    </div>
  );
};

export default CardTotalAdmin;