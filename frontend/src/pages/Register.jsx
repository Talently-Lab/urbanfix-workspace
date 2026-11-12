import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { LoadingIndicator } from "../Components/DashboardState.js";

function Register() {
  const navigate = useNavigate();
  const [rol, setRol] = useState("CLIENTE");
  
  // Evita registrar el evento dos veces por React StrictMode
  const eventoRegistrado = useRef(false);

  // Registrar la visita a la page Register
  useEffect(() => {
    if (eventoRegistrado.current) return;

    eventoRegistrado.current = true;

    const registrarVistaRegister = async () => {
      try {
        let sesionId = sessionStorage.getItem("sesionId");

        if (!sesionId) {
          sesionId = crypto.randomUUID();
          sessionStorage.setItem("sesionId", sesionId);
        }

        await api.post("/eventos", {
          nombreEvento: "VISTA_REGISTRO",
          sesionId,
        });

        console.log("Evento VISTA_REGISTRO registrado");
      } catch (error) {
        console.error(
          "Error al registrar VISTA_REGISTRO:",
          error.response?.data || error.message
        );
      }
    };

    registrarVistaRegister();
  }, []);

  // Datos del Registro
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    numeroTelefono: "",
  });

  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);

  const [loadingServicios, setLoadingServicios] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Obtener servicios cuando se elige ser técnico
  useEffect(() => {
    if (rol !== "TECNICO") return;

    const obtenerServicios = async () => {
      try {
        setLoadingServicios(true);
        setError("");

        const response = await api.get("/servicios");

        setServicios(response.data.servicios || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.mensaje
            || requestError.response?.data?.error
            || "No se pudieron cargar los servicios. Intentá nuevamente."
        );
      } finally {
        setLoadingServicios(false);
      }
    };

    obtenerServicios();
  }, [rol]);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Seleccionar o quitar servicios
  const handleServicio = (idServicio) => {
    setServiciosSeleccionados((prev) =>
      prev.includes(idServicio)
        ? prev.filter((id) => id !== idServicio)
        : [...prev, idServicio]
    );
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (rol === "TECNICO" && serviciosSeleccionados.length === 0) {
      setError("Tenés que seleccionar al menos un servicio.");
      return;
    }

    try {
      setLoading(true);

      const datosRegistro = {
        ...form,
        rol,
      };

      // Los técnicos deben enviar los servicios seleccionados
      if (rol === "TECNICO") {
        datosRegistro.idServicios = serviciosSeleccionados;
      }

      await api.post("/auth/register", datosRegistro);

      setSuccess("¡Tu cuenta fue creada correctamente!");

      setTimeout(() => {
        navigate("/login", {
          state: {
            mensaje: "Cuenta creada correctamente. Iniciá sesión.",
          },
        });
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
        err.response?.data?.error ||
        "No se pudo crear la cuenta. Revisá tus datos."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F1F6FA] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl shadow-[#08284F]/10 p-6 sm:p-10">

        {/* Logo */}
        <Link to="/" className="text-3xl font-extrabold text-[#08284F]">
          Urban<span className="text-[#F26B4D]">Fix.</span>
        </Link>

        {/* Encabezado */}
        <div className="mt-8 mb-7">
          <h1 className="text-3xl font-bold text-[#08284F]">
            Crear una cuenta
          </h1>

          <p className="text-[#64748B] mt-2">
            Unite a UrbanFix y empezá hoy mismo.
          </p>
        </div>

        {/* Selección de rol */}
        <div className="mb-8">

          <h2 className="text-sm font-bold text-[#08284F] mb-3">
            ¿Cómo querés utilizar UrbanFix?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Cliente */}
            <button
              type="button"
              onClick={() => {
                setRol("CLIENTE");
                setServiciosSeleccionados([]);
                setError("");
              }}
              className={`text-left p-5 rounded-xl border-2 transition-all ${
                rol === "CLIENTE"
                  ? "border-[#F26B4D] bg-[#FFF7F4]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-3">🏠</div>

              <h3 className="font-bold text-[#08284F]">
                Busco ayuda
              </h3>

              <p className="text-sm text-[#64748B] mt-1">
                Quiero encontrar profesionales para mi hogar.
              </p>

              {rol === "CLIENTE" && (
                <span className="text-xs font-bold text-[#F26B4D] mt-3 block">
                  ✓ Seleccionado
                </span>
              )}
            </button>

            {/* Técnico */}
            <button
              type="button"
              onClick={() => {
                setRol("TECNICO");
                setError("");
              }}
              className={`text-left p-5 rounded-xl border-2 transition-all ${
                rol === "TECNICO"
                  ? "border-[#F26B4D] bg-[#FFF7F4]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-3">🔧</div>

              <h3 className="font-bold text-[#08284F]">
                Quiero ser técnico
              </h3>

              <p className="text-sm text-[#64748B] mt-1">
                Quiero ofrecer mis servicios profesionales.
              </p>

              {rol === "TECNICO" && (
                <span className="text-xs font-bold text-[#F26B4D] mt-3 block">
                  ✓ Seleccionado
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-[#08284F] mb-2">
                Nombre
              </label>

              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#F26B4D] focus:ring-2 focus:ring-[#F26B4D]/10"
              />
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-semibold text-[#08284F] mb-2">
                Apellido
              </label>

              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Tu apellido"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#F26B4D] focus:ring-2 focus:ring-[#F26B4D]/10"
              />
            </div>

          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-[#08284F] mb-2">
              Correo electrónico
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#F26B4D] focus:ring-2 focus:ring-[#F26B4D]/10"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-semibold text-[#08284F] mb-2">
              Número de teléfono
            </label>

            <input
              type="tel"
              name="numeroTelefono"
              value={form.numeroTelefono}
              onChange={handleChange}
              placeholder="Ej: 1123456789"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#F26B4D] focus:ring-2 focus:ring-[#F26B4D]/10"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-semibold text-[#08284F] mb-2">
              Contraseña
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Ingresá tu contraseña"
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#F26B4D] focus:ring-2 focus:ring-[#F26B4D]/10"
            />
            <p className="mt-2 text-xs text-[#64748B]">
              La contraseña debe tener al menos 8 caracteres.
            </p>
          </div>

          {/* Selección de servicios para técnicos */}
          {rol === "TECNICO" && (
            <div className="border-t border-gray-100 pt-6">

              <h2 className="text-lg font-bold text-[#08284F]">
                Tus especialidades
              </h2>

              <p className="text-sm text-[#64748B] mt-1 mb-4">
                Seleccioná los servicios que ofrecés.
                Podés elegir más de uno.
              </p>

              {loadingServicios ? (
                <LoadingIndicator
                  label="Cargando servicios..."
                  className="text-sm text-[#64748B]"
                />
              ) : servicios.length === 0 ? (
                <p className="text-sm text-[#64748B]">
                  No hay servicios disponibles.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {servicios.map((servicio) => {
                    const id = servicio.idServicio ?? servicio.id;
                    const nombre =
                      servicio.nombreServicio ?? servicio.nombre;

                    const seleccionado =
                      serviciosSeleccionados.includes(id);

                    return (
                      <label
                        key={id}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          seleccionado
                            ? "border-[#F26B4D] bg-[#FFF7F4]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() => handleServicio(id)}
                          className="w-4 h-4 accent-[#F26B4D]"
                        />

                        <span className="text-sm font-medium text-[#08284F]">
                          {nombre}
                        </span>
                      </label>
                    );
                  })}

                </div>
              )}

              <p className="text-xs text-[#64748B] mt-3">
                Servicios seleccionados: {serviciosSeleccionados.length}
              </p>

            </div>
          )}

          {/* Mensajes */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading || (rol === "TECNICO" && loadingServicios)}
            className="w-full py-3.5 rounded-xl bg-[#F26B4D] text-white font-bold hover:bg-[#df573b] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? (
                <span className="inline-flex items-center justify-center gap-2" role="status">
                  <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  Creando cuenta...
                </span>
              )
              : rol === "TECNICO"
                ? "Crear cuenta de técnico"
                : "Crear cuenta"}
          </button>

        </form>

        {/* Login */}
        <p className="text-center text-sm text-[#64748B] mt-7">
          ¿Ya tenés una cuenta?{" "}
          <Link
            to="/login"
            className="font-bold text-[#F26B4D] hover:underline"
          >
            Iniciar sesión
          </Link>
        </p>

      </div>
    </main>
  );
}

export default Register;
