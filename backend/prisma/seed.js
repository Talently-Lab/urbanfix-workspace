const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const diasAtras = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const servicios = [
  { nombreServicio: 'Plomería', descripcion: 'Reparación e instalación de cañerías y sanitarios' },
  { nombreServicio: 'Electricidad', descripcion: 'Instalaciones y reparaciones eléctricas' },
  { nombreServicio: 'Gasista', descripcion: 'Instalación y revisión de artefactos y redes de gas' },
  { nombreServicio: 'Carpintería', descripcion: 'Muebles, puertas y arreglos en madera' },
];

// Qué servicios ofrece cada técnico
const ofertas = {
  'tecnico@test.com': ['Plomería', 'Electricidad'],
  'tecnico2@test.com': ['Electricidad', 'Gasista'],
  'tecnico3@test.com': ['Plomería', 'Carpintería'],
};

// eventos: lista de [tipoEvento, idUsuario, díasAtrás]
async function crearSolicitud({ detalle, direccion, estado, cliente, servicio, tecnico = null, creada, aceptada = null, finalizada = null, eventos, sesionId = null, instanciaFormularioId = null }) {
  await prisma.solicitud.create({
    data: {
      detalle,
      direccion,
      estado,
      idCliente: cliente,
      idServicio: servicio,
      idTecnico: tecnico,
      fechaCreacion: diasAtras(creada),
      // Si fue aceptada, se calcula 20 minutos después de creada para que cuente como rápida (liquidez)
      fechaAceptacion: aceptada !== null ? new Date(diasAtras(creada).getTime() + 20 * 60 * 1000) : null,
      fechaFinalizacion: finalizada !== null ? diasAtras(finalizada) : null,
      eventos: {
        create: eventos.map(([nombreEvento, idUsuario, dias]) => ({
          nombreEvento,
          idUsuario,
          fechaHora: diasAtras(dias),
          sesionId,
          instanciaFormularioId,
        })),
      },
    },
  });
}

