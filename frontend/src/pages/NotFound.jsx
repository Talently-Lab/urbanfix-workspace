import { Link, useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#F1F6FA] flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-4xl min-h-[650px] bg-white rounded-3xl shadow-xl shadow-[#08284F]/10 p-6 sm:p-12 flex flex-col justify-between">

        {/* Logo */}
        <Link to="/" className="w-fit text-3xl font-extrabold tracking-tight text-[#08284F]">
          Urban<span className="text-[#F26B4D]">Fix.</span>
        </Link>

        {/* Contenido principal */}
        <section className="flex flex-col items-center text-center max-w-xl mx-auto py-12">

          {/* Ilustración 404 */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">

            <span className="text-8xl sm:text-9xl font-black tracking-tighter text-[#08284F]">
              4
            </span>

            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-[#F26B4D] flex items-center justify-center shadow-lg shadow-[#F26B4D]/30">
              <span className="text-7xl sm:text-8xl font-black text-white">
                0
              </span>
            </div>

            <span className="text-8xl sm:text-9xl font-black tracking-tighter text-[#08284F]">
              4
            </span>

          </div>

          {/* Etiqueta */}
          <span className="bg-[#FFF0EC] text-[#F26B4D] px-5 py-2 rounded-full text-xs font-extrabold tracking-widest mb-5">
            ERROR 404
          </span>

          {/* Título */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#08284F] mb-4">
            ¡Ups! Parece que te perdiste.
          </h1>

          {/* Descripción */}
          <p className="text-[#64748B] text-sm sm:text-base leading-relaxed max-w-md">
            La página que estás buscando no existe,
            fue movida o ya no se encuentra disponible.
            Pero no te preocupes, podemos ayudarte
            a encontrar el camino.
          </p>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-9 w-full sm:w-auto">

            <Link
              to="/"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#F26B4D] text-white font-bold text-sm text-center hover:bg-[#df573b] hover:-translate-y-1 transition-all duration-200 shadow-md shadow-[#F26B4D]/20"
            >
              Volver al inicio
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-[#D9E2EC] text-[#08284F] font-bold text-sm hover:bg-[#F1F6FA] transition-all duration-200"
            >
              Volver atrás
            </button>

          </div>

        </section>

        {/* Footer */}
        <footer className="border-t border-[#E8EDF2] pt-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#94A3B8]">
          <span className="font-extrabold text-[#08284F] text-sm">
            UrbanFix
          </span>

          <span>
            Soluciones para tu hogar.
          </span>
        </footer>

      </div>

    </main>
  );
}

export default NotFound;
