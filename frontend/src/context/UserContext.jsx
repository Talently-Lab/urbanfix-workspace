import React, { createContext, useContext, useState } from "react";

export const UserContext = createContext();

// Contexto del usuario
export function LoginProvider({ children }) {

  const [user, setUser] = useState(null);

  const iniciarSesion = (email, password, role) => {

    setUser({
      email: email,
      role: role
    });

  };

  const cerrarSesion = () => {
    setUser(null);
  };

  const value = {
    user,
    iniciarSesion,
    cerrarSesion
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(UserContext);
}