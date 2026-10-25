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