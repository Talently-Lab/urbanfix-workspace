import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../Services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Evita registrar el evento dos veces por React StrictMode
  const eventoRegistrado = useRef(false);

  // Registrar la visita a Login
  useEffect(() => {
    if (eventoRegistrado.current) return;

    eventoRegistrado.current = true;

    const registrarVistaLogin = async () => {
      try {
        let sesionId = sessionStorage.getItem("sesionId");

        if (!sesionId) {
          sesionId = crypto.randomUUID();
          sessionStorage.setItem("sesionId", sesionId);
        }

        await api.post("/eventos", {
          nombreEvento: "VISTA_LOGIN",
          sesionId,
        });

        console.log("Evento VISTA_LOGIN registrado");
      } catch (error) {
        console.error(
          "Error al registrar VISTA_LOGIN:",
          error.response?.data || error.message
        );
      }
    };

    registrarVistaLogin();
  }, []);

  // Iniciar sesión
  const getLogin = async (e) => {
    e.preventDefault();

    setError("");
    setCargando(true);

    try {
      const respuesta = await api.post("/auth/login", {
        email,
        password,
      });

      const { usuario, token } = respuesta.data;

      const roles = {
        CLIENTE: "client",
        TECNICO: "technician",
        ADMIN: "ADMINISTRADOR",
        ADMINISTRADOR: "ADMINISTRADOR",
      };

      const userData = {
        ...usuario,
        role: roles[usuario.rol],
      };

      if (!userData.role) {
        setError("El rol del usuario no está reconocido.");
        return;
      }

      login(userData, token);

      if (userData.role === "client") {
        navigate("/Client/dashboard");
      } else if (userData.role === "admin") {
        navigate("/Admin");
      } else {
        navigate("/Technician/dashboard");
      }
    } catch (err) {
      console.error(
        "Error al iniciar sesión:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.mensaje ||
          "No se pudo iniciar sesión. Revisá tu correo y contraseña."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-urban-fondo p-4 sm:p-8">
      <div className="mx-auto grid min-h-[650px] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

        {/* PANEL IZQUIERDO */}
        <section className="relative flex flex-col justify-between overflow-hidden bg-urban-principal p-8 text-white sm:p-12 lg:p-14">
          {/* Decoración */}
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[40px] border-white/5" />
          <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full border-[50px] border-urban-button/20" />

          {/* Logo */}
          <Link
            to="/home"
            className="relative z-10 inline-flex w-fit items-center gap-3"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-urban-button text-2xl font-black">
              U
            </span>

            <span className="text-2xl font-extrabold tracking-tight">
              UrbanFix
            </span>
          </Link>

          {/* Presentación */}
          <div className="relative z-10 my-12">
            <span className="mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
              Soluciones para tu hogar
            </span>

            <h1 className="max-w-lg text-4xl font-extrabold leading-tight sm:text-5xl">
              Tu hogar,
              <span className="block text-urban-button">
                en buenas manos.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-slate-200 sm:text-lg">
              Conectá con profesionales de confianza para resolver lo que
              necesitás, de forma fácil y segura.
            </p>

            <div className="mt-9 space-y-4">
              {[
                "Profesionales para distintas necesidades",
                "Solicitudes simples y rápidas",
                "Seguimiento de tus trabajos",
              ].map((beneficio) => (
                <div key={beneficio} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-urban-button text-sm font-bold">
                    ✓
                  </span>

                  <span className="text-sm text-slate-100 sm:text-base">
                    {beneficio}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-sm text-slate-300">
            Encontrá la solución que tu hogar necesita.
          </p>
        </section>

        {/* PANEL DERECHO: LOGIN */}
        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">

            {/* Encabezado */}
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-widest text-urban-button">
                Bienvenido a UrbanFix
              </p>

              <h2 className="mt-3 text-3xl font-extrabold text-urban-principal sm:text-4xl">
                ¡Qué bueno verte!
              </h2>

              <p className="mt-3 text-sm leading-6 text-urban-texto-secundario">
                Ingresá tus datos para continuar.
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={getLogin} className="flex flex-col gap-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-urban-principal"
                >
                  Correo electrónico
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-urban-button focus:ring-4 focus:ring-urban-button/10"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-urban-principal"
                >
                  Contraseña
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Ingresá tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-urban-button focus:ring-4 focus:ring-urban-button/10"
                />
              </div>

              {/* Error */}
              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              {/* Botón */}
              <button
                type="submit"
                disabled={cargando}
                className="mt-2 w-full rounded-xl bg-urban-button px-5 py-4 font-bold text-white shadow-lg shadow-urban-button/20 transition hover:-translate-y-0.5 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cargando ? "Ingresando..." : "Iniciar sesión →"}
              </button>
            </form>

            {/* Registro independiente */}
            <p className="mt-6 text-center text-sm text-urban-texto-secundario">
              ¿Todavía no tenés cuenta?{" "}
              <Link
                to="/register"
                className="font-bold text-urban-button hover:underline"
              >
                Registrate
              </Link>
            </p>

            {/* Seguridad */}
            <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-urban-texto-secundario">
              <span aria-hidden="true">🔒</span>
              <span>Tu información se utiliza de forma segura.</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;