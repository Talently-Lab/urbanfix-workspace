const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { authenticate } = require('../middleware/auth.middleware');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: {
        idUsuario: req.user.userId
      },
      select: {
        idUsuario: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        numeroTelefono: true,
        fechaCreacion: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

router.patch('/me', authenticate, async (req, res) => {
  try {
    const { nombre, numeroTelefono } = req.body;

    const user = await prisma.usuario.update({
      where: {
        idUsuario: req.user.userId
      },
      data: {
        nombre,
        numeroTelefono
      },
      select: {
        idUsuario: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        numeroTelefono: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;