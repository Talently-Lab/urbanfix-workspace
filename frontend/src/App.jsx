import { Route, Routes } from 'react-router-dom'

//Paginas Utilizadas
import Technician from './pages/Technician'
import Login from './pages/Login'
import Client from './pages/Client'
import Admin from './pages/Admin'
import ProtectedRoute from './Components/ProtectedRoute'
import CrearSolicitud from './pages/Cliente/CrearSolicitud'
import Dashboard from './pages/Tecnico/Dashboard'
import Home from './pages/Home'
import Header from './Components/Header'
import MostrarTecnicos from './Components/MostrarTecnicos'
import Register from './pages/Register'
import SolicitudCardDetalle from './pages/Cliente/SolicitudCardDetalle'
import NotFound from "./pages/NotFound";

function App() {
  return (
    <div>
      <section>
        <Header></Header>
      </section>
      <section>
        <Routes>
          <Route path='/' element={<Home></Home>}/>
          <Route path='/Home' element={<Home></Home>}/>
          <Route path='/Login' element={<Login></Login>}/>
          <Route path='/Register' element={<Register></Register>}/>
          <Route path="/Client/dashboard" element={ <ProtectedRoute allowedRole="client"><Client /> </ProtectedRoute>}/>
          <Route path="/Client/solicitud/:id" element={<ProtectedRoute allowedRole="client"><SolicitudCardDetalle /></ProtectedRoute>}></Route>
          <Route path="/Admin" element={ <ProtectedRoute allowedRole="admin"> <Admin /> </ProtectedRoute>}/>
          <Route path='Client/solicitud' element={<ProtectedRoute allowedRole="client"><CrearSolicitud/></ProtectedRoute>}/>
          <Route path='Client/servicio/:servicio' element={<ProtectedRoute allowedRole="client"><MostrarTecnicos/></ProtectedRoute>}/>
          <Route path='Technician/dashboard' element={<ProtectedRoute allowedRole="technician"><Dashboard /></ProtectedRoute>}/>
          <Route path='Technician/dashboard' element={<ProtectedRoute allowedRole="technician"><Dashboard /></ProtectedRoute>}/>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </section>
    </div>

  )
}

export default App
