import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'Axios'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('client')

  const navigate = useNavigate()
  const { login } = useAuth()


  /*---- Funcion para Logearse ----*/ 
const getLogin = async (e) => {
  e.preventDefault();

  try {
    const respuesta = await axios.post(
      'http://localhost:3001/api/auth/login',
      {
        email,
        password
      }
    );

    const { usuario, token } = respuesta.data;

    // Adaptamos los datos del backend al formato de tu frontend
    const userData = {
      ...usuario,
      role: usuario.rol === 'CLIENTE'
        ? 'client'
        : usuario.rol === 'TECNICO'
        ? 'technician'
        : usuario.rol === 'ADMIN'
        ? 'admin'
        : null
    };

    if (!userData.role) {
      console.error('Rol no reconocido:', usuario.rol);
      alert('El rol del usuario no está reconocido.');
      return;
    }

    // Guardamos el usuario y el JWT en el contexto de autenticación
    login(userData, token);

    // Redirigimos según el rol
    if (userData.role === 'client') {
      navigate('/Client');
    } else if (userData.role === 'admin') {
      navigate('/Admin');
    } else if (userData.role === 'technician') {
      navigate('/Technician/dashboard');
    }

  } catch (error) {
    console.error(
      'Error al iniciar sesión:',
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
      'No se pudo iniciar sesión'
    );
  }
};
  return (
    <div className='flex flex-col'>
      <img src='../../public/Logo.svg' alt="" className='w-80 h-30 m-auto pt-5'/>
      <div className='grid grid-cols-2 gap-8'>

        {/*----- Texto del login ------*/}

        <section className='border t-center'>
          <h2>Conecta clientes con profesionales de confianza en minutos.</h2>
          <h4>Mantenimiento y reparaciones para el hogar con calidad profesional y total tranquilidad.</h4>
        </section>

        {/*------ Formulario del login ------*/}

        <section className='border text-start p-2'>
          <h5 className='text-urban-button font-bold'>Ingresar</h5>
          <form onSubmit={getLogin} className='flex flex-col'>
            <div className="flex w-full rounded-xl bg-blue-600/20 p-1 gap-1">
              <button type="button"onClick={() => setRole('client')} className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1 text-xs transition-colors
                ${role === 'client' ? 'bg-slate-100 text-slate-700': 'bg-transparent text-neutral-50 hover:bg-orange-500/50' }`}>Cliente
              </button>
              <button type="button"onClick={() => setRole('technician')} className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1 text-xs transition-colors
                ${role === 'technician' ? 'bg-slate-100 text-slate-800': 'bg-transparent text-neutral-50 hover:bg-sky-500/30' }`}>Tecnico
              </button>
            </div>
            <label htmlFor="email" className='font-bold'>Email</label>
              <input className='border rounded-lg px-3 py-1' 
                id="email"
                type="email"
                placeholder="correo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}/>
            <label htmlFor="password" className='font-bold'>Password</label>
              <input className='border rounded-lg px-3 py-1' 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}/>
              <button type="submit" className='bg-urban-button text-white font-bold w-60 m-auto p-auto'>Iniciar sesión</button>
          </form>
        </section>
      </div>
    
    </div>
  )
}

export default Login