const getPrisma = require('../lib/prisma');
const { respondWithDatabaseError } = require('../lib/errors');

// GET /api/servicios  (público, no requiere token)
exports.getAll = async (req, res) => {
  try {
    const prisma = getPrisma();
    const servicios = await prisma.servicio.findMany({
      select: { idServicio: true, nombreServicio: true, descripcion: true },
      orderBy: { nombreServicio: 'asc' }
    });
    res.json({ servicios });
  } catch (error) {
    return respondWithDatabaseError(
      res,
      error,
      'Error al obtener los servicios:',
      'No se pudo cargar la lista de servicios. Intentá nuevamente más tarde.'
    );
  }
};