
const profesionalesEjemplo = [
  {
    nombre: "Juan Pérez",
    especialidad: "Plomería",
    experiencia: "8 años de experiencia",
    descripcion:
      "Especialista en instalaciones, reparaciones y mantenimiento de sistemas de agua.",
    foto: "../../public/plomero.jpg",
  },
  {
    nombre: "Carlos Gómez",
    especialidad: "Electricidad",
    experiencia: "6 años de experiencia",
    descripcion:
      "Experiencia en instalaciones eléctricas, mantenimiento y solución de fallas.",
    foto: "../../public/electricista.jpg",
  },
  {
    nombre: "Lucas Fernández",
    especialidad: "Carpintería",
    experiencia: "10 años de experiencia",
    descripcion:
      "Trabajos de carpintería, reparación de muebles y fabricación a medida.",
    foto: "../../public/carpintero.jpg",
  },
];

const Profesionales = ({ profesionales = profesionalesEjemplo }) => {
  return (
    <section className="bg-white px-6 py-16 sm:px-10 lg:px-20 text-center">
      <div className="mx-auto max-w-7xl">

        <div className="mb-12 text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-[#F26B4D]">
            Nuestro equipo
          </span>

          <h2 className="mt-3 text-3xl font-extrabold text-[#08284F] sm:text-4xl">
            Conocé a nuestros profesionales
          </h2>

          <p className="mt-4 max-w-2xl text-center">
            Personas capacitadas y con experiencia para ayudarte a solucionar
            los problemas de tu hogar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {profesionales.map((profesional, index) => (
            <article
              key={profesional.id || index}
              className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              {/* FOTO */}
              <div className="relative h-64 overflow-hidden bg-slate-100">
                {profesional.foto ? (
                  <img
                    src={profesional.foto}
                    alt={`Foto de ${profesional.nombre}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl text-slate-300">
                    👤
                  </div>
                )}

                <div className="absolute bottom-4 left-4 rounded-full bg-[#F26B4D] px-4 py-2 text-xs font-bold text-white shadow">
                  {profesional.especialidad}
                </div>
              </div>

              {/* INFORMACION */}
              <div className="p-6">
                <h3 className="text-xl font-extrabold text-[#08284F]">
                  {profesional.nombre}
                </h3>

                <p className="mt-2 text-sm font-semibold text-[#F26B4D]">
                  {profesional.experiencia}
                </p>

                <p className="mt-4 min-h-16 text-sm leading-relaxed text-slate-500">
                  {profesional.descripcion}
                </p>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Profesionales;
