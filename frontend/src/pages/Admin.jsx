import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api.js";
import CardTotalAdmin from "./Administrador/CardTotalAdmin";
import DashboardMetricas from "./Administrador/DashboardMetricas.jsx";

const obtenerLista = (data, propiedad) => {
  if (Array.isArray(data)) return data;
  return data?.[propiedad] || [];
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [totales, setTotales] = useState({
    clientes: 0,
    solicitudes: 0,
    tecnicos: 0,
    usuarios: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [usuariosResponse, solicitudesResponse] = await Promise.all([
        api.get("/admin/usuarios"),
        api.get("/admin/solicitudes"),
      ]);

      const usuarios = obtenerLista(usuariosResponse.data, "usuarios");
      const solicitudes = obtenerLista(solicitudesResponse.data, "solicitudes");

      const clientes = usuarios.filter(
        (u) => u.rol?.toUpperCase() === "CLIENTE"
      );

      const tecnicos = usuarios.filter(
        (u) => u.rol?.toUpperCase() === "TECNICO"
      );

      setTotales({
        clientes: clientes.length,
        solicitudes: solicitudes.length,
        tecnicos: tecnicos.length,
        usuarios: clientes.length + tecnicos.length,
      });
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
      setError("No se pudieron cargar las estadísticas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  const tarjetas = [
    {
      titulo: "Clientes totales",
      total: totales.clientes,
      descripcion: "Clientes registrados",
      icono: "👥",
      color: "bg-[#F1F6FA]",
      tipo: "clientes",
    },
    {
      titulo: "Técnicos totales",
      total: totales.tecnicos,
      descripcion: "Profesionales registrados",
      icono: "🛠️",
      color: "bg-[#F1F6FA]",
      tipo: "tecnicos",
    },
    {
      titulo: "Usuarios totales",
      total: totales.usuarios,
      descripcion: "Todos los usuarios registrados",
      icono: "📊",
      color: "bg-[#F1F6FA]",
      tipo: "usuarios",
    },
    {
      titulo: "Solicitudes totales",
      total: totales.solicitudes,
      descripcion: "Solicitudes registradas",
      icono: "📋",
      color: "bg-[#F1F6FA]",
      tipo: "solicitudes",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F1F6FA] p-4 sm:p-6 md:p-10">
      <div className="mx-auto w-full max-w-7xl">
        {/* ENCABEZADO (fondo azul: isotipo blanco con "Fix" en coral) */}
        <header className="relative mb-8 overflow-hidden rounded-3xl bg-[#08284F] px-7 py-8 text-white shadow-lg sm:px-10 sm:py-10">
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
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

              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                <span className="h-2 w-2 rounded-full bg-[#F26B4D]" />
                Panel de administración
              </span>

              <h1 className="mt-4 text-3xl !text-urban-accion font-extrabold tracking-tight sm:text-4xl">
                Dashboard
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                Resumen general de la actividad de UrbanFix.
              </p>
            </div>

            <button
              type="button"
              onClick={cargarDashboard}
              disabled={loading}
              className="flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#08284F] shadow-md shadow-black/20 transition hover:bg-[#F1F6FA] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 disabled:opacity-60"
            >
              <span
                aria-hidden="true"
                className={loading ? "animate-spin" : ""}
              >
                ↻
              </span>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-32 right-20 h-64 w-64 rounded-full bg-[#F26B4D]/20 blur-2xl" />
        </header>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-700 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 font-bold text-red-700"
              >
                !
              </span>
              <span className="font-semibold">{error}</span>
            </div>

            <button
              type="button"
              onClick={cargarDashboard}
              className="w-fit rounded-xl bg-[#C93C18] px-5 py-2 text-sm font-bold text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F26B4D]/40"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* TOTALES */}
        <section aria-labelledby="titulo-totales" className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-6 w-1.5 rounded-full bg-[#F26B4D]" />
            <h2
              id="titulo-totales"
              className="text-lg font-extrabold text-[#08284F]"
            >
              Totales
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {tarjetas.map((tarjeta) => (
              <CardTotalAdmin
                key={tarjeta.tipo}
                titulo={tarjeta.titulo}
                total={tarjeta.total}
                descripcion={tarjeta.descripcion}
                icono={tarjeta.icono}
                color={tarjeta.color}
                loading={loading}
                onVerMas={() =>
                  navigate(`/admin/dashboard-listado?tipo=${tarjeta.tipo}`)
                }
              />
            ))}
          </div>
        </section>

        {/* ESTADÍSTICAS Y GRÁFICOS */}
        <section aria-labelledby="titulo-metricas">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-6 w-1.5 rounded-full bg-[#F26B4D]" />
            <h2
              id="titulo-metricas"
              className="text-lg font-extrabold text-[#08284F]"
            >
              Estadísticas
            </h2>
          </div>

          <DashboardMetricas />
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;