async function main() {
  const hashedPass = await bcrypt.hash('password123', 12);

  // Usuarios: 1 admin (prueba) y 6 usuarios reales (usuarioDePrueba: false para métricas)
  await prisma.usuario.createMany({
    data: [
      { email: 'admin@urbanfix.com', password: hashedPass, nombre: 'Admin', apellido: 'UrbanFix', rol: 'ADMINISTRADOR', usuarioDePrueba: true },
      { email: 'cliente@test.com', password: hashedPass, nombre: 'María', apellido: 'García', rol: 'CLIENTE', numeroTelefono: '1112345678', usuarioDePrueba: false, ultimoLogin: new Date() },
      { email: 'cliente2@test.com', password: hashedPass, nombre: 'Lucía', apellido: 'Fernández', rol: 'CLIENTE', numeroTelefono: '1155550001', usuarioDePrueba: false, ultimoLogin: new Date() },
      { email: 'cliente3@test.com', password: hashedPass, nombre: 'Martín', apellido: 'López', rol: 'CLIENTE', numeroTelefono: '1155550003', usuarioDePrueba: false, ultimoLogin: diasAtras(3) },
      { email: 'tecnico@test.com', password: hashedPass, nombre: 'Juan', apellido: 'Pérez', rol: 'TECNICO', numeroTelefono: '1187654321', usuarioDePrueba: false, ultimoLogin: new Date() },
      { email: 'tecnico2@test.com', password: hashedPass, nombre: 'Carlos', apellido: 'Gómez', rol: 'TECNICO', numeroTelefono: '1155550002', usuarioDePrueba: false, ultimoLogin: diasAtras(2) },
      { email: 'tecnico3@test.com', password: hashedPass, nombre: 'Diego', apellido: 'Sosa', rol: 'TECNICO', numeroTelefono: '1155550005', usuarioDePrueba: false, ultimoLogin: null },
    ],
    skipDuplicates: true,
  });

  const usuarios = await prisma.usuario.findMany();
  const u = Object.fromEntries(usuarios.map((x) => [x.email, x.idUsuario]));

  // Servicios (se crea solo el que falte)
  for (const sv of servicios) {
    const existe = await prisma.servicio.findFirst({ where: { nombreServicio: sv.nombreServicio } });
    if (!existe) await prisma.servicio.create({ data: sv });
  }

  const todos = await prisma.servicio.findMany();
  const s = Object.fromEntries(todos.map((x) => [x.nombreServicio, x.idServicio]));

  // Relación técnico-servicio
  const relaciones = [];
  for (const [email, lista] of Object.entries(ofertas)) {
    for (const nombre of lista) {
      relaciones.push({ idTecnico: u[email], idServicio: s[nombre] });
    }
  }
  await prisma.tecnicoServicio.createMany({ data: relaciones, skipDuplicates: true });

  // Solicitudes
  if ((await prisma.solicitud.count()) === 0) {
    const c1 = u['cliente@test.com'];
    const c2 = u['cliente2@test.com'];
    const c3 = u['cliente3@test.com'];
    const juan = u['tecnico@test.com'];
    const carlos = u['tecnico2@test.com'];
    const diego = u['tecnico3@test.com'];

    // 1. PENDIENTE con rechazo parcial
    await crearSolicitud({
      detalle: 'Instalar luces LED en el patio',
      direccion: 'Av. Rivadavia 4500, Caballito, CABA',
      estado: 'PENDIENTE', cliente: c1, servicio: s['Electricidad'], creada: 2,
      instanciaFormularioId: 'form-inst-1', sesionId: 'ses-1',
      eventos: [
        ['SOLICITUD_INICIADA', c1, 2],
        ['SOLICITUD_CREADA', c1, 2],
        ['SOLICITUD_RECHAZADA', juan, 1],
      ],
    });

    // 2. ACEPTADA por Carlos
    await crearSolicitud({
      detalle: 'Cambiar el tablero eléctrico del departamento',
      direccion: 'Av. Cabildo 2100, Belgrano, CABA',
      estado: 'ACEPTADA', cliente: c2, servicio: s['Electricidad'], tecnico: carlos, creada: 3, aceptada: 3,
      instanciaFormularioId: 'form-inst-2', sesionId: 'ses-2',
      eventos: [
        ['SOLICITUD_INICIADA', c2, 3],
        ['SOLICITUD_CREADA', c2, 3],
        ['SOLICITUD_ACEPTADA', carlos, 3],
      ],
    });

    // 3. EN_PROGRESO con Juan
    await crearSolicitud({
      detalle: 'Destapar la cañería del baño',
      direccion: 'Calle Gascón 850, Almagro, CABA',
      estado: 'EN_PROGRESO', cliente: c2, servicio: s['Plomería'], tecnico: juan, creada: 4, aceptada: 4,
      instanciaFormularioId: 'form-inst-3', sesionId: 'ses-3',
      eventos: [
        ['SOLICITUD_INICIADA', c2, 4],
        ['SOLICITUD_CREADA', c2, 4],
        ['SOLICITUD_ACEPTADA', juan, 4],
        ['SOLICITUD_EN_PROGRESO', juan, 2],
      ],
    });

    // 4. COMPLETADA por Diego
    await crearSolicitud({
      detalle: 'Armar un mueble de cocina a medida',
      direccion: 'Av. Santa Fe 3200, Palermo, CABA',
      estado: 'COMPLETADA', cliente: c3, servicio: s['Carpintería'], tecnico: diego, creada: 10, aceptada: 10, finalizada: 6,
      instanciaFormularioId: 'form-inst-4', sesionId: 'ses-4',
      eventos: [
        ['SOLICITUD_INICIADA', c3, 10],
        ['SOLICITUD_CREADA', c3, 10],
        ['SOLICITUD_ACEPTADA', diego, 10],
        ['SOLICITUD_EN_PROGRESO', diego, 8],
        ['SOLICITUD_COMPLETADA', diego, 6],
      ],
    });

    // 5. RECHAZADA
    await crearSolicitud({
      detalle: 'Revisar pérdida de gas en la cocina',
      direccion: 'Av. Directorio 1500, Flores, CABA',
      estado: 'RECHAZADA', cliente: c3, servicio: s['Gasista'], creada: 5,
      instanciaFormularioId: 'form-inst-5', sesionId: 'ses-5',
      eventos: [
        ['SOLICITUD_INICIADA', c3, 5],
        ['SOLICITUD_CREADA', c3, 5],
        ['SOLICITUD_RECHAZADA', carlos, 4],
      ],
    });

    // 6. CANCELADA
    await crearSolicitud({
      detalle: 'Arreglar la canilla del lavadero',
      direccion: 'Av. Corrientes 5800, Villa Crespo, CABA',
      estado: 'CANCELADA', cliente: c1, servicio: s['Plomería'], tecnico: diego, creada: 8, aceptada: 8,
      instanciaFormularioId: 'form-inst-6', sesionId: 'ses-6',
      eventos: [
        ['SOLICITUD_INICIADA', c1, 8],
        ['SOLICITUD_CREADA', c1, 8],
        ['SOLICITUD_ACEPTADA', diego, 8],
        ['SOLICITUD_CANCELADA', c1, 6],
      ],
    });

    // Eventos extra para métricas: vistas de registro y un formulario abandonado
    await prisma.evento.createMany({
      data: [
        { nombreEvento: 'VISTA_REGISTRO', fechaHora: diasAtras(3), sesionId: 'ses-visita-1' },
        { nombreEvento: 'VISTA_REGISTRO', fechaHora: diasAtras(2), sesionId: 'ses-visita-2' },
        { nombreEvento: 'VISTA_REGISTRO', fechaHora: diasAtras(1), sesionId: 'ses-visita-3' },
        // Formulario que se abrió pero nunca se envió (abandono)
        { nombreEvento: 'SOLICITUD_INICIADA', idUsuario: c1, fechaHora: diasAtras(1), sesionId: 'ses-abandono', instanciaFormularioId: 'form-abandono-1' },
      ],
    });
  }

  console.log('Seed completado con éxito');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());