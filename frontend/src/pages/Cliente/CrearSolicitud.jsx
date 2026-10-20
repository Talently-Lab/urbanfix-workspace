

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function CrearSolicitud() {
  const navigate = useNavigate();

  // Reemplazar los IDs por los que existan en la tabla Servicio
  const servicios = [
    { idServicio: 1, nombreServicio: "Plomería" },
    { idServicio: 2, nombreServicio: "Gas" },
    { idServicio: 3, nombreServicio: "Electricidad" },
    { idServicio: 4, nombreServicio: "Informática" },
    { idServicio: 5, nombreServicio: "Otros" },
  ];

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    idServicio: "",
    direccion: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.titulo.trim() ||
      !form.descripcion.trim() ||
      !form.idServicio ||
      !form.direccion.trim()
    ) {
      setError("Completá todos los campos.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/solicitudes", {
        detalle: `${form.titulo.trim()}\n${form.descripcion.trim()}\nDirección: ${form.direccion.trim()}`,
        idServicio: Number(form.idServicio),
      });

      navigate("/Client", {
        state: {
          success: "¡Solicitud creada exitosamente!",
        },
      });
    } catch (err) {
      console.error(
        "Error al crear solicitud:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.error ||
        "Error al crear la solicitud."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-gray-900">
        Formulario de solicitud
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-xl bg-urban-fondo p-6 shadow-md"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="titulo" className="text-sm font-semibold text-white">
            Título
          </label>
          <input
            id="titulo"
            type="text"
            required
            placeholder="Rotura de caño"
            value={form.titulo}
            onChange={(e) =>
              setForm({ ...form, titulo: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="idServicio" className="text-sm font-semibold text-white">
            Categoría solicitada
          </label>
          <select
            id="idServicio"
            required
            value={form.idServicio}
            onChange={(e) =>
              setForm({ ...form, idServicio: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800"
          >
            <option value="">Seleccioná un servicio</option>
            {servicios.map((servicio) => (
              <option
                key={servicio.idServicio}
                value={servicio.idServicio}
              >
                {servicio.nombreServicio}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="descripcion" className="text-sm font-semibold text-white">
            Descripción del problema
          </label>
          <textarea
            id="descripcion"
            rows={4}
            required
            placeholder="Describí el problema con el mayor detalle posible..."
            value={form.descripcion}
            onChange={(e) =>
              setForm({ ...form, descripcion: e.target.value })
            }
            className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="direccion" className="text-sm font-semibold text-white">
            Dirección
          </label>
          <input
            id="direccion"
            type="text"
            required
            placeholder="Ingresá la dirección del domicilio"
            value={form.direccion}
            onChange={(e) =>
              setForm({ ...form, direccion: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800"
          />
        </div>

        {error && (
          <p className="text-sm font-semibold text-red-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-urban-button px-4 py-3 font-bold text-white disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Crear solicitud"}
        </button>
      </form>
    </div>
  );
}

export default CrearSolicitud;
