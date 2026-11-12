import { Route, Routes } from 'react-router-dom';

import Technician from './pages/Technician';
import Login from './pages/Login';
import Client from './pages/Client';
import Admin from './pages/Admin';
import ProtectedRoute from './Components/ProtectedRoute';
import CrearSolicitud from './pages/Cliente/CrearSolicitud';
import Dashboard from './pages/Tecnico/Dashboard';
import Home from './pages/Home';
import Header from './Components/Header';
import MostrarTecnicos from './Components/MostrarTecnicos';
import Register from './pages/Register';
import SolicitudCardDetalle from './pages/Cliente/SolicitudCardDetalle';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div>
      <section>
        <Header />
      </section>
      <section>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/Home' element={<Home />} />
          <Route path='/Login' element={<Login />} />
          <Route path='/Register' element={<Register />} />
          <Route path='/Client' element={<ProtectedRoute allowedRole='CLIENTE'><Client /></ProtectedRoute>} />
          <Route path='/Client/dashboard' element={<ProtectedRoute allowedRole='CLIENTE'><Client /></ProtectedRoute>} />
          <Route path='/Client/solicitud' element={<ProtectedRoute allowedRole='CLIENTE'><CrearSolicitud /></ProtectedRoute>} />
          <Route path='/Client/solicitud/:id' element={<ProtectedRoute allowedRole='CLIENTE'><SolicitudCardDetalle /></ProtectedRoute>} />
          <Route path='/Client/servicio/:servicio' element={<ProtectedRoute allowedRole='CLIENTE'><MostrarTecnicos /></ProtectedRoute>} />
          <Route path='/Admin' element={<ProtectedRoute allowedRole='ADMINISTRADOR'><Admin /></ProtectedRoute>} />
          <Route path='/Technician' element={<ProtectedRoute allowedRole='TECNICO'><Dashboard /></ProtectedRoute>} />
          <Route path='/Technician/dashboard' element={<ProtectedRoute allowedRole='TECNICO'><Dashboard /></ProtectedRoute>} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </section>
    </div>
  );
}

export default App;