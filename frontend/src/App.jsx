import { Route, Routes } from 'react-router-dom'

//Paginas Utilizadas
import Login from './pages/Login'
import Client from './pages/Client'
import Admin from './pages/Admin'
import ProtectedRoute from './Components/ProtectedRoute'
function App() {
  return (
      <Routes>
        <Route path='*' element={<Login></Login>}/>
        <Route path='/Client' element={<ProtectedRoute><Client></Client></ProtectedRoute>}/>
        <Route path='/Admin' element={<ProtectedRoute><Admin></Admin></ProtectedRoute>}/>
      </Routes>

  )
}

export default App
