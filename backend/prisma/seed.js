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
async function crearSolicitud({ detalle, estado, cliente, servicio, tecnico = null, creada, aceptada = null, finalizada = null, eventos }) {
  await prisma.solicitud.create({
    data: {
      detalle,
      estado,
      idCliente: cliente,
      idServicio: servicio,
      idTecnico: tecnico,
      fechaCreacion: diasAtras(creada),
      fechaAceptacion: aceptada !== null ? diasAtras(aceptada) : null,
      fechaFinalizacion: finalizada !== null ? diasAtras(finalizada) : null,
      eventos: {
        create: eventos.map(([nombreEvento, idUsuario, dias]) => ({
          nombreEvento,
          idUsuario,
          fechaHora: diasAtras(dias),
        })),
      },
    },
  });
}

async function main() {
  const hashedPass = await bcrypt.hash('password123', 12);

  // Usuarios: 1 admin, 3 clientes, 3 técnicos (todos con password123)
  await prisma.usuario.createMany({
    data: [
      { email: 'admin@urbanfix.com', password: hashedPass, nombre: 'Admin', apellido: 'UrbanFix', rol: 'ADMINISTRADOR' },
      { email: 'cliente@test.com', password: hashedPass, nombre: 'María', apellido: 'García', rol: 'CLIENTE', numeroTelefono: '1112345678' },
      { email: 'cliente2@test.com', password: hashedPass, nombre: 'Lucía', apellido: 'Fernández', rol: 'CLIENTE', numeroTelefono: '1155550001' },
      { email: 'cliente3@test.com', password: hashedPass, nombre: 'Martín', apellido: 'López', rol: 'CLIENTE', numeroTelefono: '1155550003' },
      { email: 'tecnico@test.com', password: hashedPass, nombre: 'Juan', apellido: 'Pérez', rol: 'TECNICO', numeroTelefono: '1187654321' },
      { email: 'tecnico2@test.com', password: hashedPass, nombre: 'Carlos', apellido: 'Gómez', rol: 'TECNICO', numeroTelefono: '1155550002' },
      { email: 'tecnico3@test.com', password: hashedPass, nombre: 'Diego', apellido: 'Sosa', rol: 'TECNICO', numeroTelefono: '1155550005' },
    ].map((x) => ({ ...x, usuarioDePrueba: true })),
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

  // Solicitudes (solo si todavía no hay ninguna)
  if ((await prisma.solicitud.count()) === 0) {
    const c1 = u['cliente@test.com'];
    const c2 = u['cliente2@test.com'];
    const c3 = u['cliente3@test.com'];
    const juan = u['tecnico@test.com'];
    const carlos = u['tecnico2@test.com'];
    const diego = u['tecnico3@test.com'];

    // 1. PENDIENTE con rechazo parcial (caso borde): Juan la rechazó, Carlos todavía no respondió
    await crearSolicitud({
      detalle: 'Instalar luces LED en el patio',
      estado: 'PENDIENTE', cliente: c1, servicio: s['Electricidad'], creada: 2,
      eventos: [['SOLICITUD_CREADA', c1, 2], ['SOLICITUD_RECHAZADA', juan, 1]],
    });

    // 2. ACEPTADA por Carlos
    await crearSolicitud({
      detalle: 'Cambiar el tablero eléctrico del departamento',
      estado: 'ACEPTADA', cliente: c2, servicio: s['Electricidad'], tecnico: carlos, creada: 3, aceptada: 2,
      eventos: [['SOLICITUD_CREADA', c2, 3], ['SOLICITUD_ACEPTADA', carlos, 2]],
    });

    // 3. EN_PROGRESO con Juan
    await crearSolicitud({
      detalle: 'Destapar la cañería del baño',
      estado: 'EN_PROGRESO', cliente: c2, servicio: s['Plomería'], tecnico: juan, creada: 4, aceptada: 3,
      eventos: [['SOLICITUD_CREADA', c2, 4], ['SOLICITUD_ACEPTADA', juan, 3], ['SOLICITUD_EN_PROGRESO', juan, 2]],
    });

    // 4. COMPLETADA por Diego
    await crearSolicitud({
      detalle: 'Armar un mueble de cocina a medida',
      estado: 'COMPLETADA', cliente: c3, servicio: s['Carpintería'], tecnico: diego, creada: 10, aceptada: 9, finalizada: 6,
      eventos: [
        ['SOLICITUD_CREADA', c3, 10], ['SOLICITUD_ACEPTADA', diego, 9],
        ['SOLICITUD_EN_PROGRESO', diego, 8], ['SOLICITUD_COMPLETADA', diego, 6],
      ],
    });

    // 5. RECHAZADA: Gasista lo ofrece solo Carlos y la rechazó
    await crearSolicitud({
      detalle: 'Revisar pérdida de gas en la cocina',
      estado: 'RECHAZADA', cliente: c3, servicio: s['Gasista'], creada: 5,
      eventos: [['SOLICITUD_CREADA', c3, 5], ['SOLICITUD_RECHAZADA', carlos, 4]],
    });

    // 6. CANCELADA después de ser ACEPTADA (caso borde para QA)
    await crearSolicitud({
      detalle: 'Arreglar la canilla del lavadero',
      estado: 'CANCELADA', cliente: c1, servicio: s['Plomería'], tecnico: diego, creada: 8, aceptada: 7,
      eventos: [['SOLICITUD_CREADA', c1, 8], ['SOLICITUD_ACEPTADA', diego, 7], ['SOLICITUD_CANCELADA', c1, 6]],
    });
  }

  console.log('Seed completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

