import React from 'react'
import { Link } from "react-router-dom";function Navbar() {
    
  return (
      <nav className='border-b bg-sky-900 px-6 py-4'>
        <div className='mx-auto flex max-w-6xl items-center justify-between'>
          <Link to='/' className="text-xl font-bold text-white">UrbanFix</Link>

        {/*div de links*/}
        <div className='flex items-center gap-6'>
          <Link to='/' className='text-white hover:text-sky-600'>Inicio</Link>
          <Link to='/Client' className='text-white hover:text-sky-600'>Cliente</Link>
          <Link to='/Technician' className='text-white hover:text-sky-600'>Profesionales</Link>
        </div>

        {/*div del usuario*/}
        <div className='flex items-center gap-3'>
          <span className='font-medium text-white'>Usuario</span>
          <button className='rounded-xl bg-indigo-600/80 px-4 py-2 text-white hover:bg-sky-700'>Salir</button>
        </div>

      </div>
    </nav>
  )
}

export default Navbar