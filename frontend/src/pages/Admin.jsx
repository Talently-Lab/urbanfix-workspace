import { useEffect, useState } from "react";
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

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [usuariosResponse, solicitudesResponse] =
          await Promise.all([
            api.get("/admin/usuarios"),
            api.get("/admin/solicitudes"),
          ]);

        const usuarios = obtenerLista(
          usuariosResponse.data,
          "usuarios"
        );

        const solicitudes = obtenerLista(
          solicitudesResponse.data,
          "solicitudes"
        );

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
    };

    cargarDashboard();
  }, []);

  const tarjetas = [
    {
      titulo: "Clientes totales",
      total: totales.clientes,
      descripcion: "Clientes registrados",
      icono: "👥",
      color: "bg-emerald-50",
      tipo: "clientes",
    },
    {
      titulo: "Técnicos totales",
      total: totales.tecnicos,
      descripcion: "Profesionales registrados",
      icono: "🛠️",
      color: "bg-blue-50",
      tipo: "tecnicos",
    },
    {
      titulo: "Usuarios totales",
      total: totales.usuarios,
      descripcion: "Todos los usuarios registrados",
      icono: "📊",
      color: "bg-purple-50",
      tipo: "usuarios",
    },
    {
      titulo: "Solicitudes totales",
      total: totales.solicitudes,
      descripcion: "Solicitudes registradas",
      icono: "📋",
      color: "bg-orange-50",
      tipo: "solicitudes",
    }
  ];

  return (
    <main className="min-h-screen bg-[#F1F6FA] p-6 md:p-10">
      {/* Botones Total */}
      <section>
        <div className="mb-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#F26B4D]">
            Panel de administración
          </span>

          <h1 className="mt-2 text-3xl font-bold text-[#08284F]">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Resumen general de la actividad de UrbanFix.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
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
        </section>
      </section>
        {/* ESTADÍSTICAS Y GRÁFICOS */}
      <section>
        <DashboardMetricas />
      </section>


    </main>
  );
};

export default AdminDashboard;
