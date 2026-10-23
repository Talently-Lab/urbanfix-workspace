const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

// GET /api/servicios  (cualquier usuario autenticado)
exports.getAll = async (req, res) => {
  try {
    const servicios = await prisma.servicio.findMany({
      select: { idServicio: true, nombreServicio: true, descripcion: true },
      orderBy: { nombreServicio: 'asc' }
    });
    res.json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los servicios' });
  }
};