import { Route, Routes } from 'react-router-dom'

//Paginas Utilizadas
import Technician from './pages/Technician'
import Login from './pages/Login'
import Client from './pages/Client'
import Admin from './pages/Admin'
import ProtectedRoute from './Components/ProtectedRoute'
import CrearSolicitud from './pages/Cliente/CrearSolicitud'
import Dashboard from './pages/Tecnico/Dashboard'
function App() {
  return (
      <Routes>
        <Route path='*' element={<Login></Login>}/>
        <Route path="/Client" element={ <ProtectedRoute allowedRole="client"><Client /> </ProtectedRoute>}/>
        <Route path="/Admin" element={ <ProtectedRoute allowedRole="admin"> <Admin /> </ProtectedRoute>}/>
        <Route path='Client/solicitud' element={<ProtectedRoute allowedRole="client"><CrearSolicitud/></ProtectedRoute>}/>
        <Route path='Technician/dashboard' element={<ProtectedRoute allowedRole="technician"><Dashboard /></ProtectedRoute>}/>
      </Routes>

  )
}

export default App
