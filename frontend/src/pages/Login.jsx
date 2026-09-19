import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/UserContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('client')

  const navigate = useNavigate()
  const { iniciarSesion } = useAuthContext()

  const getLogin = (e) => {
    e.preventDefault()

    iniciarSesion(email, password, role)

    if (role === 'client') {
      navigate('/Client')
    } else if (role === 'admin') {
      navigate('/Admin')
    } else if (role === 'technician') {
  navigate('/Technician')
}
  }

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={getLogin}>

        <label htmlFor="email">Email</label>

        <input
          id="email"
          type="email"
          placeholder="correo@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password</label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label htmlFor="role">Rol</label>

        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="client">Cliente</option>
          <option value="admin">Admin</option>
          <option value="technician">Técnico</option>
        </select>

        <button type="submit">
          Iniciar sesión
        </button>

      </form>
    </div>
  )
}

export default Login