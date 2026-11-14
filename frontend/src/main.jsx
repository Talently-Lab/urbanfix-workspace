import './index.css'
import App from './App.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TecnicoProvider } from "./context/TecnicoContext";
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <TecnicoProvider>
        <App />
      </TecnicoProvider>
    </AuthProvider>
  </BrowserRouter>
)