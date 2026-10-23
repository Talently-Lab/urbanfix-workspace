const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

const getIdUsuario = (req) => req.user.userId;

// POST /api/solicitudes  (CLIENTE)
exports.create = async (req, res) => {
  try {
    const { detalle, idServicio } = req.body;

    if (!detalle || !idServicio) {
      return res.status(400).json({ error: 'detalle e idServicio son requeridos' });
    }
    if (!Number.isInteger(Number(idServicio))) {
      return res.status(400).json({ error: 'idServicio debe ser un número' });
    }

    const servicio = await prisma.servicio.findUnique({
      where: { idServicio: Number(idServicio) }
    });
    if (!servicio) {
      return res.status(404).json({ error: 'El servicio no existe' });
    }

    const solicitud = await prisma.solicitud.create({
      data: {
        detalle,
        idServicio: servicio.idServicio,
        idCliente: getIdUsuario(req)
      },
      include: {
        servicio: { select: { nombreServicio: true } },
        cliente: { select: { nombre: true, apellido: true, numeroTelefono: true } }
      }
    });

    res.status(201).json(solicitud);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la solicitud' });
  }
};

// GET /api/solicitudes/mias  (CLIENTE)
exports.getMias = async (req, res) => {
  try {
    const solicitudes = await prisma.solicitud.findMany({
      where: { idCliente: getIdUsuario(req) },
      include: {
        servicio: { select: { nombreServicio: true } },
        tecnico: { select: { nombre: true, apellido: true, numeroTelefono: true } }
      },
      orderBy: { fechaCreacion: 'desc' }
    });
    res.json(solicitudes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tus solicitudes' });
  }
};

// GET /api/solicitudes  (TECNICO) - disponibles
exports.getDisponibles = async (req, res) => {
  try {
    const idTecnico = getIdUsuario(req);

    const misServicios = await prisma.tecnicoServicio.findMany({
      where: { idTecnico },
      select: { idServicio: true }
    });
    const idsServicios = misServicios.map((s) => s.idServicio);

    const solicitudes = await prisma.solicitud.findMany({
      where: {
        estado: 'PENDIENTE',
        idTecnico: null,
        idServicio: { in: idsServicios },
        // no mostrar las que este técnico ya rechazó (rechazo individual, según contrato)
        eventos: {
          none: { idUsuario: idTecnico, nombreEvento: 'SOLICITUD_RECHAZADA' }
        }
      },
      include: {
        servicio: { select: { nombreServicio: true } },
        cliente: { select: { nombre: true, apellido: true } }
      },
      orderBy: { fechaCreacion: 'desc' }
    });
    res.json(solicitudes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las solicitudes disponibles' });
  }
};

// PATCH /api/solicitudes/:id/aceptar  (TECNICO)
exports.aceptar = async (req, res) => {
  try {
    const idSolicitud = Number(req.params.id);
    if (!Number.isInteger(idSolicitud) || idSolicitud < 1) {
      return res.status(400).json({ error: 'El id de la solicitud debe ser un número válido' });
    }
    const idTecnico = getIdUsuario(req);

    const solicitud = await prisma.solicitud.findUnique({ where: { idSolicitud } });
    if (!solicitud) {
      return res.status(404).json({ error: 'La solicitud no existe' });
    }

    const ofreceServicio = await prisma.tecnicoServicio.findUnique({
      where: { idTecnico_idServicio: { idTecnico, idServicio: solicitud.idServicio } }
    });
    if (!ofreceServicio) {
      return res.status(403).json({ error: 'No ofrecés el servicio de esta solicitud' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const actualizadas = await tx.solicitud.updateMany({
        where: { idSolicitud, estado: 'PENDIENTE', idTecnico: null },
        data: { estado: 'ACEPTADA', idTecnico, fechaAceptacion: new Date() }
      });
      if (actualizadas.count === 0) return null;

      await tx.evento.create({
        data: { nombreEvento: 'SOLICITUD_ACEPTADA', idUsuario: idTecnico, idSolicitud }
      });

      return tx.solicitud.findUnique({
        where: { idSolicitud },
        select: { idSolicitud: true, estado: true, idTecnico: true }
      });
    });

    if (!resultado) {
      return res.status(409).json({ error: 'La solicitud ya no está disponible' });
    }
    res.json({ mensaje: 'Solicitud aceptada', solicitud: resultado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al aceptar la solicitud' });
  }
};