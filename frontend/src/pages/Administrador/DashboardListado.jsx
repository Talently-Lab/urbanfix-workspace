import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../Services/api.js";

const obtenerLista = (data, propiedad) => {
  if (Array.isArray(data)) return data;
  return data?.[propiedad] || [];
};

const DashboardListado = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tipo = searchParams.get("tipo") || "usuarios";

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const columnasUsuarios = [
    { titulo: "ID", valor: (u) => u.idUsuario ?? u.id },
    { titulo: "Nombre", valor: (u) => u.nombre },
    { titulo: "Apellido", valor: (u) => u.apellido },
    { titulo: "Email", valor: (u) => u.email },
    { titulo: "Teléfono", valor: (u) => u.numeroTelefono },
    { titulo: "Rol", valor: (u) => u.rol },
  ];

  const columnasSolicitudes = [
    { titulo: "ID", valor: (s) => s.idSolicitud ?? s.id },
    { titulo: "Detalle", valor: (s) => s.detalle },
    { titulo: "Servicio", valor: (s) => s.servicio?.nombreServicio ?? s.nombreServicio },
    { titulo: "Estado", valor: (s) => s.estado },
    { titulo: "Dirección", valor: (s) => s.direccion },
  ];

  const columnas = esSolicitud
    ? columnasSolicitudes
    : columnasUsuarios;

  return (
    <main className="min-h-screen bg-[#F1F6FA] p-6 md:p-10">

      {/* ENCABEZADO */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => navigate("/ADMINISTRADOR/dashboard")}
          className="mb-5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#08284F] shadow-sm transition hover:bg-slate-100"
        >
          ← Volver al dashboard
        </button>

        <span className="block text-sm font-semibold uppercase tracking-wider text-[#F26B4D]">
          Administración / Listados
        </span>

        <h1 className="mt-2 text-3xl font-bold text-[#08284F]">
          {titulo.titulo}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {titulo.subtitulo}
        </p>
      </div>

      {/* TABLA */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="font-semibold text-[#08284F]">
            Registros
          </h2>

          <span className="rounded-full bg-[#F1F6FA] px-3 py-1 text-sm font-semibold text-[#08284F]">
            {loading ? "Cargando..." : `${datos.length} registros`}
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Cargando información...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-500">
            {error}
          </div>
        ) : datos.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No hay registros para mostrar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-[#08284F] text-white">
                <tr>
                  {columnas.map((columna) => (
                    <th
                      key={columna.titulo}
                      className="whitespace-nowrap px-6 py-4 font-semibold"
                    >
                      {columna.titulo}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {datos.map((registro, index) => (
                  <tr
                    key={registro.idUsuario ?? registro.idSolicitud ?? registro.id ?? index}
                    className="transition hover:bg-slate-50"
                  >
                    {columnas.map((columna) => (
                      <td
                        key={columna.titulo}
                        className="whitespace-nowrap px-6 py-4 text-slate-600"
                      >
                        {columna.valor(registro) ?? "—"}
                      </td>
                    ))}
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
