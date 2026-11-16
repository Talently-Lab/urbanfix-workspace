
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
  Legend,
} from "recharts";

import api from "../../Services/api.js";

const COLORES = ["#F26B4D", "#08284F", "#10B981", "#8B5CF6", "#3B82F6"];

// OBTENER ARRAYS DE LAS RESPUESTAS
const obtenerLista = (data, propiedad) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[propiedad])) return data[propiedad];
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

// OBTENER ID DEL SERVICIO DE UNA SOLICITUD
const obtenerIdServicio = (solicitud) => {
  return (
    solicitud.idServicio ??
    solicitud.servicioId ??
    solicitud.servicio?.idServicio ??
    solicitud.servicio?.id ??
    solicitud.id_servicio
  );
};

// CARD DE INDICADORES
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
          {valor !== null && valor !== undefined
            ? `${valor}${sufijo}`
            : "Sin datos"}
        </p>
      </div>

      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
        style={{ backgroundColor: `${color}15` }}
      >
        {icono}
      </div>
    </div>

    <p className="mt-4 text-sm text-slate-500">
      {descripcion}
    </p>
  </article>
);

// CONTENEDOR DE GRÁFICOS
const GraficoCard = ({ titulo, descripcion, children }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="text-lg font-bold text-[#08284F]">
      {titulo}
    </h3>

    <p className="mt-1 text-sm text-slate-400">
      {descripcion}
    </p>

    <div className="mt-5 h-72 w-full">
      {children}
    </div>
  </article>
);

