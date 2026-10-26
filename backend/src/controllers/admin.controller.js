const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

// GET /api/admin/usuarios  (ADMINISTRADOR)
exports.getUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        idUsuario: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        fechaCreacion: true
      },
      orderBy: [{ fechaCreacion: 'desc' }, { idUsuario: 'desc' }]
    });
    res.json({ usuarios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};


const ESTADOS = ['PENDIENTE', 'ACEPTADA', 'EN_PROGRESO', 'COMPLETADA', 'RECHAZADA', 'CANCELADA'];

// GET /api/admin/solicitudes?estado=PENDIENTE  (ADMINISTRADOR)
exports.getSolicitudes = async (req, res) => {
  try {
    const { estado } = req.query;
    let where = {};

    if (estado !== undefined) {
      const estadoNormalizado = String(estado).toUpperCase();
      if (!ESTADOS.includes(estadoNormalizado)) {
        return res.status(400).json({
          error: `El estado no es válido. Valores permitidos: ${ESTADOS.join(', ')}`
        });
      }
      where = { estado: estadoNormalizado };
    }

    const solicitudes = await prisma.solicitud.findMany({
      where,
      select: {
        idSolicitud: true,
        detalle: true,
        estado: true,
        fechaCreacion: true,
        fechaAceptacion: true,
        fechaFinalizacion: true,
        servicio: { select: { idServicio: true, nombreServicio: true } },
        cliente: { select: { idUsuario: true, nombre: true, apellido: true, email: true } },
        tecnico: { select: { idUsuario: true, nombre: true, apellido: true, email: true } }
      },
      orderBy: [{ fechaCreacion: 'desc' }, { idSolicitud: 'desc' }]
    });

    res.json({ solicitudes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las solicitudes' });
  }
};

// PATCH /api/admin/solicitudes/:id/cancelar  (ADMINISTRADOR)
exports.cancelarSolicitud = async (req, res) => {
  try {
    const idSolicitud = Number(req.params.id);
    if (!Number.isInteger(idSolicitud) || idSolicitud < 1) {
      return res.status(400).json({ error: 'El id de la solicitud debe ser un número válido' });
    }

    const solicitud = await prisma.solicitud.findUnique({ where: { idSolicitud } });
    if (!solicitud) {
      return res.status(404).json({ error: 'La solicitud no existe' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const actualizadas = await tx.solicitud.updateMany({
        where: { idSolicitud, estado: { in: ['PENDIENTE', 'ACEPTADA'] } },
        data: { estado: 'CANCELADA' }
      });
      if (actualizadas.count === 0) return null;

      await tx.evento.create({
        data: {
          nombreEvento: 'SOLICITUD_CANCELADA',
          idUsuario: req.user.userId,
          idSolicitud
        }
      });

      return tx.solicitud.findUnique({
        where: { idSolicitud },
        select: { idSolicitud: true, estado: true }
      });
    });

    if (!resultado) {
      return res.status(409).json({ error: 'La solicitud no se puede cancelar en su estado actual' });
    }
    res.json({ mensaje: 'Solicitud cancelada', solicitud: resultado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cancelar la solicitud' });
  }
};