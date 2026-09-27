import React from 'react'
import CardTecnico from '../Components/CardTecnico'
function Client() {
  return (
    <div>
      <div><h2>Nuestros Tecnicos!</h2></div>
      <div className='flex justify-center'>
        <CardTecnico nombre='juancito' profesiones={['plomero','gasista']}></CardTecnico>
        <CardTecnico nombre='Julieta' profesiones={['gasista']}></CardTecnico>
        <CardTecnico nombre='Mariano' profesiones={['plomero']}></CardTecnico>
      </div>
    </div>
  )
}

export default Client