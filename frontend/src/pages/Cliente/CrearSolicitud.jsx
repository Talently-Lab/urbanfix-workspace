import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../Services/api.js";

function CrearSolicitud() {
  const navigate = useNavigate();
  const location = useLocation();

  const servicio = location.state?.servicio;

  const [sesionId] = useState(() => {
    let id = sessionStorage.getItem("sesionId");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("sesionId", id);
    }
    return id;
  });

  const [instanciaFormularioId] = useState(() => crypto.randomUUID());
  const eventoRegistrado = useRef(false);

  const [form, setForm] = useState({
    descripcion: "",
    idServicio: servicio?.idServicio || "",
    direccion: "",
  });

  const [loading, setLoading] = useState(false);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    if (!servicio || eventoRegistrado.current) return;
    eventoRegistrado.current = true;

    const registrarInicio = async () => {
      try {
        await api.post("/eventos", {
          nombreEvento: "SOLICITUD_INICIADA",
          sesionId,
          instanciaFormularioId,
        });
      } catch (err) {
        console.error("Error al registrar inicio:", err);
      }
    };

    registrarInicio();
  }, [servicio, sesionId, instanciaFormularioId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.descripcion.trim() || !form.idServicio || !form.direccion.trim()) {
      setAviso({
        tipo: "error",
        titulo: "Faltan algunos datos",
        mensaje: "Completá todos los campos antes de continuar.",
      });
      return;
    }

    setLoading(true);
    setAviso(null);

    try {
      await api.post("/solicitudes", {
        detalle: form.descripcion.trim(),
        direccion: form.direccion.trim(),
        idServicio: Number(form.idServicio),
        sesionId,
        instanciaFormularioId,
      });

      setAviso({
        tipo: "success",
        titulo: "¡Solicitud creada!",
        mensaje:
          "Recibimos tu solicitud correctamente. Ya podés consultar su estado desde tu panel.",
      });
    } catch (err) {
      console.error("Error al crear solicitud:", err);
      setAviso({
        tipo: "error",
        titulo: "No pudimos crear tu solicitud",
        mensaje:
          err.response?.data?.error ||
          err.response?.data?.mensaje ||
          "Ocurrió un error inesperado. Intentá nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!servicio) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-urban-fondo text-3xl">
          <span aria-hidden="true">⚠️</span>
        </div>

        <h2 className="text-xl font-extrabold text-urban-principal">
          No hay un servicio seleccionado
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Volvé al panel y seleccioná el servicio que necesitás.
        </p>

        <button
          onClick={() => navigate("/client/dashboard")}
          className="mt-6 rounded-xl bg-urban-accion px-6 py-3 text-sm font-bold text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-urban-coral/40"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const actualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-urban-principal outline-none transition placeholder:text-slate-500 focus:border-urban-principal focus:ring-4 focus:ring-urban-principal/15";

  return (
    <div className="mx-auto w-full max-w-6xl pb-12">
      {/* BARRA SUPERIOR CON LOGO */}

      {/* ENCABEZADO */}
            <div className="relative mb-8 overflow-hidden rounded-3xl bg-urban-principal px-7 py-8 text-white shadow-lg sm:px-10 sm:py-10">
        <div className="relative z-10">
          {/* LOGO + VOLVER */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="mb-6 flex items-center gap-3">
                <img
                  src="/logo-urban-coral.png"
                  alt=""
                  aria-hidden="true"
                  className="h-10 w-auto sm:h-12"
                />

                <span
                  aria-label="UrbanFix"
                  className="text-2xl font-extrabold tracking-tight sm:text-3xl"
                >
                  <span className="text-white">Urban</span>
                  <span className="text-[#F26B4D]">Fix</span>
                </span>
              </div>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 rounded-xl bg-urban-accion px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-black/20 transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              <span aria-hidden="true">←</span>
              Volver a servicios
            </button>
          </div>

          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              <span className="h-2 w-2 rounded-full bg-urban-coral" />
              Nueva solicitud
            </span>

            <h1 className="mt-5 text-3xl font-extrabold !text-white tracking-tight sm:text-4xl">
              ¿Qué necesitás solucionar?
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
              Contanos qué sucede y dónde necesitás ayuda. Encontraremos un
              profesional para ayudarte.
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-32 right-20 h-64 w-64 rounded-full bg-urban-coral/20 blur-2xl" />
        <div
          aria-hidden="true"
          className="absolute bottom-5 right-8 hidden text-7xl opacity-10 lg:block"
        >
          🛠️
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[1fr_320px]">
        {/* FORMULARIO */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          {loading || aviso ? (
            <div
              className="flex min-h-[450px] flex-col items-center justify-center text-center"
              role="status"
              aria-live="polite"
            >
              {loading ? (
                <>
                  <div className="mb-6 h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-urban-coral" />

                  <h2 className="text-2xl font-extrabold text-urban-principal">
                    Enviando solicitud...
                  </h2>

                  <p className="mt-3 max-w-sm text-sm text-slate-600">
                    Estamos procesando tus datos. No cierres esta página.
                  </p>
                </>
              ) : (
                <>
                  <div
                    className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl font-bold ${
                      aviso.tipo === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {aviso.tipo === "success" ? "✓" : "!"}
                  </div>

                  <h2 className="text-2xl font-extrabold text-urban-principal">
                    {aviso.titulo}
                  </h2>

                  <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
                    {aviso.mensaje}
                  </p>

                  {aviso.tipo === "success" ? (
                    <button
                      onClick={() => navigate("/client/dashboard")}
                      className="mt-8 rounded-xl bg-urban-accion px-8 py-3.5 text-sm font-bold text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-urban-coral/40"
                    >
                      Ir a mi panel →
                    </button>
                  ) : (
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={() => navigate("/client/dashboard")}
                        className="rounded-xl border border-urban-principal/25 px-6 py-3 text-sm font-bold text-urban-principal transition hover:bg-urban-fondo focus:outline-none focus-visible:ring-4 focus-visible:ring-urban-principal/20"
                      >
                        Volver al inicio
                      </button>

                      <button
                        onClick={() => setAviso(null)}
                        className="rounded-xl bg-urban-accion px-6 py-3 text-sm font-bold text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-urban-coral/40"
                      >
                        Intentar nuevamente
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* TÍTULO DEL FORMULARIO */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-urban-fondo text-lg"
                  >
                    📋
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold text-urban-principal">
                      Detalles del trabajo
                    </h2>
                    <p className="mt-1 text-xs text-slate-600">
                      Completá la información del servicio.
                    </p>
                  </div>
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              <div className="space-y-2">
                <label
                  htmlFor="descripcion"
                  className="text-sm font-bold text-urban-principal"
                >
                  Descripción del problema
                  <span className="ml-1 text-urban-accion" aria-hidden="true">
                    *
                  </span>
                </label>

                <textarea
                  id="descripcion"
                  rows={6}
                  required
                  maxLength={1000}
                  placeholder="Explicá qué sucede, desde cuándo ocurre y cualquier detalle importante..."
                  value={form.descripcion}
                  onChange={(e) => actualizarCampo("descripcion", e.target.value)}
                  className={`${inputClass} resize-y`}
                />

                <p className="text-right text-xs text-slate-500">
                  {form.descripcion.length}/1000 caracteres
                </p>
              </div>

              {/* DIRECCIÓN */}
              <div className="space-y-2">
                <label
                  htmlFor="direccion"
                  className="text-sm font-bold text-urban-principal"
                >
                  Dirección del domicilio
                  <span className="ml-1 text-urban-accion" aria-hidden="true">
                    *
                  </span>
                </label>

                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-lg"
                  >
                    📍
                  </span>

                  <input
                    id="direccion"
                    type="text"
                    required
                    maxLength={200}
                    placeholder="Ej: Av. Siempre Viva 123"
                    value={form.direccion}
                    onChange={(e) => actualizarCampo("direccion", e.target.value)}
                    className={`${inputClass} pl-12`}
                  />
                </div>

                <p className="text-xs text-slate-500">
                  Indicá la dirección donde el profesional realizará el trabajo.
                </p>
              </div>

              {/* BOTÓN */}
              <div className="border-t border-slate-100 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-urban-accion px-6 py-4 text-sm font-bold text-white shadow-md shadow-urban-accion/20 transition hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-urban-coral/40 disabled:opacity-50"
                >
                  Crear solicitud
                  <span aria-hidden="true" className="text-lg">
                    →
                  </span>
                </button>

                <p className="mt-4 text-center text-xs text-slate-500">
                  🔒 Tus datos serán utilizados únicamente para gestionar el servicio.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* COLUMNA LATERAL */}
        <aside className="space-y-5">
          {/* SERVICIO SELECCIONADO */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-urban-principal px-6 py-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-white">
                Servicio seleccionado
              </p>
            </div>

            <div className="p-6">
              <div
                aria-hidden="true"
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-urban-fondo text-3xl"
              >
                🛠️
              </div>

              <h3 className="text-xl font-extrabold text-urban-principal">
                {servicio.nombreServicio}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {servicio.descripcion || "Servicio seleccionado para tu solicitud."}
              </p>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                <span className="h-2 w-2 rounded-full bg-urban-coral" />
                <span className="text-xs font-semibold text-slate-600">
                  Servicio seleccionado
                </span>
              </div>
            </div>
          </div>

          {/* CONSEJOS */}
          <div className="rounded-3xl border border-urban-principal/10 bg-urban-fondo p-6">
            <div className="mb-4 flex items-center gap-3">
              <span aria-hidden="true" className="text-2xl">
                💡
              </span>
              <h3 className="font-extrabold text-urban-principal">Consejos útiles</h3>
            </div>

            <ul className="space-y-4 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="font-extrabold text-urban-accion">01.</span>
                <span>Describí el problema con claridad y en pocas palabras.</span>
              </li>

              <li className="flex gap-3">
                <span className="font-extrabold text-urban-accion">02.</span>
                <span>Explicá los detalles para que el técnico comprenda la situación.</span>
              </li>

              <li className="flex gap-3">
                <span className="font-extrabold text-urban-accion">03.</span>
                <span>Verificá que la dirección sea correcta.</span>
              </li>
            </ul>
          </div>

          {/* AYUDA */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex gap-3">
              <span aria-hidden="true" className="text-2xl">
                🤝
              </span>

              <div>
                <h3 className="font-bold text-urban-principal">¿Necesitás ayuda?</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Completá los datos con tranquilidad. Cuanta más información
                  proporciones, mejor podrá entender el profesional tu problema.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CrearSolicitud;
