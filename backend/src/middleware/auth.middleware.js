const jwt = require('jsonwebtoken');
const { respondWithDatabaseError } = require('../lib/errors');
const rolesValidos = ['CLIENTE', 'TECNICO', 'ADMINISTRADOR'];

function createAuthMiddleware(getPrisma) {
  const authenticate = async (req, res, next) => {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      return res.status(503).json({
        error: 'La autenticación no está configurada'
      });
    }

    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Token requerido'
        });
      }

      const token = authHeader.slice('Bearer '.length);
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256']
      });

      if (
        !Number.isInteger(decoded.userId) ||
        !rolesValidos.includes(decoded.role)
      ) {
        return res.status(401).json({
          error: 'Token inválido o expirado'
        });
      }

      const usuario = await getPrisma().usuario.findUnique({
        where: { idUsuario: decoded.userId },
        select: { rol: true }
      });

      if (!usuario || usuario.rol !== decoded.role) {
        return res.status(401).json({
          error: 'Token inválido o expirado'
        });
      }

      req.user = { ...decoded, role: usuario.rol };
      return next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError') {
        return res.status(401).json({
          error: 'Token inválido o expirado'
        });
      }

      return respondWithDatabaseError(
        res,
        error,
        'Error al validar el usuario autenticado:',
        'No se pudo validar la sesión. Intentá nuevamente más tarde.'
      );
    }
  };

  return { authenticate };
}

const getPrisma = require('../lib/prisma');
const { authenticate } = createAuthMiddleware(getPrisma);

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'No tenés permisos para acceder a este recurso'
      });
    }

    next();
  };
};

const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch (error) {
      req.user = null;
    }
  }

  next();
};

module.exports = {
  createAuthMiddleware,
  authenticate,
  authorize,
  optionalAuthenticate
};