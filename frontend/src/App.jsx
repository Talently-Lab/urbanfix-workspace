
import { Navigate, Route, Routes } from 'react-router-dom'

import Home from './pages/Home'
import Technician from './pages/Technician'
import Login from './pages/Login'
import Register from './pages/Register'
import Client from './pages/Client'
import Admin from './pages/Admin'
import Navbar from './Components/Navbar'
import ProtectedRoute from './Components/ProtectedRoute'

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/Client"
          element={
            <ProtectedRoute allowedRole="client">
              <>
                <Navbar />
                <Client />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/Technician"
          element={
            <ProtectedRoute allowedRole="technician">
              <>
                <Navbar />
                <Technician />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/Admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <>
                <Navbar />
                <Admin />
              </>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App
