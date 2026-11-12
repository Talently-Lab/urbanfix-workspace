import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const rolePaths = {
  CLIENTE: '/Client/dashboard',
  TECNICO: '/Technician/dashboard',
  ADMINISTRADOR: '/Admin',
};

function Header() {
  const { logout, user, token } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const estaLogueado = Boolean(user || token);

  useEffect(() => {
    const manejarClickExterno = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };

    document.addEventListener('mousedown', manejarClickExterno);
    return () => document.removeEventListener('mousedown', manejarClickExterno);
  }, []);

  const cerrarSesion = async () => {
    setMenuAbierto(false);
    await logout();
    navigate('/home');
  };

  const dashboardPath = rolePaths[user?.rol ?? user?.role] ?? '/login';

  const links = [
    { nombre: 'Inicio', ruta: '/home' },
    { nombre: 'Profesionales', ruta: '/home' },
    { nombre: 'Preguntas frecuentes', ruta: '/home' },
  ];

  return (
    <header className='relative z-50 flex h-20 items-center justify-between bg-white px-5 shadow-md md:px-10'>
      <Link to='/home' onClick={() => setMenuAbierto(false)} className='flex shrink-0 items-center'>
        <img src='/Logo2.png' className='h-16 w-auto object-contain' alt='UrbanFix' />
      </Link>

      <nav className='hidden items-center gap-6 lg:flex'>
        {links.map((link) => (
          <Link key={link.nombre} to={link.ruta} onClick={() => setMenuAbierto(false)} className='font-medium text-urban-principal transition-colors hover:text-urban-secundario'>
            {link.nombre}
          </Link>
        ))}
      </nav>

      <div className='flex items-center gap-3'>
        <div className='hidden items-center gap-2 text-urban-principal md:flex'>
          <span className='text-xl'>📍</span>
          <span className='text-sm font-medium'>Tu ubicación</span>
        </div>

        {estaLogueado ? (
          <div ref={menuRef} className='relative'>
            <button type='button' onClick={() => setMenuAbierto((abierto) => !abierto)} aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuAbierto} className='flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-lg border border-urban-principal/20 transition-colors hover:bg-urban-fondo'>
              <span className={`h-0.5 w-6 bg-urban-principal transition-transform ${menuAbierto ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`h-0.5 w-6 bg-urban-principal transition-opacity ${menuAbierto ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 w-6 bg-urban-principal transition-transform ${menuAbierto ? '-translate-y-2 -rotate-45' : ''}`} />
            </button>

            {menuAbierto && (
              <div className='absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl'>
                <div className='border-b border-slate-100 px-4 py-3'>
                  <p className='font-semibold text-urban-principal'>{user?.nombre || user?.email || 'Usuario'}</p>
                  <p className='text-sm text-urban-texto-secundario'>Sesión iniciada</p>
                </div>

                <nav className='flex flex-col gap-1 py-2'>
                  <Link to={dashboardPath} className='rounded-lg px-4 py-2 text-sm font-medium text-urban-principal hover:bg-urban-fondo'>Dashboard</Link>
                </nav>

                <button type='button' onClick={cerrarSesion} className='w-full rounded-lg px-4 py-3 text-left font-semibold text-red-600 transition-colors hover:bg-red-50'>Cerrar sesión</button>
              </div>
            )}
          </div>
        ) : (
          <Link to='/login' onClick={() => setMenuAbierto(false)} className='rounded-lg bg-urban-button px-5 py-2.5 font-semibold text-white transition-colors hover:bg-urban-secundario'>Iniciar sesión</Link>
        )}
      </div>
    </header>
  );
}

export default Header;