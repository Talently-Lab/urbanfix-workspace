const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { authenticate } = require('../middleware/auth.middleware');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

const router = express.Router();

const NOMBRE_REGEX = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;
const TELEFONO_REGEX = /^\+?[0-9\s()-]{8,20}$/;

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
    const { nombre, numeroTelefono } = req.body || {};
    const data = {};

    if (nombre !== undefined) {
      if (typeof nombre !== 'string') {
        return res.status(400).json({ error: 'El nombre debe ser texto' });
      }
      const nombreLimpio = nombre.trim();
      if (nombreLimpio.length < 2 || nombreLimpio.length > 50 || !NOMBRE_REGEX.test(nombreLimpio)) {
        return res.status(400).json({ error: 'El nombre debe tener entre 2 y 50 letras y no puede incluir números ni símbolos' });
      }
      data.nombre = nombreLimpio;
    }

    if (numeroTelefono !== undefined) {
      if (numeroTelefono === null || numeroTelefono === '') {
        data.numeroTelefono = null;
      } else {
        if (typeof numeroTelefono !== 'string') {
          return res.status(400).json({ error: 'El número de teléfono debe ser texto' });
        }
        const telefonoLimpio = numeroTelefono.trim();
        if (!TELEFONO_REGEX.test(telefonoLimpio)) {
          return res.status(400).json({ error: 'El número de teléfono no es válido' });
        }
        data.numeroTelefono = telefonoLimpio;
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Debés enviar al menos un campo para actualizar (nombre o numeroTelefono)' });
    }

    const user = await prisma.usuario.update({
      where: {
        idUsuario: req.user.userId
      },
      data,
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
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    console.error(error);

    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;