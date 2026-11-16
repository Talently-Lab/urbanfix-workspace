
import { useEffect, useState } from "react";
import api from "../../Services/api.js";
import { useTecnico } from "../../context/TecnicoContext";
import SolicitudesDisponibles from "../Tecnico/SolicitudesDisponibles";
import SolicitudesAceptadas from "../Tecnico/SolicitudesAceptadas";

function Dashboard() {
  const [vista, setVista] = useState("disponibles");

  const [serviciosTecnico, setServiciosTecnico] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState("TODOS");
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [errorServicios, setErrorServicios] = useState("");

  const {
    solicitudesPendientes = [],
    misTrabajos = [],
  } = useTecnico();

  useEffect(() => {
    const obtenerServicios = async () => {
      try {
        const respuesta = await api.get("/tecnicos/me/servicios");

        setServiciosTecnico(
          Array.isArray(respuesta.data?.servicios)
            ? respuesta.data.servicios
            : []
        );
      } catch (error) {
        console.error("Error al obtener servicios del técnico:", error);
        setErrorServicios("No se pudieron cargar tus servicios.");
      } finally {
        setCargandoServicios(false);
      }
    };

    obtenerServicios();
  }, []);

  // Comprueba si una solicitud o trabajo pertenece al servicio seleccionado.
  const coincideServicio = (item) => {
    if (servicioSeleccionado === "TODOS") {
      return true;
    }

    const servicioElegido = serviciosTecnico.find(
      (servicio) =>
        String(servicio.idServicio) === String(servicioSeleccionado)
    );

    const idServicio =
      item.idServicio ??
      item.servicio?.idServicio ??
      item.servicioId ??
      item.servicio?.id;

    // Primero se compara por identificador.
    if (idServicio != null) {
      return String(idServicio) === String(servicioSeleccionado);
    }

    // Si el backend no envía el ID, se compara por nombre.
    const nombreServicio =
      item.servicio?.nombreServicio ??
      item.nombreServicio ??
      item.categoria;

    if (!nombreServicio || !servicioElegido?.nombreServicio) {
      return false;
    }

    return (
      nombreServicio.trim().toLowerCase() ===
      servicioElegido.nombreServicio.trim().toLowerCase()
    );
  };

  const solicitudesFiltradas = solicitudesPendientes.filter(coincideServicio);
  const trabajosFiltrados = misTrabajos.filter(coincideServicio);

  const botones = [
    {
      id: "disponibles",
      titulo: "Solicitudes disponibles",
      cantidad: solicitudesFiltradas.length,
    },
    {
      id: "trabajos",
      titulo: "Mis trabajos",
      cantidad: trabajosFiltrados.length,
    },
  ];

  return (
    <main className="min-h-screen bg-urban-fondo px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* Encabezado */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-urban-secundario">
              UrbanFix · Panel profesional
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-urban-principal sm:text-4xl">
              Panel del técnico
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-urban-texto-secundario sm:text-base">
              Gestioná tus solicitudes, organizá tus trabajos y
              actualizá su progreso desde un solo lugar.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-urban-fondo text-xl">
              🛠️
            </span>

            <div>
              <p className="text-sm font-bold text-urban-principal">
                Área de trabajo
              </p>
              <p className="mt-1 text-xs text-urban-texto-secundario">
                Gestión de servicios
              </p>
            </div>
          </div>
        </header>

        {/* Navegación */}
        <nav
          aria-label="Secciones del panel"
          className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row"
        >
          {botones.map((boton) => {
            const activo = vista === boton.id;

            return (
              <button
                key={boton.id}
                type="button"
                onClick={() => setVista(boton.id)}
                aria-current={activo ? "page" : undefined}
                className={`flex flex-1 items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  activo
                    ? "bg-urban-principal text-white shadow-sm"
                    : "text-urban-texto-secundario hover:bg-urban-fondo hover:text-urban-principal"
                }`}
              >
                <span>{boton.titulo}</span>

                <span
                  className={`rounded-lg px-2.5 py-1 text-xs ${
                    activo
                      ? "bg-white/15 text-white"
                      : "bg-urban-fondo text-urban-principal"
                  }`}
                >
                  {boton.cantidad}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Filtro por servicio */}
        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-urban-principal">
              Filtrar por servicio
            </h2>

            <p className="mt-1 text-xs text-urban-texto-secundario">
              Seleccioná uno de los servicios que tenés asignados.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <select
              value={servicioSeleccionado}
              onChange={(e) => setServicioSeleccionado(e.target.value)}
              disabled={cargandoServicios || serviciosTecnico.length === 0}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-urban-principal outline-none transition focus:border-urban-button disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="TODOS">Todos mis servicios</option>

              {serviciosTecnico.map((servicio) => (
                <option
                  key={servicio.idServicio}
                  value={String(servicio.idServicio)}
                >
                  {servicio.nombreServicio}
                </option>
              ))}
            </select>

            {cargandoServicios && (
              <p className="mt-1 text-xs text-urban-texto-secundario">
                Cargando servicios...
              </p>
            )}

            {errorServicios && (
              <p className="mt-1 text-xs text-red-600">
                {errorServicios}
              </p>
            )}

            {!cargandoServicios &&
              !errorServicios &&
              serviciosTecnico.length === 0 && (
                <p className="mt-1 text-xs text-urban-texto-secundario">
                  No tenés servicios asignados.
                </p>
              )}
          </div>
        </section>

        {/* Contenido de la pestaña */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
          {vista === "disponibles" ? (
            <SolicitudesDisponibles
              servicioSeleccionado={servicioSeleccionado}
              serviciosTecnico={serviciosTecnico}
            />
          ) : (
            <SolicitudesAceptadas
              servicioSeleccionado={servicioSeleccionado}
              serviciosTecnico={serviciosTecnico}
            />
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
