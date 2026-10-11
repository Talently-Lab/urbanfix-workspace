import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

function Register() {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    numeroTelefono: '',
    rol: 'CLIENTE',
    idServicios: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const idServicios = form.rol === 'TECNICO'
      ? form.idServicios.split(',').map((id) => Number(id.trim()))
      : undefined

    if (
      form.rol === 'TECNICO' &&
      (!form.idServicios.trim() ||
        idServicios.some((id) => !Number.isInteger(id) || id <= 0))
    ) {
      setError('Ingresá los IDs de servicios válidos, separados por comas.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/auth/register', {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        password: form.password,
        numeroTelefono: form.numeroTelefono.trim() || undefined,
        rol: form.rol,
        ...(idServicios && { idServicios }),
      })
      navigate('/login', {
        replace: true,
        state: { message: 'La cuenta se creó correctamente. Ya podés iniciar sesión.' },
      })
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        setError('Ese email ya está registrado.')
      } else if (requestError.response?.status === 400) {
        setError(requestError.response.data?.error || 'Revisá los datos ingresados.')
      } else if (requestError.response) {
        setError(requestError.response.data?.error || 'No se pudo crear la cuenta.')
      } else {
        setError('No se pudo conectar con el servidor. Verificá que el backend esté iniciado.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none'

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <section className="mx-auto max-w-xl rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">UrbanFix</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Crear cuenta</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-slate-200">
              Nombre
              <input className={`${inputClass} mt-2`} name="nombre" autoComplete="given-name" value={form.nombre} onChange={updateField} required maxLength={100} />
            </label>
            <label className="block text-sm text-slate-200">
              Apellido
              <input className={`${inputClass} mt-2`} name="apellido" autoComplete="family-name" value={form.apellido} onChange={updateField} required maxLength={100} />
            </label>
          </div>
          <label className="block text-sm text-slate-200">
            Correo
            <input className={`${inputClass} mt-2`} type="email" name="email" autoComplete="email" value={form.email} onChange={updateField} required maxLength={254} />
          </label>
          <label className="block text-sm text-slate-200">
            Contraseña
            <input className={`${inputClass} mt-2`} type="password" name="password" autoComplete="new-password" value={form.password} onChange={updateField} required minLength={8} />
            <span className="mt-1 block text-xs text-slate-400">Debe tener al menos 8 caracteres.</span>
          </label>
          <label className="block text-sm text-slate-200">
            Teléfono (opcional)
            <input className={`${inputClass} mt-2`} type="tel" name="numeroTelefono" autoComplete="tel" value={form.numeroTelefono} onChange={updateField} />
          </label>
          <label className="block text-sm text-slate-200">
            Tipo de cuenta
            <select className={`${inputClass} mt-2`} name="rol" value={form.rol} onChange={updateField}>
              <option value="CLIENTE">Cliente</option>
              <option value="TECNICO">Técnico</option>
            </select>
          </label>
          {form.rol === 'TECNICO' && (
            <label className="block text-sm text-slate-200">
              IDs de servicios
              <input className={`${inputClass} mt-2`} name="idServicios" inputMode="numeric" value={form.idServicios} onChange={updateField} required placeholder="Ej.: 1, 3" />
              <span className="mt-1 block text-xs text-slate-400">Ingresá los IDs de servicios existentes separados por comas.</span>
            </label>
          )}
          {error && (
            <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200" role="alert">
              {error}
            </p>
          )}
          <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60" type="submit" disabled={submitting}>
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-400">
          ¿Ya tenés cuenta? <Link className="font-semibold text-cyan-300 hover:text-cyan-200" to="/login">Iniciá sesión</Link>
        </p>
      </section>
    </main>
  )
}

export default Register
