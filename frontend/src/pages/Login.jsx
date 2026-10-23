
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

function Login() {
  const [modo, setModo] = useState('login')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  // INICIAR SESION
  const getLogin = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const respuesta = await axios.post(
        'http://localhost:3001/api/auth/login',
        { email, password }
      )

      const { usuario, token } = respuesta.data

      const roles = {
        CLIENTE: 'client',
        TECNICO: 'technician',
        ADMIN: 'admin',
      }

      const userData = {
        ...usuario,
        role: roles[usuario.rol],
      }

      if (!userData.role) {
        setError('El rol del usuario no está reconocido.')
        return
      }

      login(userData, token)

      if (userData.role === 'client') {
        navigate('/Client')
      } else if (userData.role === 'admin') {
        navigate('/Admin')
      } else {
        navigate('/Technician/dashboard')
      }
    } catch (error) {
      console.error(
        'Error al iniciar sesión:',
        error.response?.data || error.message
      )

      setError(
        error.response?.data?.message ||
        'No se pudo iniciar sesión. Revisá tus datos.'
      )
    } finally {
      setCargando(false)
    }
  }

  // REGISTRO
  const getRegistro = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    // Falta conectar el endpoint real de registro del backend.
    setError(
      'El formulario está preparado, pero falta conectar el endpoint de registro.'
    )
  }

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo)
    setError('')
    setPassword('')
    setConfirmarPassword('')
  }

  return (
    <main className="min-h-screen bg-urban-fondo p-4 sm:p-8">
      <div className="mx-auto grid min-h-[650px] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

        {/* PANEL IZQUIERDO */}
        <section className="relative flex flex-col justify-between overflow-hidden bg-urban-principal p-8 text-white sm:p-12 lg:p-14">

          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[40px] border-white/5" />
          <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full border-[50px] border-urban-button/20" />

          <Link to="/home" className="relative z-10 inline-flex w-fit items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-urban-button text-2xl font-black">
              U
            </span>
            <span className="text-2xl font-extrabold tracking-tight">
              UrbanFix
            </span>
          </Link>

          <div className="relative z-10 my-12">
            <span className="mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
              Soluciones para tu hogar
            </span>

            <h1 className="max-w-lg text-4xl font-extrabold leading-tight sm:text-5xl">
              Tu hogar,
              <span className="block text-urban-button">
                en buenas manos.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-slate-200 sm:text-lg">
              Conectá con profesionales de confianza para resolver
              lo que necesitás, de forma fácil y segura.
            </p>

            <div className="mt-9 space-y-4">
              {[
                'Profesionales para distintas necesidades',
                'Solicitudes simples y rápidas',
                'Seguimiento de tus trabajos',
              ].map((beneficio) => (
                <div key={beneficio} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-urban-button text-sm font-bold">
                    ✓
                  </span>
                  <span className="text-sm text-slate-100 sm:text-base">
                    {beneficio}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-sm text-slate-300">
            Encontrá la solución que tu hogar necesita.
          </p>
        </section>

        {/* PANEL DERECHO: LOGIN Y REGISTRO */}
        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-widest text-urban-button">
                Bienvenido a UrbanFix
              </p>

              <p className="mt-3 text-3xl font-extrabold text-urban-principal sm:text-4xl">
                {modo === 'login' ? '¡Qué bueno verte!' : 'Creá tu cuenta'}
              </p>

              <p className="mt-3 text-sm leading-6 text-urban-texto-secundario">
                {modo === 'login'
                  ? 'Ingresá tus datos para continuar.'
                  : 'Completá tus datos para empezar a usar UrbanFix.'}
              </p>
            </div>

            {/* SELECTOR DE MODO */}
            <div className="mb-7 grid grid-cols-2 rounded-xl bg-urban-fondo p-1">
              <button
                type="button"
                onClick={() => cambiarModo('login')}
                className={`rounded-lg px-3 py-3 text-sm font-bold transition ${
                  modo === 'login'
                    ? 'bg-white text-urban-principal shadow-sm'
                    : 'text-urban-texto-secundario hover:text-urban-principal'
                }`}
              >
                Iniciar sesión
              </button>

              <button
                type="button"
                onClick={() => cambiarModo('registro')}
                className={`rounded-lg px-3 py-3 text-sm font-bold transition ${
                  modo === 'registro'
                    ? 'bg-white text-urban-principal shadow-sm'
                    : 'text-urban-texto-secundario hover:text-urban-principal'
                }`}
              >
                Registrarme
              </button>
            </div>

            <form
              onSubmit={modo === 'login' ? getLogin : getRegistro}
              className="flex flex-col gap-5"
            >
              {/* NOMBRE: SOLO REGISTRO */}
              {modo === 'registro' && (
                <div>
                  <p>MODIFICAR EL REGISTER FALTA SELECCIONAR ROLES</p>
                  <label
                    htmlFor="nombre"
                    className="mb-2 block text-sm font-semibold text-urban-principal"
                  >
                    Nombre completo
                  </label>

                  <input
                    id="nombre"
                    type="text"
                    autoComplete="name"
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-urban-button focus:ring-4 focus:ring-urban-button/10"
                  />
                </div>
              )}

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-urban-principal"
                >
                  Correo electrónico
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-urban-button focus:ring-4 focus:ring-urban-button/10"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-urban-principal"
                >
                  Contraseña
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete={
                    modo === 'login' ? 'current-password' : 'new-password'
                  }
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={modo === 'registro' ? 8 : undefined}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-urban-button focus:ring-4 focus:ring-urban-button/10"
                />
              </div>

              {/* CONFIRMAR PASSWORD: SOLO REGISTRO */}
              {modo === 'registro' && (
                <div>
                  <label
                    htmlFor="confirmarPassword"
                    className="mb-2 block text-sm font-semibold text-urban-principal"
                  >
                    Confirmar contraseña
                  </label>

                  <input
                    id="confirmarPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repetí tu contraseña"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-urban-button focus:ring-4 focus:ring-urban-button/10"
                  />
                </div>
              )}

              {/* ERRORES */}
              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              {/* BOTÓN PRINCIPAL */}
              <button
                type="submit"
                disabled={cargando}
                className="mt-2 w-full rounded-xl bg-urban-button px-5 py-4 font-bold text-white shadow-lg shadow-urban-button/20 transition hover:-translate-y-0.5 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cargando
                  ? 'Procesando...'
                  : modo === 'login'
                    ? 'Iniciar sesión →'
                    : 'Crear cuenta →'}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-urban-texto-secundario">
              <span aria-hidden="true">🔒</span>
              <span>Tu información se utiliza de forma segura.</span>
            </div>

            <p className="mt-6 text-center text-sm text-urban-texto-secundario">
              {modo === 'login'
                ? '¿Todavía no tenés cuenta?'
                : '¿Ya tenés una cuenta?'}{' '}
              <button
                type="button"
                onClick={() =>
                  cambiarModo(modo === 'login' ? 'registro' : 'login')
                }
                className="font-bold text-urban-button hover:underline"
              >
                {modo === 'login' ? 'Registrate' : 'Iniciá sesión'}
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Login
