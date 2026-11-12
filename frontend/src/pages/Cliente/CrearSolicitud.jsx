import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api.js";

function CrearSolicitud() {
  const navigate = useNavigate();
  const location = useLocation();

  const servicio = location.state?.servicio;

  // ID de sesión del usuario
  const [sesionId] = useState(() => {
    let id = sessionStorage.getItem("sesionId");

    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("sesionId", id);
    }

    return id;
  });

  // ID único de esta instancia del formulario
  const [instanciaFormularioId] = useState(() =>
    crypto.randomUUID()
  );

  const eventoRegistrado = useRef(false);

  // Datos del formulario
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    idServicio: servicio?.idServicio || "",
    direccion: "",
  });

  const [loading, setLoading] = useState(false);
  const [aviso, setAviso] = useState(null);

  // Registrar SOLICITUD_INICIADA
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

        console.log(
          "SOLICITUD_INICIADA:",
          instanciaFormularioId
        );
      } catch (err) {
        console.error(
          "Error al registrar SOLICITUD_INICIADA:",
          err.response?.data || err.message
        );
      }
    };

    registrarInicio();
  }, [servicio, sesionId, instanciaFormularioId]);

  // Codigo para enviar la SOLICITUD
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    // Validaciones
    if (
      !form.titulo.trim() ||
      !form.descripcion.trim() ||
      !form.idServicio ||
      !form.direccion.trim()
    ) {
      setAviso({
        tipo: "error",
        titulo: "Campos incompletos",
        mensaje: "Completá todos los campos antes de continuar.",
      });

      return;
    }

    setLoading(true);
    setAviso(null);

    try {
      // 1. Crear solicitud
      const respuesta = await api.post("/solicitudes", {
        titulo: form.titulo.trim(),
        detalle: form.descripcion.trim(),
        direccion: form.direccion.trim(),
        idServicio: Number(form.idServicio),
        instanciaFormularioId,
      });

      console.log("Solicitud creada:", respuesta.data);

      // 3. Mostrar éxito
      setAviso({
        tipo: "success",
        titulo: "¡Solicitud enviada correctamente!",
        mensaje:
          "Tu solicitud fue creada exitosamente. Ya podés volver al inicio.",
      });

    } catch (err) {
      console.error(
        "Error al crear solicitud:",
        err.response?.data || err.message
      );

      // Mostrar error únicamente si falla la creación
      setAviso({
        tipo: "error",
        titulo: "No se pudo enviar la solicitud",
        mensaje:
          err.response?.data?.error ||
          err.response?.data?.mensaje ||
          "Ocurrió un error al crear tu solicitud. Intentá nuevamente.",
      });

    } finally {
      setLoading(false);
    }
  };

  // Si no se seleccionó un servicio
  if (!servicio) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-red-600">
          No se seleccionó ningún servicio.
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

  return (
    <div className="mx-auto w-full max-w-3xl">

      {/* RESULTADO O CARGA */}
      {loading || aviso ? (
        <div className="flex min-h-[450px] items-center justify-center">

          {/* Cargando */}
          {loading && (
            <div className="w-full rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-md">

              <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-urban-button"></div>

              <h2 className="text-xl font-bold text-urban-principal">
                Enviando solicitud...
              </h2>

              <p className="mt-2 text-sm text-urban-texto-secundario">
                Estamos procesando tu solicitud. Esperá un momento.
              </p>

            </div>
          )}

          {/* Resultado */}
          {!loading && aviso && (
            <div
              className={`w-full rounded-2xl border p-8 text-center shadow-md ${
                aviso.tipo === "success"
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >

              {/* Icono */}
              <div
                className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold ${
                  aviso.tipo === "success"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {aviso.tipo === "success" ? "✓" : "✕"}
              </div>

              {/* Título */}
              <h2
                className={`text-2xl font-bold ${
                  aviso.tipo === "success"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {aviso.titulo}
              </h2>

              {/* Mensaje */}
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-600">
                {aviso.mensaje}
              </p>

              {/* Botones */}
              {aviso.tipo === "success" ? (
                <button
                  type="button"
                  onClick={() => navigate("/Client/dashboard")}
                  className="mt-7 rounded-xl bg-urban-button px-7 py-3 font-bold text-white shadow-sm transition hover:brightness-95"
                >
                  Volver al inicio
                </button>
              ) : (
                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={() => navigate("/Client/dashboard")}
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Volver al inicio
                  </button>

                  <button
                    type="button"
                    onClick={() => setAviso(null)}
                    className="rounded-xl bg-urban-button px-6 py-3 font-bold text-white transition hover:brightness-95"
                  >
                    Volver al formulario
                  </button>

                </div>
              )}

            </div>
          )}

        </div>
      ) : (

        /* FORMULARIO */
        <>
          {/* Encabezado */}
          <div className="mb-7">

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-5 flex items-center gap-2 text-sm font-semibold text-urban-principal transition hover:text-urban-button"
            >
              ← Volver
            </button>

            <div className="mb-3 inline-flex items-center rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700">
              Nueva solicitud
            </div>

            <h1 className="text-3xl font-bold text-urban-principal">
              Solicitar servicio
            </h1>

            <p className="mt-2 text-sm text-urban-texto-secundario">
              Completá los datos para que podamos ayudarte con tu problema.
            </p>
          </div>

          {/* Servicio seleccionado */}
          <div className="mb-6 flex items-center gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              🛠️
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-urban-texto-secundario">
                Servicio seleccionado
              </p>

              <h2 className="text-lg font-bold text-urban-principal">
                {servicio.nombreServicio}
              </h2>

              <p className="mt-1 text-sm text-urban-texto-secundario">
                {servicio.descripcion}
              </p>
            </div>
          </div>

          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-md sm:p-8"
          >

            <div>
              <h2 className="text-xl font-bold text-urban-principal">
                Datos de tu solicitud
              </h2>

              <p className="mt-1 text-sm text-urban-texto-secundario">
                Contanos qué necesitás solucionar.
              </p>
            </div>

            {/* Título */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="titulo"
                className="text-sm font-semibold text-urban-principal"
              >
                Título del problema
              </label>

              <input
                id="titulo"
                type="text"
                required
                maxLength={100}
                minLength={1}
                placeholder="Ej: Rotura de caño en la cocina"
                value={form.titulo}
                onChange={(e) =>
                  setForm({ ...form, titulo: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-urban-button focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="descripcion"
                className="text-sm font-semibold text-urban-principal"
              >
                Descripción del problema
              </label>

              <textarea
                id="descripcion"
                rows={5}
                required
                maxLength={1000}
                minLength={1}
                placeholder="Describí qué sucede, desde cuándo ocurre y cualquier detalle que pueda ayudar al técnico..."
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                className="w-full resize-y rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-urban-button focus:bg-white focus:ring-2 focus:ring-orange-100"
              />

              <p className="text-right text-xs text-urban-texto-secundario">
                {form.descripcion.length}/1000
              </p>
            </div>

            {/* Dirección */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="direccion"
                className="text-sm font-semibold text-urban-principal"
              >
                Dirección del domicilio
              </label>

              <input
                id="direccion"
                type="text"
                required
                maxLength={200}
                placeholder="Ej: Av. Siempre Viva 123"
                value={form.direccion}
                onChange={(e) =>
                  setForm({ ...form, direccion: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-urban-button focus:bg-white focus:ring-2 focus:ring-orange-100"
              />

              <p className="text-xs text-urban-texto-secundario">
                Indicá dónde se realizará el servicio.
              </p>
            </div>

            {/* Botón */}
            <div className="border-t border-gray-100 pt-5">

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-urban-button px-5 py-3.5 font-bold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Crear solicitud
              </button>

              <p className="mt-3 text-center text-xs text-urban-texto-secundario">
                Revisá los datos antes de enviar tu solicitud.
              </p>

            </div>
          </form>
        </>
      )}

    </div>
  );
}

export default CrearSolicitud;
