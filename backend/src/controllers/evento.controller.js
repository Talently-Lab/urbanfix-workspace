const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

const EVENTOS_DEL_FRONT = ['VISTA_LOGIN', 'VISTA_REGISTRO', 'SOLICITUD_INICIADA'];

// POST /api/eventos  (público, con autenticación opcional)
exports.crear = async (req, res) => {
  try {
    const { nombreEvento, sesionId, instanciaFormularioId } = req.body;

    if (!EVENTOS_DEL_FRONT.includes(nombreEvento)) {
      return res.status(400).json({ error: 'Evento inválido' });
    }

    for (const valor of [sesionId, instanciaFormularioId]) {
      if (valor !== undefined && valor !== null && (typeof valor !== 'string' || valor.length > 100)) {
        return res.status(400).json({
          error: 'sesionId e instanciaFormularioId deben ser texto de hasta 100 caracteres'
        });
      }
    }

    const idUsuario = req.user ? req.user.userId : null;

    if (nombreEvento === 'SOLICITUD_INICIADA') {
      if (!req.user || req.user.role !== 'CLIENTE') {
        return res.status(403).json({ error: 'Solo un cliente puede iniciar una solicitud' });
      }
      if (!instanciaFormularioId) {
        return res.status(400).json({ error: 'instanciaFormularioId es requerido' });
      }
    }

    await prisma.evento.create({
      data: {
        nombreEvento,
        idUsuario,
        sesionId: sesionId || null,
        instanciaFormularioId: instanciaFormularioId || null
      }
    });

    res.status(201).json({ mensaje: 'Evento registrado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el evento' });
  }
};