import { Route, Routes } from 'react-router-dom'

//Paginas Utilizadas
import Technician from './pages/Technician'
import Login from './pages/Login'
import Client from './pages/Client'
import Admin from './pages/Admin'
import ProtectedRoute from './Components/ProtectedRoute'
function App() {
  return (
      <Routes>
        <Route path='*' element={<Login></Login>}/>
        
        <Route
  path="/Client"
  element={
    <ProtectedRoute allowedRole="client">
      <Client />
    </ProtectedRoute>
  }
/>
        <Route
  path="/Technician"
  element={
    <ProtectedRoute allowedRole="technician">
      <Technician />
    </ProtectedRoute>
  }
/>
        <Route
  path="/Admin"
  element={
    <ProtectedRoute allowedRole="admin">
      <Admin />
    </ProtectedRoute>
  }
/>
      </Routes>

  )
}

export default App
