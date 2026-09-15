import './index.css'
import App from './App.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter} from "react-router-dom"
import { LoginProvider } from './context/UserContext'
createRoot(document.getElementById('root')).render(
   <BrowserRouter>
      <LoginProvider>
        <App />
      </LoginProvider>
   </BrowserRouter>


)
