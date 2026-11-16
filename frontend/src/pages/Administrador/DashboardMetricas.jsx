
import { useEffect, useState } from "react";
import api from "../../Services/api.js";

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

const COLORES = ["#10B981", "#F26B4D"];

const obtenerLista = (data, propiedad) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[propiedad])) return data[propiedad];
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const obtenerIdServicio = (solicitud) => {
  return (
    solicitud.idServicio ??
    solicitud.servicioId ??
    solicitud.servicio?.idServicio ??
    solicitud.servicio?.id ??
    solicitud.id_servicio
  );
};

// TARJETA DE INDICADORES
const IndicadorCard = ({
  titulo,
  valor,
  descripcion,
  icono,
  color = "#08284F",
  sufijo = "",
}) => (
  <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">
          {titulo}
        </p>

        <p
          className="mt-3 text-3xl font-extrabold tracking-tight"
          style={{ color }}
        >
          {valor !== null && valor !== undefined
            ? `${valor}${sufijo}`
            : "Sin datos"}
        </p>
      </div>

      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
        style={{ backgroundColor: `${color}15` }}
      >
        {icono}
      </div>
    </div>

    <p className="mt-4 text-xs leading-5 text-slate-500">
      {descripcion}
    </p>
  </article>
);

// CONTENEDOR DE GRÁFICOS
const GraficoCard = ({ titulo, descripcion, children }) => (
  <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-5">
      <h3 className="text-lg font-bold text-[#08284F]">
        {titulo}
      </h3>

      <p className="mt-1 text-sm text-slate-400">
        {descripcion}
      </p>
    </div>

    <div className="h-72 w-full min-w-0">
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

        const resultados = await Promise.allSettled([
          api.get("/admin/metricas"),
          api.get("/admin/solicitudes"),
          api.get("/servicios"),
        ]);

        if (resultados[0].status === "rejected") {
          throw resultados[0].reason;
        }

        const metricasBack = resultados[0].value.data.metricas;

        if (!metricasBack) {
          throw new Error("El backend no devolvió las métricas.");
        }

        setMetricas(metricasBack);

        const solicitudes =
          resultados[1].status === "fulfilled"
            ? obtenerLista(
                resultados[1].value.data,
                "solicitudes"
              )
            : [];

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

        servicios.forEach((servicio) => {
          const id = servicio.idServicio ?? servicio.id;

          conteo[String(id)] = {
            nombre:
              servicio.nombreServicio ?? servicio.nombre,
            cantidad: 0,
          };
        });

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

        setDatosSolicitudesServicio(Object.values(conteo));

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
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#F26B4D]" />
          <p className="font-medium text-slate-500">
            Cargando estadísticas...
          </p>
        </div>
      </section>
    );
  }

  if (error || !metricas) {
    return (
      <section className="mt-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
          {error || "No hay datos disponibles."}
        </div>
      </section>
    );
  }

  const abandono = metricas.abandonoSolicitud || {};

  // DATOS DEL GRÁFICO CIRCULAR
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
    <section className="mt-10 space-y-8">

      {/* ENCABEZADO */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#F26B4D]">
            Panel administrativo
          </span>

          <h2 className="mt-2 text-2xl font-extrabold text-[#08284F] sm:text-3xl">
            Estadísticas de UrbanFix
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Seguimiento general del funcionamiento de la plataforma.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Datos disponibles
        </div>
      </div>

      {/* INDICADORES PRINCIPALES */}
      <div>
        <h3 className="mb-4 text-base font-bold text-[#08284F]">
          Indicadores principales
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <IndicadorCard
            titulo="Tasa de aceptación"
            valor={metricas.matchRate}
            sufijo="%"
            descripcion="Porcentaje de coincidencias entre solicitudes y técnicos."
            icono="📈"
            color="#10B981"
          />

          <IndicadorCard
            titulo="Relación clientes / técnicos"
            valor={metricas.ratioClientesTecnicos}
            descripcion="Relación entre clientes y técnicos."
            icono="👥"
            color="#8B5CF6"
          />

          <IndicadorCard
            titulo="Tiempo medio de aceptación"
            valor={metricas.timeToMatchMinutos}
            sufijo=" min"
            descripcion="Tiempo promedio hasta encontrar un técnico."
            icono="⏱️"
            color="#3B82F6"
          />

          <IndicadorCard
            titulo="Tasa de abandono"
            valor={abandono.tasaAbandono}
            sufijo="%"
            descripcion="Porcentaje de los intentos de creación de solicitudes que no termina en la creación exitosa de una solicitud."
            icono="⚠️"
            color="#F26B4D"
          />

        </div>
      </div>

      {/* GRÁFICOS */}
      <div>
        <h3 className="mb-4 text-base font-bold text-[#08284F]">
          Análisis de actividad
        </h3>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* SOLICITUDES POR SERVICIO */}
          <div className="xl:col-span-2">
            <GraficoCard
              titulo="Solicitudes por servicio"
              descripcion="Cantidad de solicitudes agrupadas según el servicio solicitado."
            >
              {datosSolicitudesServicio.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={datosSolicitudesServicio}
                    margin={{
                      top: 15,
                      right: 15,
                      left: -15,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="nombre"
                      tick={{ fontSize: 12, fill: "#64748B" }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: "#64748B" }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      cursor={{ fill: "#F1F5F9" }}
                      formatter={(value) => [
                        `${value} solicitudes`,
                        "Cantidad",
                      ]}
                    />

                    <Bar
                      dataKey="cantidad"
                      name="Solicitudes"
                      fill="#F26B4D"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={55}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No hay solicitudes por servicio disponibles.
                </div>
              )}
            </GraficoCard>
          </div>

          {/* ESTADO DE SOLICITUDES */}
          <GraficoCard
            titulo="Estado de solicitudes"
            descripcion="Comparación entre intentos completados y abandonados."
          >
            {datosEstadoSolicitudes.some(
              (item) => item.cantidad > 0
            ) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosEstadoSolicitudes}
                    dataKey="cantidad"
                    nameKey="nombre"
                    cx="50%"
                    cy="45%"
                    outerRadius={85}
                    innerRadius={55}
                    paddingAngle={4}
                    label={({ percent }) =>
                      `${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {datosEstadoSolicitudes.map((entry, index) => (
                      <Cell
                        key={entry.nombre}
                        fill={COLORES[index]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => [
                      `${value} intentos`,
                      "Cantidad",
                    ]}
                  />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No hay datos disponibles.
              </div>
            )}
          </GraficoCard>

        </div>
      </div>

      {/* RESUMEN GENERAL */}
      <div>
        <h3 className="mb-4 text-base font-bold text-[#08284F]">
          Resumen general
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <IndicadorCard
            titulo="Total de intentos"
            valor={abandono.totalIntentos ?? 0}
            descripcion="Total de formularios iniciados."
            icono="📋"
            color="#08284F"
          />

          <IndicadorCard
            titulo="Solicitudes creadas"
            valor={metricas.requestCount ?? 0}
            descripcion="Cantidad de solicitudes registradas."
            icono="📝"
            color="#10B981"
          />

          <IndicadorCard
            titulo="Usuarios registrados"
            valor={metricas.registeredCount ?? 0}
            descripcion="Cantidad total de usuarios registrados."
            icono="👤"
            color="#3B82F6"
          />

          <IndicadorCard
            titulo="Usuarios activos diarios"
            valor={metricas.dau ?? 0}
            descripcion="Usuarios activos durante el día."
            icono="📊"
            color="#8B5CF6"
          />

          <IndicadorCard
            titulo="Solicitudes completadas"
            valor={abandono.totalCompletados ?? 0}
            descripcion="Intentos que finalizaron correctamente."
            icono="✅"
            color="#10B981"
          />

          <IndicadorCard
            titulo="Solicitudes abandonadas"
            valor={abandono.totalAbandonados ?? 0}
            descripcion="Intentos que no llegaron a completarse."
            icono="⚠️"
            color="#F26B4D"
          />

          <IndicadorCard
            titulo="Visitas al registro"
            valor={metricas.registrationViewsCount ?? 0}
            descripcion="Visitas registradas en la pantalla de registro."
            icono="🖥️"
            color="#3B82F6"
          />

          <IndicadorCard
            titulo="Tasa de activación"
            valor={metricas.activationRate}
            sufijo="%"
            descripcion="Indicador de activación de usuarios."
            icono="🚀"
            color="#8B5CF6"
          />

        </div>
      </div>

    </section>
  );
};

export default DashboardMetricas;
