import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const eventoRegistrado = useRef(false);

  useEffect(() => {
    if (eventoRegistrado.current) return;
    eventoRegistrado.current = true;

    const registrarVistaLogin = async () => {
      try {
        let sesionId = sessionStorage.getItem('sesionId');

        if (!sesionId) {
          sesionId = crypto.randomUUID();
          sessionStorage.setItem('sesionId', sesionId);
        }

        await api.post('/eventos', {
          nombreEvento: 'VISTA_LOGIN',
          sesionId,
        });
      } catch (requestError) {
        console.error('Error al registrar VISTA_LOGIN:', requestError.response?.data || requestError.message);
      }
    };

    registrarVistaLogin();
  }, []);

  const getLogin = async (event) => {
    event.preventDefault();

    setError('');
    setCargando(true);

    try {
      const respuesta = await api.post('/auth/login', { email, password });
      const { usuario, token } = respuesta.data;

      if (!usuario || typeof token !== 'string' || !token) {
        throw new Error('La respuesta del servidor no contiene usuario y token.');
      }

      const roleByBackend = {
        CLIENTE: 'client',
        TECNICO: 'technician',
        ADMINISTRADOR: 'admin',
      };

      const userData = {
        ...usuario,
        rol: usuario.rol,
        role: roleByBackend[usuario.rol] || usuario.role,
      };

      if (!userData.rol || !roleByBackend[userData.rol]) {
        throw new Error('El rol del usuario no está reconocido.');
      }

      login(userData, token);

      if (userData.rol === 'CLIENTE') {
        navigate('/Client/dashboard');
      } else if (userData.rol === 'ADMINISTRADOR') {
        navigate('/Admin');
      } else {
        navigate('/Technician/dashboard');
      }
    } catch (requestError) {
      const mensaje = requestError.response?.data?.error || requestError.response?.data?.message || requestError.response?.data?.mensaje || 'No se pudo iniciar sesión. Revisá tu correo y contraseña.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className='min-h-screen bg-urban-fondo p-4 sm:p-8'>
      <div className='mx-auto grid min-h-[650px] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2'>
        <section className='relative flex flex-col justify-between overflow-hidden bg-urban-principal p-8 text-white sm:p-12 lg:p-14'>
          <div className='absolute -right-20 -top-20 h-72 w-72 rounded-full border-[40px] border-white/5' />
          <div className='absolute -bottom-24 -left-20 h-80 w-80 rounded-full border-[50px] border-urban-button/20' />

          <Link to='/home' className='relative z-10 inline-flex w-fit items-center gap-3'>
            <span className='flex h-12 w-12 items-center justify-center rounded-2xl bg-urban-button text-2xl font-black'>U</span>
            <span className='text-2xl font-extrabold tracking-tight'>UrbanFix</span>
          </Link>

          <div className='relative z-10 my-12'>
            <span className='mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium'>Soluciones para tu hogar</span>
            <h1 className='max-w-lg text-4xl font-extrabold leading-tight sm:text-5xl'>
              Tu hogar,
              <span className='block text-urban-button'>en buenas manos.</span>
            </h1>
            <p className='mt-6 max-w-md text-base leading-7 text-slate-200 sm:text-lg'>Conectá con profesionales de confianza para resolver lo que necesitás, de forma fácil y segura.</p>
            <div className='mt-9 space-y-4'>
              {['Profesionales para distintas necesidades', 'Solicitudes simples y rápidas', 'Seguimiento de tus trabajos'].map((beneficio) => (
                <div key={beneficio} className='flex items-center gap-3'>
                  <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-urban-button text-sm font-bold'>✓</span>
                  <span className='text-sm text-slate-100 sm:text-base'>{beneficio}</span>
                </div>
              ))}
            </div>
          </div>

          <p className='relative z-10 text-sm text-slate-300'>Encontrá la solución que tu hogar necesita.</p>
        </section>

        <section className='flex items-center justify-center p-6 sm:p-10 lg:p-14'>
          <div className='w-full max-w-md'>
            <div className='mb-8'>
              <p className='text-sm font-bold uppercase tracking-widest text-urban-button'>Bienvenido a UrbanFix</p>
              <h2 className='mt-3 text-3xl font-extrabold text-urban-principal sm:text-4xl'>¡Qué bueno verte!</h2>
              <p className='mt-3 text-sm leading-6 text-urban-texto-secundario'>Ingresá tus datos para continuar.</p>
            </div>

            <form onSubmit={getLogin} className='flex flex-col gap-5'>
              <div>
                <label htmlFor='email' className='mb-2 block text-sm font-semibold text-urban-principal'>Correo electrónico</label>
                <input id='email' type='email' autoComplete='email' placeholder='correo@ejemplo.com' value={email} onChange={(e) => setEmail(e.target.value)} required className='w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-urban-button focus:ring-4 focus:ring-urban-button/10' />
              </div>

              <div>
                <label htmlFor='password' className='mb-2 block text-sm font-semibold text-urban-principal'>Contraseña</label>
                <input id='password' type='password' autoComplete='current-password' placeholder='Ingresá tu contraseña' value={password} onChange={(e) => setPassword(e.target.value)} required className='w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-urban-button focus:ring-4 focus:ring-urban-button/10' />
              </div>

              {error && (
                <p role='alert' className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>{error}</p>
              )}

              <button type='submit' disabled={cargando} className='rounded-xl bg-urban-button px-5 py-3.5 text-base font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70'>
                {cargando ? (
                  <span className='inline-flex items-center justify-center gap-2' role='status'>
                    <span aria-hidden='true' className='h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent' />
                    Iniciando sesión...
                  </span>
                ) : 'Iniciar sesión'}
              </button>

              <p className='mt-2 text-center text-sm text-urban-texto-secundario'>
                ¿Todavía no tenés una cuenta?{' '}
                <Link to='/Register' className='font-bold text-urban-principal hover:underline'>Registrate</Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;