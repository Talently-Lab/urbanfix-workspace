import { Route, Routes } from 'react-router-dom'

//Paginas Utilizadas
import Technician from './pages/Technician'
import Login from './pages/Login'
import Client from './pages/Client'
import Admin from './pages/Admin'
import ProtectedRoute from './Components/ProtectedRoute'
import Home from './pages/Home'
import Navbar from './Components/Navbar'
function App() {
  return (
      <div>
        <Navbar/>
         <Routes>
        <Route path='*' element={<Home></Home>}/>
        <Route path='/Login' element={<Login></Login>}/>
        <Route path="/Client"
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

      </div>
     
  )
}

export default App
