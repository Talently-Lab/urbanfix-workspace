
import { useState } from "react";
import { useTecnico } from "../../context/TecnicoContext";
import SolicitudesDisponibles from "../Tecnico/SolicitudesDisponibles";
import SolicitudesAceptadas from "../Tecnico/SolicitudesAceptadas";

function Dashboard() {
  const [vista, setVista] = useState("disponibles");

  const {
    solicitudesPendientes = [],
    misTrabajos = [],
  } = useTecnico();

  const botones = [
    {
      id: "disponibles",
      titulo: "Solicitudes disponibles",
      cantidad: solicitudesPendientes.length,
    },
    {
      id: "trabajos",
      titulo: "Mis trabajos",
      cantidad: misTrabajos.length,
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

        {/* Resumen */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setVista("disponibles")}
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
              vista === "disponibles"
                ? "border-urban-button ring-2 ring-urban-button/10"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-urban-texto-secundario">
                  Solicitudes disponibles
                </p>

                <p className="mt-2 text-3xl font-extrabold text-urban-principal">
                  {solicitudesPendientes.length}
                </p>

                <p className="mt-2 text-xs text-urban-texto-secundario">
                  Trabajos que podés revisar
                </p>
              </div>

              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-xl">
                📋
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setVista("trabajos")}
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
              vista === "trabajos"
                ? "border-urban-button ring-2 ring-urban-button/10"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-urban-texto-secundario">
                  Mis trabajos
                </p>

                <p className="mt-2 text-3xl font-extrabold text-urban-principal">
                  {misTrabajos.length}
                </p>

                <p className="mt-2 text-xs text-urban-texto-secundario">
                  Trabajos asignados a vos
                </p>
              </div>

              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
                🧰
              </span>
            </div>
          </button>
        </section>

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

        {/* Contenido de la pestaña */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
          {vista === "disponibles" ? (
            <SolicitudesDisponibles />
          ) : (
            <SolicitudesAceptadas />
          )}
        </section>

        <footer className="pb-2 text-center text-xs text-urban-texto-secundario">
          UrbanFix · Panel de gestión de servicios
        </footer>
      </div>
    </main>
  );
}

export default Dashboard;
