const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const getPrisma = require('../lib/prisma');
const { respondWithDatabaseError } = require('../lib/errors');

const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await getPrisma().usuario.findUnique({
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

    return res.json(user);
  } catch (error) {
    return respondWithDatabaseError(
      res,
      error,
      'Error al cargar el perfil:',
      'No se pudo cargar el perfil.'
    );
  }
});

router.patch('/me', authenticate, async (req, res) => {
  try {
    const prisma = getPrisma();
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

    return res.json(user);
  } catch (error) {
    return respondWithDatabaseError(
      res,
      error,
      'Error al actualizar el perfil:',
      'No se pudo actualizar el perfil.'
    );
  }
});

module.exports = router;