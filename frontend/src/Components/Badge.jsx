import React from 'react'
//El componente badge recibe 2 parametros: 1 rol que sera el color que tendra y el texto
function Badge({ children, rol}) {
    //Componente reutilizable para llenar estados y profesiones
    const colores = {
        gasista:'bg-yellow-500/80 text-yellow-900',
        plomero:'bg-cyan-500/80 text-sky-900',
        aceptado:'bg-green-300/40 text-green-900',
        pendiente:'bg-amber-500/40 text-amber-800',
        rechazado:'bg-rose-500/40 text-rose-800',
    }
  return (
    <span className={`font-semibold rounded-xl px-2 py-1 text-sm ${colores[rol]}`}>
        {children}
    </span>
  )
}

export default Badge