const getPrisma = require('../lib/prisma');
const { respondWithDatabaseError } = require('../lib/errors');

// GET /api/tecnicos/me/servicios  (TECNICO)
exports.getMisServicios = async (req, res) => {
  try {
    const prisma = getPrisma();
    const relaciones = await prisma.tecnicoServicio.findMany({
      where: { idTecnico: req.user.userId },
      select: {
        servicio: { select: { idServicio: true, nombreServicio: true } }
      }
    });
    res.json({ servicios: relaciones.map((r) => r.servicio) });
  } catch (error) {
    return respondWithDatabaseError(
      res,
      error,
      'Error al obtener tus servicios:',
      'No se pudo cargar tus servicios. Intentá nuevamente más tarde.'
    );
  }
};

// GET /api/servicios/:id/tecnicos  (ADMINISTRADOR)
exports.getTecnicosPorServicio = async (req, res) => {
  try {
    const prisma = getPrisma();
    const idServicio = Number(req.params.id);
    if (!Number.isInteger(idServicio) || idServicio < 1) {
      return res.status(400).json({ error: 'El id del servicio debe ser un número válido' });
    }

    const servicio = await prisma.servicio.findUnique({ where: { idServicio } });
    if (!servicio) {
      return res.status(404).json({ error: 'El servicio no existe' });
    }

    const relaciones = await prisma.tecnicoServicio.findMany({
      where: { idServicio },
      select: {
        tecnico: { select: { idUsuario: true, nombre: true, apellido: true } }
      }
    });
    res.json({ tecnicos: relaciones.map((r) => r.tecnico) });
  } catch (error) {
    return respondWithDatabaseError(
      res,
      error,
      'Error al obtener los técnicos del servicio:',
      'No se pudo cargar los técnicos del servicio. Intentá nuevamente más tarde.'
    );
  }
};