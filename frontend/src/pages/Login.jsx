import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('client')

  const navigate = useNavigate()
  const { login } = useAuth()

  const getLogin = (e) => {
  e.preventDefault()

  const userData = {
    id: 1,
    email: email,
    role: role
  }

  const authToken = 'mock-token'

  login(userData, authToken)

  if (role === 'client') {
    navigate('/Client')
  } else if (role === 'admin') {
    navigate('/Admin')
  } else if (role === 'technician') {
    navigate('/Technician')
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900">
    <div className="w-full max-w-5xl flex">

    {/* Div de texto */}
    <div className="w-1/2 flex flex-col justify-center p-8 text-white">
      <h1 className="text-4xl text-white">
        UrbanFix
      </h1>

      <h4 className="mt-4 text-xl font-semibold">
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Possimus eligendi labore temporibus totam dolorem dolore.
        Deserunt fugit, quam commodi repellat est iusto?
      </h4>

      <p className="mt-4 text-gray-800/">
        Lorem perspiciatis ea ducimus eius, repellat consectetur
        autem facilis.
      </p>
    </div>

    {/* Div de login */}
    <div className="w-1/2 p-8 border rounded-xl shadow-sm bg-stone-100">

      <h2 className="text-2xl font-bold text-black">Iniciar Sesión </h2>

      <span className="text-black"> Selecciona el tipo de cuenta para continuar.</span>

      <form
        onSubmit={getLogin}
        className="flex flex-col gap-3 mt-6"
      >
        <label htmlFor="email" className="font-medium text-black">
          Email
        </label>

        <input
          className="border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white text-black"
          id="email"
          type="email"
          placeholder="correo@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password" className="font-medium text-black">
          Password
        </label>

        <input
          className="border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white text-black"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label htmlFor="role" className="font-medium text-black">
          Rol
        </label>

        <select
          className="border border-gray-200 rounded-lg px-3 py-2 shadow-sm  focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 bg-white"
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="client">Cliente</option>
          <option value="admin">Admin</option>
          <option value="technician">Técnico</option>
        </select>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-amber-600 p-2 font-semibold text-white hover:bg-sky-700"
        >
          Iniciar sesión
        </button>
      </form>

    </div>

  </div>
</div>
  )
}

export default Login