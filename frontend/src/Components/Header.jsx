
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, token, logout } = useAuth();

  const [menuAbierto, setMenuAbierto] = useState(false);

  const headerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const estaLogueado = Boolean(user && token);

  // Normalizar el rol recibido del backend
  const rolUsuario = String(user?.rol ?? user?.role ?? "")
    .trim()
    .toUpperCase();

  // Ruta del dashboard según el rol
  const rutasDashboard = {
    CLIENTE: "/Client/dashboard",
    CLIENT: "/Client/dashboard",
    TECNICO: "/Technician/dashboard",
    TECHNICIAN: "/Technician/dashboard",
    ADMINISTRADOR: "/ADMINISTRADOR/dashboard",
    ADMIN: "/ADMINISTRADOR/dashboard",
  };

  const rutaDashboard = rutasDashboard[rolUsuario] || "/Home";

  // Enlaces principales
  const links = [
    { nombre: "Inicio", ruta: "/Home" },
    { nombre: "Profesionales", ruta: "/Profesionales" },
    { nombre: "Preguntas frecuentes", ruta: "/Faq" },
  ];

  // Cerrar menú al cambiar de página
  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  // Cerrar menú al hacer clic afuera o presionar Escape
  useEffect(() => {
    const manejarClickExterno = (event) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target)
      ) {
        setMenuAbierto(false);
      }
    };

    const manejarEscape = (event) => {
      if (event.key === "Escape") {
        setMenuAbierto(false);
      }
    };

    document.addEventListener("mousedown", manejarClickExterno);
    document.addEventListener("touchstart", manejarClickExterno);
    document.addEventListener("keydown", manejarEscape);

    return () => {
      document.removeEventListener("mousedown", manejarClickExterno);
      document.removeEventListener("touchstart", manejarClickExterno);
      document.removeEventListener("keydown", manejarEscape);
    };
  }, []);

  // Cerrar sesión
  const cerrarSesion = () => {
    setMenuAbierto(false);
    logout();
    navigate("/Home", { replace: true });
  };

  // Estilos de los enlaces
  const estiloLink =
    "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-[#08284F] transition-colors duration-200 hover:bg-[#F1F6FA] hover:text-[#C93C18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26B4D]";

  return (
    <header
      ref={headerRef}
      className="relative z-50 w-full border-b border-slate-200 bg-white shadow-sm"
    >
      <div className="mx-auto flex min-h-[76px] w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:min-h-[88px] lg:px-10 xl:px-14">

        {/* LOGO */}
        <Link
          to="/Home"
          aria-label="UrbanFix - Ir al inicio"
          className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3"
        >
          <img
            src="/logo-urban-azul.png"
            alt="Logo UrbanFix"
            className="h-11 w-auto object-contain sm:h-14 lg:h-16"
          />

          <span className="text-xl font-extrabold tracking-tight text-[#08284F] sm:text-2xl lg:text-[27px]">
            UrbanFix
          </span>
        </Link>

        {/* NAVEGACIÓN PARA COMPUTADORAS */}
        <nav
          aria-label="Navegación principal"
          className="hidden items-center justify-center gap-1 lg:flex xl:gap-3"
        >
          {links.map((link) => (
            <Link
              key={link.ruta}
              to={link.ruta}
              className={estiloLink}
            >
              {link.nombre}
            </Link>
          ))}
        </nav>

        {/* ACCIONES PARA COMPUTADORAS */}
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          {!estaLogueado ? (
            <Link
              to="/Login"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#F26B4D] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#C93C18] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26B4D] focus-visible:ring-offset-2"
            >
              Iniciar sesión
            </Link>
          ) : (
            <>
              <Link
                to={rutaDashboard}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#08284F]/15 px-4 py-2.5 text-sm font-semibold text-[#08284F] transition-colors hover:bg-[#F1F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26B4D]"
              >
                Mi Dashboard
              </Link>

              <button
                type="button"
                onClick={cerrarSesion}
                className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-[#C93C18] transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26B4D]"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>

        {/* BOTÓN MENÚ MÓVIL */}
        <button
          type="button"
          onClick={() => setMenuAbierto((actual) => !actual)}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
          aria-controls="menu-movil"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#08284F]/15 text-[#08284F] transition-colors hover:bg-[#F1F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26B4D] lg:hidden"
        >
          <div className="flex w-5 flex-col gap-[5px]">
            <span
              className={`h-0.5 w-full rounded-full bg-current transition-all duration-200 ${
                menuAbierto ? "translate-y-[7px] rotate-45" : ""
              }`}
            />

            <span
              className={`h-0.5 w-full rounded-full bg-current transition-all duration-200 ${
                menuAbierto ? "opacity-0" : ""
              }`}
            />

            <span
              className={`h-0.5 w-full rounded-full bg-current transition-all duration-200 ${
                menuAbierto ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* MENÚ DESPLEGABLE PARA MÓVILES */}
      <div
        id="menu-movil"
        aria-hidden={!menuAbierto}
        className={`absolute left-0 top-full w-full border-t border-slate-200 bg-white shadow-lg transition-all duration-200 lg:hidden ${
          menuAbierto
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0 pointer-events-none"
        }`}
      >
        <nav
          aria-label="Navegación móvil"
          className="mx-auto flex w-full max-w-[1440px] flex-col gap-1 px-4 py-4 sm:px-6"
        >
          {links.map((link) => (
            <Link
              key={link.ruta}
              to={link.ruta}
              onClick={() => setMenuAbierto(false)}
              className="flex min-h-12 items-center rounded-xl px-4 text-base font-semibold text-[#08284F] transition-colors hover:bg-[#F1F6FA] hover:text-[#C93C18]"
            >
              {link.nombre}
            </Link>
          ))}

          <div className="my-2 border-t border-slate-100" />

          {estaLogueado ? (
            <>
              <div className="rounded-xl bg-[#F1F6FA] px-4 py-3">
                <p className="truncate font-bold text-[#08284F]">
                  {user?.nombre || user?.email || "Usuario"}
                </p>

                <p className="mt-1 text-xs text-[#64748B]">
                  Sesión iniciada
                </p>
              </div>

              <Link
                to={rutaDashboard}
                onClick={() => setMenuAbierto(false)}
                className="flex min-h-12 items-center rounded-xl px-4 font-semibold text-[#08284F] transition-colors hover:bg-[#F1F6FA]"
              >
                Mi Dashboard
              </Link>

              <button
                type="button"
                onClick={cerrarSesion}
                className="flex min-h-12 w-full items-center rounded-xl px-4 text-left font-bold text-[#C93C18] transition-colors hover:bg-red-50"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              to="/Login"
              onClick={() => setMenuAbierto(false)}
              className="mt-1 flex min-h-12 items-center justify-center rounded-xl bg-[#F26B4D] px-4 font-bold text-white transition-colors hover:bg-[#C93C18]"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
