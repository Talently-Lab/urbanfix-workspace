
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

  // DATOS DEL GRÁFICO DE RENDIMIENTO
  const datosRendimiento = [
    { nombre: "Match Rate", valor: metricas.matchRate },
    { nombre: "Liquidez", valor: metricas.liquidity },
    { nombre: "Conversión", valor: metricas.conversionRegistro },
    { nombre: "Activación", valor: metricas.activationRate },
    { nombre: "Abandono", valor: abandono.tasaAbandono },
  ];

  const mostrarValor = (valor, sufijo = "") => {
    return valor !== null && valor !== undefined
      ? `${valor}${sufijo}`
      : "Sin datos";
  };

  // CARD REUTILIZABLE PARA INDICADORES
  const IndicadorCard = ({
    titulo,
    valor,
    descripcion,
    icono,
    color = "#08284F",
    sufijo = "",
  }) => (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {titulo}
          </p>

          <p
            className="mt-3 text-4xl font-extrabold"
            style={{ color }}
          >
            {mostrarValor(valor, sufijo)}
          </p>
        </div>

        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
          style={{
            backgroundColor: `${color}15`,
          }}
        >
          {icono}
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {descripcion}
      </p>
    </article>
  );

  // CONTENEDOR PARA GRÁFICOS
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

      {/* INDICADORES EN CARDS */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">

        {/* TASA DE ACEPTACIÓN */}
        <IndicadorCard
          titulo="Tasa de aceptación"
          valor={metricas.acceptanceRate}
          sufijo="%"
          descripcion="Porcentaje de solicitudes que fueron aceptadas por los técnicos."
          icono="📈"
          color="#10B981"
        />

        {/* RELACIÓN CLIENTES / TÉCNICOS */}
        <IndicadorCard
          titulo="Relación clientes / técnicos"
          valor={metricas.ratioClientesTecnicos}
          descripcion="Cantidad promedio de clientes por cada técnico registrado."
          icono="👥"
          color="#8B5CF6"
        />

        {/* TIEMPO MEDIO DE ACEPTACIÓN */}
        <IndicadorCard
          titulo="Tiempo medio de aceptación"
          valor={metricas.timeToMatchMinutos}
          sufijo=" min"
          descripcion="Tiempo promedio que tarda un técnico en aceptar una solicitud."
          icono="⏱️"
          color="#3B82F6"
        />

        {/* TASA DE ABANDONO */}
        <IndicadorCard
          titulo="Tasa de abandono"
          valor={abandono.tasaAbandono}
          sufijo="%"
          descripcion="Porcentaje de solicitudes iniciadas que no llegaron a completarse."
          icono="⚠️"
          color="#F26B4D"
        />

      </div>

      {/* GRÁFICO DE RENDIMIENTO */}
      <div className="grid grid-cols-1 gap-6">

        <GraficoCard
          titulo="Rendimiento de la plataforma"
          descripcion="Indicadores porcentuales de UrbanFix."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={datosRendimiento}
              margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

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

      </div>

      {/* RESUMEN DE ABANDONO */}
      <div className="mt-6">

        <h3 className="mb-4 text-lg font-bold text-[#08284F]">
          Resumen de solicitudes
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <IndicadorCard
            titulo="Total de intentos"
            valor={abandono.totalIntentos ?? 0}
            descripcion="Total de formularios iniciados."
            icono="📋"
          />

          <IndicadorCard
            titulo="Solicitudes completadas"
            valor={abandono.totalCompletados ?? 0}
            descripcion="Solicitudes que finalizaron correctamente."
            icono="✅"
            color="#10B981"
          />

          <IndicadorCard
            titulo="Solicitudes abandonadas"
            valor={abandono.totalAbandonados ?? 0}
            descripcion="Solicitudes que no llegaron a completarse."
            icono="⚠️"
            color="#F26B4D"
          />

        </div>
      </div>

    </section>
  );
};

export default DashboardMetricas;
