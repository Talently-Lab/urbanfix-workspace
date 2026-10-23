
import React from 'react'
import { Link } from 'react-router-dom'
import bgFondo from '../../public/bg-fondo.jpg'

function Home() {
  const beneficios = [
    {
      icono: '🛡️',
      titulo: 'Profesionales confiables',
      descripcion: 'Encontrá especialistas para resolver los problemas de tu hogar.',
    },
    {
      icono: '⚡',
      titulo: 'Respuesta rápida',
      descripcion: 'Creá tu solicitud de forma sencilla y empezá a buscar soluciones.',
    },
    {
      icono: '⭐',
      titulo: 'Experiencia transparente',
      descripcion: 'Elegí servicios con información clara para tomar mejores decisiones.',
    },
  ]

  const categorias = [
    { icono: '🔧', nombre: 'Plomería', descripcion: 'Cañerías y pérdidas' },
    { icono: '⚡', nombre: 'Electricidad', descripcion: 'Instalaciones y reparaciones' },
    { icono: '🔥', nombre: 'Gas', descripcion: 'Servicios de gas' },
    { icono: '🧱', nombre: 'Albañilería', descripcion: 'Arreglos y construcción' },
  ]

  return (
    <main className="bg-white">

      {/* HERO */}
      <section
        className="relative isolate overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${bgFondo})` }}
      >
        {/* Capa para mejorar la lectura */}
        <div className="absolute inset-0 -z-10 bg-white/80" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 sm:px-10 sm:py-24 lg:grid-cols-5 lg:py-28">

          {/* TEXTO PRINCIPAL */}
          <div className="lg:col-span-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-urban-button/20 bg-white/80 px-4 py-2 text-sm font-bold text-urban-principal shadow-sm">
              <span className="h-2 w-2 rounded-full bg-urban-button" />
              Soluciones para tu hogar
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-urban-principal sm:text-5xl lg:text-6xl">
              Tu hogar en
              <span className="block">buenas manos.</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-urban-texto-secundario sm:text-xl">
              Encontrá profesionales para cada problema y resolvé
              los arreglos de tu casa de forma simple y segura.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-urban-button px-7 py-4 font-bold text-white shadow-lg shadow-urban-button/20 transition hover:-translate-y-1 hover:brightness-95"
              >
                Solicitar un servicio
                <span aria-hidden="true">→</span>
              </Link>

              <a
                href="#servicios"
                className="inline-flex items-center justify-center rounded-xl border border-urban-principal/20 bg-white/80 px-7 py-4 font-bold text-urban-principal transition hover:bg-white"
              >
                Explorar servicios
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-urban-principal">
              <span>✓ Fácil de usar</span>
              <span>✓ Distintos profesionales</span>
              <span>✓ Solicitudes online</span>
            </div>
          </div>

          {/* TARJETA LATERAL */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-2xl backdrop-blur-sm sm:p-8">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-urban-fondo text-3xl">
                🏠
              </div>

              <p className="mt-5 text-2xl font-extrabold text-urban-principal">
                Todo empieza en casa
              </p>

              <p className="mt-3 leading-7 text-urban-texto-secundario">
                Encontrá el tipo de servicio que necesitás y empezá
                a gestionar tu solicitud en pocos pasos.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  {
                    numero: '01',
                    titulo: 'Elegí el servicio',
                    texto: 'Contanos qué necesitás solucionar.',
                  },
                  {
                    numero: '02',
                    titulo: 'Creá tu solicitud',
                    texto: 'Agregá los detalles del trabajo.',
                  },
                  {
                    numero: '03',
                    titulo: 'Buscá una solución',
                    texto: 'Seguí el estado de tu solicitud.',
                  },
                ].map((paso) => (
                  <div key={paso.numero} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-urban-fondo font-extrabold text-urban-button">
                      {paso.numero}
                    </span>

                    <div>
                      <h3 className="font-bold text-urban-principal">
                        {paso.titulo}
                      </h3>
                      <p className="mt-1 text-sm text-urban-texto-secundario">
                        {paso.texto}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 border-t border-slate-200 pt-5">
                <p className="text-sm font-medium text-urban-texto-secundario">
                  Una forma más simple de cuidar tu hogar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-extrabold uppercase tracking-widest text-urban-button">
            ¿Por qué UrbanFix?
          </p>

          <p className="mt-3 text-3xl font-extrabold text-urban-principal sm:text-4xl">
            Resolver problemas puede ser más fácil
          </p>

          <p className="mt-4 leading-7 text-urban-texto-secundario">
            Una plataforma pensada para conectar las necesidades de tu
            hogar con profesionales que pueden ayudarte.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {beneficios.map((beneficio) => (
            <article
              key={beneficio.titulo}
              className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-urban-fondo text-3xl">
                {beneficio.icono}
              </div>

              <h3 className="mt-5 text-xl font-bold text-urban-principal">
                {beneficio.titulo}
              </h3>

              <p className="mt-3 leading-7 text-urban-texto-secundario">
                {beneficio.descripcion}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section id="servicios" className="bg-urban-fondo px-6 py-16 sm:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-widest text-urban-button">
                Nuestros servicios
              </p>

              <h2 className="mt-3 text-3xl font-extrabold text-urban-principal sm:text-4xl">
                ¿Qué necesitás arreglar?
              </h2>

              <p className="mt-3 max-w-xl leading-7 text-urban-texto-secundario">
                Explorá algunas de las categorías disponibles para
                encontrar una solución para tu hogar.
              </p>
            </div>

            <Link
              to="/login"
              className="inline-flex w-fit items-center gap-2 font-bold text-urban-button transition hover:gap-3"
            >
              Ver servicios
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categorias.map((categoria) => (
              <Link
                key={categoria.nombre}
                to="/login"
                className="group rounded-2xl border border-white bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-urban-button/30 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-urban-fondo text-3xl transition group-hover:bg-urban-button/10">
                  {categoria.icono}
                </div>

                <h3 className="mt-5 text-xl font-bold text-urban-principal">
                  {categoria.nombre}
                </h3>

                <p className="mt-2 text-sm text-urban-texto-secundario">
                  {categoria.descripcion}
                </p>

                <div className="mt-5 font-bold text-urban-button">
                  Encontrar servicio →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* LLAMADO A LA ACCIÓN */}
      <section className="px-6 py-16 sm:px-10 lg:py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl bg-urban-principal p-8 sm:p-12 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-urban-button">
              Empezá hoy
            </p>

            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Tu próxima solución está a unos clics.
            </h2>

            <p className="mt-4 leading-7 text-slate-200">
              Creá tu cuenta y empezá a gestionar los arreglos
              que tu hogar necesita.
            </p>
          </div>

          <Link
            to="/login"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-urban-button px-7 py-4 font-bold text-white transition hover:-translate-y-1 hover:brightness-95"
          >
            Empezar ahora
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white px-6 py-8 sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to="/home" className="text-xl font-extrabold text-urban-principal">
            Urban<span className="text-urban-button">Fix</span>
          </Link>

          <p className="text-center text-sm text-urban-texto-secundario">
            Soluciones para tu hogar, en un solo lugar.
          </p>
        </div>
      </footer>
    </main>
  )
}

export default Home
