import { useState } from "react";

const preguntas = [
  {
    pregunta: "¿Cómo puedo solicitar un servicio?",
    respuesta:
      "Seleccioná el servicio que necesitás, completá el formulario con los detalles del problema y tu dirección. Un profesional podrá recibir tu solicitud.",
  },
  {
    pregunta: "¿Cómo encuentro un profesional?",
    respuesta:
      "Cuando creás una solicitud, los profesionales disponibles pueden recibirla y aceptar el trabajo.",
  },
  {
    pregunta: "¿Puedo consultar el estado de mi solicitud?",
    respuesta:
      "Sí. Desde tu panel de cliente podés consultar el estado y hacer el seguimiento de tus solicitudes.",
  },
  {
    pregunta: "¿Qué sucede si un profesional acepta mi solicitud?",
    respuesta:
      "Podrás consultar los datos del profesional asignado y realizar el seguimiento del servicio desde tu panel.",
  },
  {
    pregunta: "¿Qué servicios ofrece UrbanFix?",
    respuesta:
      "UrbanFix permite solicitar distintos servicios para el hogar, como plomería, electricidad, gas y carpintería.",
  },
];

const PreguntasFrecuentes = ({ items = preguntas }) => {
  const [abierta, setAbierta] = useState(null);

  const togglePregunta = (index) => {
    setAbierta(abierta === index ? null : index);
  };

  return (
    <section className="bg-[#F1F6FA] px-6 py-16 sm:px-10 lg:px-20">
      <div className="mx-auto max-w-4xl">

        <div className="mb-10 text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-[#F26B4D]">
            Centro de ayuda
          </span>

          <h2 className="mt-3 text-3xl font-extrabold text-[#08284F] sm:text-4xl">
            Preguntas frecuentes
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-500">
            Encontrá respuestas a las dudas más comunes sobre cómo funciona
            UrbanFix.
          </p>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => togglePregunta(index)}
                aria-expanded={abierta === index}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-bold text-[#08284F]">
                  {item.pregunta}
                </span>

                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xl font-bold text-[#F26B4D] transition-transform ${
                    abierta === index ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>

              {abierta === index && (
                <div className="border-t border-slate-100 px-6 py-5">
                  <p className="text-sm leading-relaxed text-slate-600">
                    {item.respuesta}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PreguntasFrecuentes;
