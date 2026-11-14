import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import api from "../../Services/api.js";

const DashboardMetricas = () => {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerMetricas = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/metricas");

        setMetricas(response.data.metricas);
      } catch (error) {
        console.error("Error al obtener métricas:", error);
        setError("No se pudieron cargar las métricas.");
      } finally {
        setLoading(false);
      }
    };

    obtenerMetricas();
  }, []);

  if (loading) {
    return (
      <section className="mt-10">
        <h2 className="mb-5 text-2xl font-bold text-[#08284F]">
          Indicadores y estadísticas
        </h2>
        <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">
          Cargando estadísticas...
        </div>
      </section>
    );
  }

  if (error || !metricas) {
    return (
      <section className="mt-10">
        <h2 className="mb-5 text-2xl font-bold text-[#08284F]">
          Indicadores y estadísticas
        </h2>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
          {error || "No hay datos disponibles."}
        </div>
      </section>
    );
  }

  const abandono = metricas.abandonoSolicitud || {};

  // GRÁFICO DE PORCENTAJES
  const datosRendimiento = [
    {
      nombre: "Match Rate",
      valor: metricas.matchRate,
    },
    {
      nombre: "Liquidez",
      valor: metricas.liquidity,
    },
    {
      nombre: "Conversión",
      valor: metricas.conversionRegistro,
    },
    {
      nombre: "Activación",
      valor: metricas.activationRate,
    },
    {
      nombre: "Abandono",
      valor: abandono.tasaAbandono,
    },
  ];

  // GRÁFICO DE ABANDONO
  const datosAbandono = [
    {
      nombre: "Completadas",
      valor: abandono.totalCompletados || 0,
    },
    {
      nombre: "Abandonadas",
      valor: abandono.totalAbandonados || 0,
    },
  ];

  // TIEMPO MEDIO DE ACEPTACIÓN
  const datosTiempo = [
    {
      nombre: "Tiempo medio",
      minutos: metricas.timeToMatchMinutos ?? 0,
    },
  ];

  // RELACIÓN CLIENTES / TÉCNICOS
  const datosRatio = [
    {
      nombre: "Clientes por técnico",
      valor: metricas.ratioClientesTecnicos ?? 0,
    },
  ];

  // USUARIOS ACTIVOS
  const datosDau = [
    {
      nombre: "Usuarios activos",
      valor: metricas.dau ?? 0,
    },
  ];

  const coloresAbandono = ["#10B981", "#F26B4D"];

  const mostrarValor = (valor, sufijo = "") => {
    return valor !== null && valor !== undefined
      ? `${valor}${sufijo}`
      : "Sin datos";
  };

  // CONTENEDOR REUTILIZABLE PARA LOS GRÁFICOS
  const GraficoCard = ({ titulo, descripcion, children }) => (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-[#08284F]">
        {titulo}
      </h3>

      <p className="mt-1 text-sm text-slate-400">
        {descripcion}
      </p>

      <div className="mt-5 h-64 w-full">
        {children}
      </div>
    </article>
  );

  return (
    <section className="mt-12">

      {/* ENCABEZADO */}
      <div className="mb-6">
        <span className="text-sm font-semibold uppercase tracking-wider text-[#F26B4D]">
          Estadísticas
        </span>

        <h2 className="mt-2 text-2xl font-bold text-[#08284F]">
          Indicadores y estadísticas de UrbanFix
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Análisis del funcionamiento y actividad de la plataforma.
        </p>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* RENDIMIENTO */}
        <GraficoCard
          titulo="Rendimiento de la plataforma"
          descripcion="Indicadores porcentuales de UrbanFix."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={datosRendimiento}
              margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="nombre"
                tick={{ fontSize: 11 }}
                interval={0}
              />

              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                unit="%"
              />

              <Tooltip
                formatter={(value) =>
                  value !== null ? `${value}%` : "Sin datos"
                }
              />

              <Bar
                dataKey="valor"
                fill="#F26B4D"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </GraficoCard>

        {/* ABANDONO */}
        <GraficoCard
          titulo="Abandono de solicitudes"
          descripcion="Comparación entre formularios completados y abandonados."
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={datosAbandono}
                dataKey="valor"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={48}
                paddingAngle={4}
                label={({ nombre, percent }) =>
                  `${nombre} ${(percent * 100).toFixed(0)}%`
                }
              >
                {datosAbandono.map((entrada, index) => (
                  <Cell
                    key={entrada.nombre}
                    fill={coloresAbandono[index]}
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </GraficoCard>

        {/* TIEMPO MEDIO */}
        <GraficoCard
          titulo="Tiempo medio de aceptación"
          descripcion="Minutos promedio que tarda una solicitud en ser aceptada."
        >
          <div className="flex h-full flex-col justify-center">
            <ResponsiveContainer width="100%" height="75%">
              <BarChart data={datosTiempo}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis dataKey="nombre" />

                <YAxis tick={{ fontSize: 12 }} />

                <Tooltip
                  formatter={(value) => [`${value} minutos`, "Tiempo"]}
                />

                <Bar
                  dataKey="minutos"
                  fill="#3B82F6"
                  radius={[8, 8, 0, 0]}
                  barSize={65}
                />
              </BarChart>
            </ResponsiveContainer>

            <p className="text-center text-sm font-semibold text-slate-500">
              {mostrarValor(metricas.timeToMatchMinutos, " minutos")}
            </p>
          </div>
        </GraficoCard>

        {/* RATIO CLIENTES Y TÉCNICOS */}
        <GraficoCard
          titulo="Relación clientes / técnicos"
          descripcion="Cantidad de clientes por cada técnico registrado."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosRatio}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis dataKey="nombre" />

              <YAxis tick={{ fontSize: 12 }} />

              <Tooltip
                formatter={(value) => [value, "Relación"]}
              />

              <Bar
                dataKey="valor"
                fill="#8B5CF6"
                radius={[8, 8, 0, 0]}
                barSize={65}
              />
            </BarChart>
          </ResponsiveContainer>
        </GraficoCard>

        {/* USUARIOS ACTIVOS */}
        <GraficoCard
          titulo="Usuarios activos diarios (DAU)"
          descripcion="Usuarios que iniciaron sesión durante el día actual."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosDau}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis dataKey="nombre" />

              <YAxis allowDecimals={false} />

              <Tooltip
                formatter={(value) => [value, "Usuarios"]}
              />

              <Bar
                dataKey="valor"
                fill="#10B981"
                radius={[8, 8, 0, 0]}
                barSize={65}
              />
            </BarChart>
          </ResponsiveContainer>
        </GraficoCard>

      </div>

      {/* RESUMEN DE ABANDONO */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total de intentos</p>
          <p className="mt-2 text-3xl font-bold text-[#08284F]">
            {abandono.totalIntentos ?? 0}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Solicitudes completadas</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {abandono.totalCompletados ?? 0}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Solicitudes abandonadas</p>
          <p className="mt-2 text-3xl font-bold text-[#F26B4D]">
            {abandono.totalAbandonados ?? 0}
          </p>
        </div>

      </div>

    </section>
  );
};

export default DashboardMetricas;
