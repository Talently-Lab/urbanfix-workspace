import { useEffect, useState } from 'react'
import axios from 'Axios'
import Header from '../Components/Header'
import SolicitudCard from './Cliente/SolicitudCard'
import { useAuth } from "../context/AuthContext"

function Client() {
  const { token } = useAuth();
  const [servicios, setServicios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const getServicios = async () => {
      try {
        const respuesta = await axios.get(
          'http://localhost:3001/api/servicios',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
        );

        setServicios(respuesta.data);
      } catch (error) {
        console.error(
          'Error al obtener servicios:',
          error.response?.data || error.message
        );
        setError('No se pudieron cargar los servicios.');
      }
    };

    getServicios();
  }, []);

  const serviciosFiltrados = servicios.filter((servicio) =>
    servicio.nombreServicio
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const handleSeleccionar = (servicio) => {
    setServicioSeleccionado(servicio);
    setBusqueda(servicio.nombreServicio);
  };

  const prueba = {
    titulo: 'Perdida de gas',
    estado: 'EN_PROGRESO',
    categoria: 'gas',
    descripcion: 'Empezamos a notar olor a gas en la cocina',
    direccion: 'av. siempre viva 123'
  };

  return (
    <div>
      <Header />

      <section className="bg-urban-fondo p-4">
        <h3>Servicios</h3>

        <input
          className="border bg-sky-100 text-gray-900 p-2"
          type="text"
          placeholder="¿Qué servicio necesitás?"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setServicioSeleccionado(null);
          }}
        />

        {error && <p>{error}</p>}

        {busqueda && !servicioSeleccionado && (
          <ul className="bg-white border rounded">
            {serviciosFiltrados.length > 0 ? (
              serviciosFiltrados.map((servicio) => (
                <li key={servicio.idServicio}>
                  <button
                    type="button"
                    className="w-full text-left p-2 hover:bg-sky-100"
                    onClick={() => handleSeleccionar(servicio)}
                  >
                    {servicio.nombreServicio}
                  </button>
                </li>
              ))
            ) : (
              <li className="p-2">
                No se encontraron servicios.
              </li>
            )}
          </ul>
        )}

        <button
          type="button"
          className="bg-urban-button font-bold text-sky-100 p-2 mt-2"
          disabled={!servicioSeleccionado}
          onClick={() => {
            console.log(
              'Servicio seleccionado:',
              servicioSeleccionado
            );
          }}
        >
          Solicitar visita
        </button>
      </section>

      <section>
        <h3>No tenés solicitudes todavía</h3>
        <SolicitudCard solicitud={prueba} />
      </section>

      <section>
        <h3>Técnico asignado</h3>
        <h4>Calificaciones</h4>
      </section>
    </div>
  );
}

export default Client;