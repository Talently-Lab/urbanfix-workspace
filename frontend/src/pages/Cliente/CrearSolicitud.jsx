
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api.js";

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

  const [instanciaFormularioId] = useState(() =>
    crypto.randomUUID()
  );

  const eventoRegistrado = useRef(false);

  const [form, setForm] = useState({
    titulo: "",
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

    if (
      !form.titulo.trim() ||
      !form.descripcion.trim() ||
      !form.idServicio ||
      !form.direccion.trim()
    ) {
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
        titulo: form.titulo.trim(),
        detalle: form.descripcion.trim(),
        direccion: form.direccion.trim(),
        idServicio: Number(form.idServicio),
        instanciaFormularioId,
      });

      // Registrar la creación sin afectar el resultado de la solicitud.
      api.post("/eventos", {
        nombreEvento: "SOLICITUD_CREADA",
        sesionId,
        instanciaFormularioId,
      }).catch((err) => {
        console.error("Error al registrar evento:", err);
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
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow-sm">
        <div className="mb-4 text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-urban-principal">
          No hay un servicio seleccionado
        </h2>
        <p className="mt-2 text-sm text-urban-texto-secundario">
          Volvé al panel y seleccioná el servicio que necesitás.
        </p>
        <button
          onClick={() => navigate("/Client/dashboard")}
          className="mt-4 rounded-xl bg-urban-button px-5 py-3 font-semibold text-white"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const actualizarCampo = (campo, valor) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-urban-button focus:bg-white focus:ring-4 focus:ring-orange-100";

  return (
    <div className="mx-auto w-full max-w-6xl pb-12">
      {/* ENCABEZADO */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-urban-principal px-7 py-9 text-white shadow-lg sm:px-10 sm:py-11">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-urban-principal shadow-sm transition hover:border-urban-button hover:bg-orange-50 hover:text-urban-button"
        >
          <span className="text-lg">←</span>
          Volver a servicios
        </button>

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-200">
            <span className="h-2 w-2 rounded-full bg-orange-400" />
            UrbanFix · Nueva solicitud
          </span>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
            ¿Qué necesitás solucionar?
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-blue-100 sm:text-base">
            Contanos qué sucede y dónde necesitás ayuda.
            Encontraremos un profesional para ayudarte.
          </p>
        </div>

        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-32 right-20 h-64 w-64 rounded-full bg-orange-500/10 blur-2xl" />

        <div className="absolute bottom-5 right-8 hidden text-7xl opacity-10 lg:block">
          🛠️
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[1fr_320px]">
        {/* FORMULARIO */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-9">
          {loading || aviso ? (
            <div className="flex min-h-[450px] flex-col items-center justify-center text-center">
              {loading ? (
                <>
                  <div className="mb-6 h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />

                  <h2 className="text-2xl font-bold text-urban-principal">
                    Enviando solicitud...
                  </h2>

                  <p className="mt-3 max-w-sm text-sm text-slate-500">
                    Estamos procesando tus datos. No cierres esta página.
                  </p>
                </>
              ) : (
                <>
                  <div
                    className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
                      aviso.tipo === "success"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {aviso.tipo === "success" ? "✓" : "!"}
                  </div>

                  <h2 className="text-2xl font-extrabold text-urban-principal">
                    {aviso.titulo}
                  </h2>

                  <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
                    {aviso.mensaje}
                  </p>

                  {aviso.tipo === "success" ? (
                    <button
                      onClick={() => navigate("/Client/dashboard")}
                      className="mt-8 rounded-xl bg-urban-button px-8 py-3.5 font-bold text-white transition hover:brightness-95"
                    >
                      Ir a mi panel →
                    </button>
                  ) : (
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={() => navigate("/Client/dashboard")}
                        className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Volver al inicio
                      </button>

                      <button
                        onClick={() => setAviso(null)}
                        className="rounded-xl bg-urban-button px-6 py-3 font-bold text-white hover:brightness-95"
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
              {/* TITULO DEL FORMULARIO */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-lg">
                    📋
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold text-urban-principal">
                      Detalles del trabajo
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Completá la información del servicio.
                    </p>
                  </div>
                </div>
              </div>

              {/* TITULO */}
              <div className="space-y-2">
                <label
                  htmlFor="titulo"
                  className="text-sm font-bold text-slate-700"
                >
                  Título del problema
                  <span className="ml-1 text-orange-500">*</span>
                </label>

                <input
                  id="titulo"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Ej: Pérdida de agua en la cocina"
                  value={form.titulo}
                  onChange={(e) =>
                    actualizarCampo("titulo", e.target.value)
                  }
                  className={inputClass}
                />

                <p className="text-right text-xs text-slate-400">
                  {form.titulo.length}/100 caracteres
                </p>
              </div>

              {/* DESCRIPCION */}
              <div className="space-y-2">
                <label
                  htmlFor="descripcion"
                  className="text-sm font-bold text-slate-700"
                >
                  Descripción del problema
                  <span className="ml-1 text-orange-500">*</span>
                </label>

                <textarea
                  id="descripcion"
                  rows={5}
                  required
                  maxLength={1000}
                  placeholder="Explicá qué sucede, desde cuándo ocurre y cualquier detalle importante..."
                  value={form.descripcion}
                  onChange={(e) =>
                    actualizarCampo("descripcion", e.target.value)
                  }
                  className={`${inputClass} resize-y`}
                />

                <p className="text-right text-xs text-slate-400">
                  {form.descripcion.length}/1000 caracteres
                </p>
              </div>

              {/* DIRECCION */}
              <div className="space-y-2">
                <label
                  htmlFor="direccion"
                  className="text-sm font-bold text-slate-700"
                >
                  Dirección del domicilio
                  <span className="ml-1 text-orange-500">*</span>
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    📍
                  </span>

                  <input
                    id="direccion"
                    type="text"
                    required
                    maxLength={200}
                    placeholder="Ej: Av. Siempre Viva 123"
                    value={form.direccion}
                    onChange={(e) =>
                      actualizarCampo("direccion", e.target.value)
                    }
                    className={`${inputClass} pl-12`}
                  />
                </div>

                <p className="text-xs text-slate-400">
                  Indicá la dirección donde el profesional realizará el trabajo.
                </p>
              </div>

              {/* BOTON */}
              <div className="border-t border-slate-100 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-urban-button px-6 py-4 font-bold text-white shadow-md shadow-orange-500/10 transition hover:-translate-y-0.5 hover:brightness-95 disabled:opacity-50"
                >
                  Crear solicitud
                  <span className="text-lg">→</span>
                </button>

                <p className="mt-4 text-center text-xs text-slate-400">
                  🔒 Tus datos serán utilizados únicamente para gestionar el servicio.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* COLUMNA LATERAL */}
        <aside className="space-y-5">
          {/* SERVICIO SELECCIONADO */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="bg-slate-50 px-6 py-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Servicio seleccionado
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
                🛠️
              </div>

              <h3 className="text-xl font-extrabold text-urban-principal">
                {servicio.nombreServicio}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                {servicio.descripcion || "Servicio seleccionado para tu solicitud."}
              </p>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs font-semibold text-slate-500">
                  Servicio seleccionado
                </span>
              </div>
            </div>
          </div>

          {/* RECOMENDACIONES */}
          <div className="rounded-3xl bg-blue-50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <h3 className="font-extrabold text-urban-principal">
                Consejos útiles
              </h3>
            </div>

            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="font-bold text-orange-500">01.</span>
                <span>Usá un título corto que identifique el problema.</span>
              </li>

              <li className="flex gap-3">
                <span className="font-bold text-orange-500">02.</span>
                <span>
                  Explicá los detalles para que el técnico comprenda la situación.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="font-bold text-orange-500">03.</span>
                <span>Verificá que la dirección sea correcta.</span>
              </li>
            </ul>
          </div>

          {/* AYUDA */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6">
            <div className="flex gap-3">
              <span className="text-2xl">🤝</span>
              <div>
                <h3 className="font-bold text-urban-principal">
                  ¿Necesitás ayuda?
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Completá los datos con tranquilidad. Cuanta más información proporciones, mejor podrá entender el profesional tu problema.
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