const DashboardMetricas = () => {
  const [metricas, setMetricas] = useState(null);
  const [datosSolicitudesServicio, setDatosSolicitudesServicio] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        setLoading(true);
        setError("");

        // CONSULTAR LAS TRES RUTAS
        const resultados = await Promise.allSettled([
          api.get("/admin/metricas"),
          api.get("/solicitudes"),
          api.get("/servicios"),
        ]);

        // MÉTRICAS
        if (resultados[0].status === "rejected") {
          throw resultados[0].reason;
        }

        const metricasBack = resultados[0].value.data.metricas;

        if (!metricasBack) {
          throw new Error("El backend no devolvió las métricas.");
        }

        setMetricas(metricasBack);

        // SOLICITUDES
        const solicitudes =
          resultados[1].status === "fulfilled"
            ? obtenerLista(
                resultados[1].value.data,
                "solicitudes"
              )
            : [];

        // SERVICIOS
        const servicios =
          resultados[2].status === "fulfilled"
            ? obtenerLista(
                resultados[2].value.data,
                "servicios"
              )
            : [];

        console.log("MÉTRICAS:", metricasBack);
        console.log("SOLICITUDES:", solicitudes);
        console.log("SERVICIOS:", servicios);

        // AGRUPAR SOLICITUDES POR SERVICIO
        const conteo = {};

        // Inicializar todos los servicios en cero
        servicios.forEach((servicio) => {
          const id = servicio.idServicio ?? servicio.id;

          conteo[String(id)] = {
            nombre: servicio.nombreServicio ?? servicio.nombre,
            cantidad: 0,
          };
        });

        // Contar solicitudes
        solicitudes.forEach((solicitud) => {
          const idServicio = obtenerIdServicio(solicitud);

          if (idServicio === undefined || idServicio === null) {
            return;
          }

          const clave = String(idServicio);

          if (!conteo[clave]) {
            conteo[clave] = {
              nombre:
                solicitud.servicio?.nombreServicio ??
                `Servicio ${idServicio}`,
              cantidad: 0,
            };
          }

          conteo[clave].cantidad += 1;
        });

        const resultadoServicios = Object.values(conteo);

        setDatosSolicitudesServicio(resultadoServicios);

        console.log(
          "SOLICITUDES POR SERVICIO:",
          resultadoServicios
        );

      } catch (error) {
        console.error("Error al obtener métricas:", error);
        setError("No se pudieron cargar las métricas.");
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
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

  // GRÁFICO DE RENDIMIENTO
  const datosRendimiento = [
    { nombre: "Match Rate", valor: metricas.matchRate },
    { nombre: "Liquidez", valor: metricas.liquidity },
    { nombre: "Conversión", valor: metricas.conversionRegistro },
    { nombre: "Activación", valor: metricas.activationRate },
  ].filter(
    (item) =>
      item.valor !== null &&
      item.valor !== undefined &&
      Number.isFinite(Number(item.valor))
  );

  // GRÁFICO CIRCULAR DE SOLICITUDES
  const datosEstadoSolicitudes = [
    {
      nombre: "Completadas",
      cantidad: Number(abandono.totalCompletados) || 0,
    },
    {
      nombre: "Abandonadas",
      cantidad: Number(abandono.totalAbandonados) || 0,
    },
  ];

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

      {/* INDICADORES */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">

        <IndicadorCard
          titulo="Tasa de aceptación"
          valor={metricas.matchRate}
          sufijo="%"
          descripcion="Porcentaje de solicitudes que consiguieron un técnico."
          icono="📈"
          color="#10B981"
        />

        <IndicadorCard
          titulo="Relación clientes / técnicos"
          valor={metricas.ratioClientesTecnicos}
          descripcion="Cantidad promedio de clientes por técnico registrado."
          icono="👥"
          color="#8B5CF6"
        />

        <IndicadorCard
          titulo="Tiempo medio de aceptación"
          valor={metricas.timeToMatchMinutos}
          sufijo=" min"
          descripcion="Tiempo promedio para que un técnico acepte una solicitud."
          icono="⏱️"
          color="#3B82F6"
        />

        <IndicadorCard
          titulo="Tasa de abandono"
          valor={abandono.tasaAbandono}
          sufijo="%"
          descripcion="Porcentaje de solicitudes que no llegaron a completarse."
          icono="⚠️"
          color="#F26B4D"
        />

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
              layout="vertical"
              margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
              />

              <XAxis
                type="number"
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 11 }}
              />

              <YAxis
                type="category"
                dataKey="nombre"
                width={105}
                tick={{ fontSize: 11 }}
              />

              <Tooltip
                formatter={(value) => [`${value}%`, "Valor"]}
              />

              <Bar
                dataKey="valor"
                fill="#F26B4D"
                radius={[0, 6, 6, 0]}
                barSize={25}
              />
            </BarChart>
          </ResponsiveContainer>
        </GraficoCard>


        {/* SOLICITUDES COMPLETADAS Y ABANDONADAS */}
        <GraficoCard
          titulo="Estado de las solicitudes"
          descripcion="Comparación entre solicitudes completadas y abandonadas."
        >
          {datosEstadoSolicitudes.some((item) => item.cantidad > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosEstadoSolicitudes}
                  dataKey="cantidad"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={55}
                  paddingAngle={4}
                  label={({ percent }) =>
                    `${(percent * 100).toFixed(0)}%`
                  }
                >
                  {datosEstadoSolicitudes.map((entry, index) => (
                    <Cell
                      key={entry.nombre}
                      fill={index === 0 ? "#10B981" : "#F26B4D"}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => [
                    `${value} solicitudes`,
                    "Cantidad",
                  ]}
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No hay datos disponibles.
            </div>
          )}
        </GraficoCard>

      </div>

      {/* RESUMEN DE SOLICITUDES */}
      <div className="mt-8">

        <h3 className="mb-4 text-lg font-bold text-[#08284F]">
          Resumen de solicitudes
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

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

          <IndicadorCard
            titulo="Usuarios activos diarios"
            valor={metricas.dau ?? 0}
            descripcion="Usuarios activos durante el día."
            icono="👤"
            color="#3B82F6"
          />

        </div>
      </div>

    </section>
  );
};

export default DashboardMetricas;
