import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../Services/api.js";

const obtenerLista = (data, propiedad) => {
  if (Array.isArray(data)) return data;
  return data?.[propiedad] || [];
};

// COLORES SEGÚN EL ESTADO
const obtenerEstiloEstado = (estado) => {
  const estilos = {
    PENDIENTE: "bg-amber-100 text-amber-700 border-amber-200",
    ACEPTADA: "bg-blue-100 text-blue-700 border-blue-200",
    EN_PROGRESO: "bg-purple-100 text-purple-700 border-purple-200",
    COMPLETADA: "bg-emerald-100 text-emerald-700 border-emerald-200",
    RECHAZADA: "bg-red-100 text-red-700 border-red-200",
    CANCELADA: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    estilos[estado?.toUpperCase()] ||
    "bg-gray-100 text-gray-600 border-gray-200"
  );
};

const DashboardListado = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tipo = searchParams.get("tipo") || "usuarios";

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  const configuracion = {
    clientes: {
      titulo: "Listado de clientes",
      subtitulo: "Todos los clientes registrados en UrbanFix.",
    },
    tecnicos: {
      titulo: "Listado de técnicos",
      subtitulo: "Todos los profesionales registrados.",
    },
    usuarios: {
      titulo: "Listado de usuarios",
      subtitulo: "Todos los usuarios registrados en UrbanFix.",
    },
    solicitudes: {
      titulo: "Listado de solicitudes",
      subtitulo: "Todas las solicitudes registradas.",
    },
  };

  const esSolicitud = tipo === "solicitudes";
  const titulo = configuracion[tipo] || configuracion.usuarios;

  // CARGAR DATOS
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          esSolicitud ? "/admin/solicitudes" : "/admin/usuarios"
        );

        let lista = obtenerLista(
          response.data,
          esSolicitud ? "solicitudes" : "usuarios"
        );

        if (tipo === "clientes") {
          lista = lista.filter(
            (u) => u.rol?.toUpperCase() === "CLIENTE"
          );
        }

        if (tipo === "tecnicos") {
          lista = lista.filter(
            (u) => u.rol?.toUpperCase() === "TECNICO"
          );
        }

        setDatos(lista);
      } catch (error) {
        console.error("Error al obtener listado:", error);
        setError("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    if (configuracion[tipo]) {
      cargarDatos();
    } else {
      setDatos([]);
      setError("El tipo de listado no es válido.");
      setLoading(false);
    }
  }, [tipo, esSolicitud]);

  // COLUMNAS DE USUARIOS
  const columnasUsuarios = [
    { titulo: "ID", valor: (u) => u.idUsuario ?? u.id },
    { titulo: "Nombre", valor: (u) => u.nombre },
    { titulo: "Apellido", valor: (u) => u.apellido },
    { titulo: "Email", valor: (u) => u.email },
    { titulo: "Teléfono", valor: (u) => u.numeroTelefono },
    { titulo: "Rol", valor: (u) => u.rol },
  ];

  // COLUMNAS DE SOLICITUDES
  const columnasSolicitudes = [
    { titulo: "ID", valor: (s) => s.idSolicitud ?? s.id },
    { titulo: "Detalle", valor: (s) => s.detalle },
    {
      titulo: "Servicio",
      valor: (s) =>
        s.servicio?.nombreServicio ?? s.nombreServicio,
    },
    { titulo: "Estado", valor: (s) => s.estado },
    { titulo: "Dirección", valor: (s) => s.direccion },
  ];

  const columnas = esSolicitud
    ? columnasSolicitudes
    : columnasUsuarios;

  // FILTRAR POR ESTADO
  const datosFiltrados = esSolicitud
    ? datos.filter((solicitud) => {
        if (filtroEstado === "TODOS") return true;

        return (
          solicitud.estado?.toUpperCase() === filtroEstado
        );
      })
    : datos;

  return (
    <main className="min-h-screen bg-[#F1F6FA] p-4 md:p-8">

      {/* ENCABEZADO */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/ADMINISTRADOR/dashboard")}
          className="mb-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#08284F] shadow-sm transition hover:bg-slate-100"
        >
          ← Volver al dashboard
        </button>

        <span className="block text-xs font-semibold uppercase tracking-wider text-[#F26B4D]">
          Administración / Listados
        </span>

        <h1 className="mt-2 text-2xl font-bold text-[#08284F] md:text-3xl">
          {titulo.titulo}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {titulo.subtitulo}
        </p>
      </div>

      {/* TABLA */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* FILTRO DE ESTADO */}
        {esSolicitud && (
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">

            <label
              htmlFor="filtroEstado"
              className="text-xs font-semibold text-[#08284F]"
            >
              Filtrar por estado:
            </label>

            <select
              id="filtroEstado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="rounded-lg border border-slate-200 bg-[#F1F6FA] px-3 py-2 text-xs font-medium text-[#08284F] outline-none focus:border-[#F26B4D]"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ACEPTADA">Aceptada</option>
              <option value="EN_PROGRESO">En progreso</option>
              <option value="COMPLETADA">Completada</option>
              <option value="RECHAZADA">Rechazada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>

            <span className="text-xs text-slate-500">
              {datosFiltrados.length} solicitudes encontradas
            </span>
          </div>
        )}

        {/* ENCABEZADO DE REGISTROS */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-[#08284F]">
            Registros
          </h2>

          <span className="rounded-full bg-[#F1F6FA] px-3 py-1 text-xs font-semibold text-[#08284F]">
            {loading
              ? "Cargando..."
              : `${datosFiltrados.length} registros`}
          </span>
        </div>

        {/* ESTADOS DE LA TABLA */}
        {loading ? (
          <div className="p-6 text-center text-sm text-slate-500">
            Cargando información...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-500">
            {error}
          </div>
        ) : datosFiltrados.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">
            {esSolicitud && filtroEstado !== "TODOS"
              ? "No hay solicitudes con el estado seleccionado."
              : "No hay registros para mostrar."}
          </div>
        ) : (

          /* TABLA CON SCROLL */
          <div className="max-h-[650px] overflow-auto">

            <table className="w-full text-left text-xs">

              {/* ENCABEZADOS */}
              <thead className="sticky top-0 z-10 bg-[#08284F] text-white">
                <tr>
                  {columnas.map((columna) => (
                    <th
                      key={columna.titulo}
                      className="whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide"
                    >
                      {columna.titulo}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* FILAS */}
              <tbody className="divide-y divide-slate-100">

                {datosFiltrados.map((registro, index) => (
                  <tr
                    key={
                      registro.idUsuario ??
                      registro.idSolicitud ??
                      registro.id ??
                      index
                    }
                    className="transition hover:bg-[#F1F6FA]"
                  >
                    {columnas.map((columna) => {
                      const valor = columna.valor(registro);

                      return (
                        <td
                          key={columna.titulo}
                          className="max-w-[220px] truncate whitespace-nowrap px-3 py-2 text-xs text-slate-600"
                          title={String(valor ?? "—")}
                        >
                          {esSolicitud && columna.titulo === "Estado" ? (
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                                obtenerEstiloEstado(valor)
                              }`}
                            >
                              {String(valor ?? "SIN ESTADO").replaceAll("_", " ")}
                            </span>
                          ) : (
                            valor ?? "—"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}
      </section>

    </main>
  );
};

export default DashboardListado;
