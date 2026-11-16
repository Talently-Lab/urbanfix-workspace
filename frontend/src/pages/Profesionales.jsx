import { useState } from "react";

const profesionalesEjemplo = [
  {
    nombre: "Juan Pérez",
    especialidad: "Plomería",
    experiencia: "8 años de experiencia",
    descripcion:
      "Especialista en instalaciones, reparaciones y mantenimiento de sistemas de agua.",
    foto: "/plomero.jpg",
  },
  {
    nombre: "Carlos Gómez",
    especialidad: "Electricidad",
    experiencia: "6 años de experiencia",
    descripcion:
      "Experiencia en instalaciones eléctricas, mantenimiento y solución de fallas.",
    foto: "/electricista.jpg",
  },
  {
    nombre: "Lucas Fernández",
    especialidad: "Carpintería",
    experiencia: "10 años de experiencia",
    descripcion:
      "Trabajos de carpintería, reparación de muebles y fabricación a medida.",
    foto: "/carpintero.jpg",
  },
];

const pasos = [
  {
    numero: "01",
    icono: "📝",
    titulo: "Contanos tu problema",
    texto: "Describí qué necesitás y dónde, en pocos minutos.",
  },
  {
    numero: "02",
    icono: "🤝",
    titulo: "Un técnico lo acepta",
    texto: "Un profesional disponible toma tu solicitud.",
  },
  {
    numero: "03",
    icono: "✅",
    titulo: "Problema resuelto",
    texto: "Seguí el estado del trabajo desde tu panel.",
  },
];

const obtenerIniciales = (nombre = "") =>
  nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");

// Foto con respaldo: si no carga, muestra las iniciales
const FotoProfesional = ({ foto, nombre }) => {
  const [error, setError] = useState(false);

  if (!foto || error) {
    return (
      <div
        role="img"
        aria-label={`Foto no disponible de ${nombre}`}
        className="flex h-full w-full items-center justify-center bg-[#08284F]"
      >
        <span className="text-6xl font-extrabold tracking-tight text-white/90">
          {obtenerIniciales(nombre) || "👤"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={foto}
      alt={`Foto de ${nombre}`}
      loading="lazy"
      onError={() => setError(true)}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
  );
};

const Profesionales = ({
  profesionales = profesionalesEjemplo,
  onSolicitar,
}) => {
  return (
    <section
      aria-labelledby="titulo-profesionales"
      className="bg-[#F1F6FA] px-4 py-12 sm:px-8 lg:px-16 lg:py-16"
    >
      <div className="mx-auto max-w-7xl space-y-14">
        {/* ENCABEZADO (fondo azul) */}
        <header className="relative overflow-hidden rounded-3xl bg-[#08284F] px-7 py-10 text-white shadow-lg sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-32 right-24 h-64 w-64 rounded-full bg-[#F26B4D]/20 blur-2xl" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              <span className="h-2 w-2 rounded-full bg-[#F26B4D]" />
              Nuestro equipo
            </span>

            <h2
              id="titulo-profesionales"
              className="mt-5 text-3xl font-extrabold tracking-tight !text-white sm:text-4xl lg:text-5xl"
            >
              Profesionales que van a tu casa y{" "}
              <span className="text-[#F26B4D]">resuelven</span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
              En UrbanFix conectamos tu problema con técnicos capacitados y con
              experiencia. Vos lo contás, ellos lo solucionan.
            </p>

            {onSolicitar && (
              <button
                type="button"
                onClick={onSolicitar}
                className="mt-7 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#08284F] shadow-md shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#F1F6FA] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              >
                Pedir un técnico →
              </button>
            )}
          </div>
        </header>

        {/* CÓMO FUNCIONA */}
        <div>
          <div className="mb-6 flex items-center gap-3">
            <span className="h-7 w-1.5 rounded-full bg-[#F26B4D]" />
            <h3 className="text-xl font-extrabold text-[#08284F] sm:text-2xl">
              Cómo funciona
            </h3>
          </div>

          <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {pasos.map((paso) => (
              <li
                key={paso.numero}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F1F6FA] text-2xl"
                >
                  {paso.icono}
                </div>

                <div>
                  <p className="text-xs font-extrabold tracking-wider text-[#C93C18]">
                    PASO {paso.numero}
                  </p>
                  <h4 className="mt-0.5 font-extrabold text-[#08284F]">
                    {paso.titulo}
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {paso.texto}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* PROFESIONALES */}
        <div>
          <div className="mb-6 flex items-center gap-3">
            <span className="h-7 w-1.5 rounded-full bg-[#F26B4D]" />
            <div>
              <h3 className="text-xl font-extrabold text-[#08284F] sm:text-2xl">
                Conocé a algunos de nuestros profesionales
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Personas capacitadas para ayudarte con los problemas de tu hogar.
              </p>
            </div>
          </div>

          {profesionales.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#08284F]/20 bg-white px-6 py-14 text-center">
              <div
                aria-hidden="true"
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1F6FA] text-3xl"
              >
                🛠️
              </div>
              <p className="mt-4 font-extrabold text-[#08284F]">
                Todavía no hay profesionales para mostrar
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Volvé a visitarnos pronto.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {profesionales.map((profesional, index) => (
                <article
                  key={profesional.id || index}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                >
                  {/* FOTO */}
                  <div className="relative h-64 overflow-hidden bg-[#F1F6FA]">
                    <FotoProfesional
                      foto={profesional.foto}
                      nombre={profesional.nombre}
                    />

                    <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-[#08284F] px-4 py-2 text-xs font-bold text-white shadow-md">
                      <span className="h-2 w-2 rounded-full bg-[#F26B4D]" />
                      {profesional.especialidad}
                    </span>
                  </div>

                  {/* INFORMACIÓN */}
                  <div className="flex flex-1 flex-col p-6">
                    <h4 className="text-xl font-extrabold text-[#08284F]">
                      {profesional.nombre}
                    </h4>

                    <p className="mt-1.5 text-sm font-bold text-[#C93C18]">
                      {profesional.experiencia}
                    </p>

                    <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                      {profesional.descripcion}
                    </p>

                    <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                      <span className="h-2 w-2 rounded-full bg-green-600" />
                      <span className="text-xs font-semibold text-slate-600">
                        Profesional verificado
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Profesionales;
