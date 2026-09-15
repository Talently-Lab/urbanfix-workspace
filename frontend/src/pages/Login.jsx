import React, { useState } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/UserContext";
function Login() {
  console.log('no estas logeado')
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate();
    const { iniciarSesion } = useAuthContext();


   const getLogin = (e) => {
      e.preventDefault()
      iniciarSesion(email, password);
      navigate("/Client");


    }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={getLogin} method="get">
        <label htmlFor="">Email</label>
        <input type="email"
          placeholder='correo@email.com' 
          value={email}
          onChange={(e) => setEmail(e.target.value)}/>
        <label htmlFor="">Password</label>
          <input type="text" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} />

        <button type="submit">Logearse</button>
      </form>

    </div>
  )
}

export default Login