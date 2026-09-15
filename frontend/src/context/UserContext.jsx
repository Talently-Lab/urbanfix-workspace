import React, { createContext, useContext, useState, useEffect } from "react";

export const UserContext = createContext()

//Contexto del usuario
export function LoginProvider({ children }){
    //Verificamos que este logeado
    const [isAuthenticated, setisAuthenticated] = useState(false)

    const iniciarSesion = (email,password)=> {
        setisAuthenticated(true)
    }
    const value={
        isAuthenticated, //Para ver si esta logeado o no
        iniciarSesion
    }

    //Todas las funciones y datos que seran globales
    return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
export function useAuthContext() {
  return useContext(UserContext);
}