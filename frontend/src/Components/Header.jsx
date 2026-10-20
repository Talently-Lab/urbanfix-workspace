import React from 'react'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { logout } = useAuth()
  return (
    <header className="bg-sky-100 h-24 p-2 flex items-center justify-between">
    <div>
        <img src="/Logo.svg" className="h-20" alt="Logo" />
    </div>
    <div>
        Cliente
        <button onClick={()=>{ logout()}}>Cerrar sesion</button>
    </div>
    </header>
  )
}

export default Header