import React from 'react'
import Badge from './Badge'
//Proximamente debemos de recibir la informacion de cada profesional y completar la card con los datos

export function CardTecnico({nombre,profesiones}) {
  return (
    <div className='border rounded-xl flex p-3 m-2 max-w-sm gap-3'>
        {/* Foto del profesional */}
        <div className='w-2/5 flex items-center justify-center'>
          <img className='w-20 h-20 rounded-full object-cover' src="https://placehold.co/90" alt="profesional"/>
        </div>
         {/* Informacion del profesional*/}
        <div className='w-3/5 flex flex-col items-center justify-center gap-2'>
            <h4>{nombre}</h4>
            {/* Div de las profesiones*/}
            <div className='flex flex-row gap-1'>
              {profesiones.map((profesion) => 
              (<Badge key={profesion} rol={profesion}>{profesion}
              </Badge>
            ))}
            </div>
            <button className='border rounded-xl bg-green-500 text-green-950 text-black px-3 py-1 hover:bg-green-500/50'>Contactar!</button>
        </div>
    </div>
  )
}
export default CardTecnico