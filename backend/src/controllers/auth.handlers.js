const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { respondWithDatabaseError } = require('../lib/errors');

const rolesDeRegistro = ['TECNICO', 'CLIENTE'];
const usuarioPublico = {
  idUsuario: true,
  email: true,
  nombre: true,
  apellido: true,
  rol: true,
  numeroTelefono: true
};

function createAuthHandlers(prisma) {
  const getPrisma = typeof prisma === 'function' ? prisma : () => prisma;

  const register = async (req, res) => {
    try {
      const {
        email,
        password,
        nombre,
        apellido,
        rol,
        numeroTelefono,
        idServicios
      } = req.body || {};

      if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        typeof nombre !== 'string' ||
        typeof apellido !== 'string' ||
        !email.trim() ||
        !password ||
        !nombre.trim() ||
        !apellido.trim() ||
        !rol
      ) {
        return res.status(400).json({
          error: 'Todos los campos obligatorios son requeridos'
        });
      }

      const emailNormalizado = email.trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
        return res.status(400).json({
          error: 'El email no es válido'
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          error: 'La contraseña debe tener al menos 8 caracteres'
        });
      }

      if (!rolesDeRegistro.includes(rol)) {
        return res.status(400).json({
          error: 'Rol inválido'
        });
      }

      const serviciosTecnico = rol === 'TECNICO';
      if (
        (serviciosTecnico &&
          (!Array.isArray(idServicios) ||
            idServicios.length === 0 ||
            idServicios.some((id) => !Number.isInteger(id) || id <= 0) ||
            new Set(idServicios).size !== idServicios.length)) ||
        (!serviciosTecnico && idServicios !== undefined)
      ) {
        return res.status(400).json({
          error: serviciosTecnico
            ? 'Seleccioná al menos un servicio válido'
            : 'Los clientes no deben enviar servicios'
        });
      }

      if (
        numeroTelefono !== undefined &&
        numeroTelefono !== null &&
        typeof numeroTelefono !== 'string'
      ) {
        return res.status(400).json({
          error: 'El teléfono no es válido'
        });
      }

      const db = getPrisma();
      const hashedPassword = await bcrypt.hash(password, 12);
      const usuario = await db.$transaction(async (transaction) => {
        const existing = await transaction.usuario.findUnique({
          where: { email: emailNormalizado },
          select: { idUsuario: true }
        });

        if (existing) {
          return null;
        }

        return transaction.usuario.create({
          data: {
            email: emailNormalizado,
            password: hashedPassword,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            rol,
            numeroTelefono: numeroTelefono?.trim() || null,
            ...(serviciosTecnico && {
              serviciosOfrecidos: {
                create: idServicios.map((idServicio) => ({
                  servicio: { connect: { idServicio } }
                }))
              }
            })
          },
          select: usuarioPublico
        });
      });

      if (!usuario) {
        return res.status(409).json({
          error: 'El email ya está registrado'
        });
      }

      return res.status(201).json({
        mensaje: 'Usuario creado correctamente',
        usuario
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          error: 'El email ya está registrado'
        });
      }

      if (error.code === 'P2025' || error.code === 'P2003') {
        return res.status(400).json({
          error: 'Uno o más servicios seleccionados no existen'
        });
      }

      return respondWithDatabaseError(
        res,
        error,
        'Error al registrar usuario:',
        'No se pudo completar el registro. Intentá nuevamente más tarde.'
      );
    }
  };

  const login = async (req, res) => {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      return res.status(503).json({
        error: 'La autenticación no está configurada'
      });
    }

    try {
      const { email, password } = req.body || {};

      if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        !email.trim() ||
        !password
      ) {
        return res.status(400).json({
          error: 'Email y contraseña son requeridos'
        });
      }

      const db = getPrisma();
      const usuario = await db.usuario.findUnique({
        where: { email: email.trim().toLowerCase() }
      });

      if (!usuario) {
        return res.status(401).json({
          error: 'Email o contraseña incorrectos'
        });
      }

      const passwordValida = await bcrypt.compare(password, usuario.password);
      if (!passwordValida) {
        return res.status(401).json({
          error: 'Email o contraseña incorrectos'
        });
      }

      await db.$transaction([
        db.usuario.update({
          where: { idUsuario: usuario.idUsuario },
          data: { ultimoLogin: new Date() }
        }),
        db.evento.create({
          data: {
            nombreEvento: 'LOGIN_EXITOSO',
            idUsuario: usuario.idUsuario
          }
        })
      ]);


      const token = jwt.sign(
        {
          userId: usuario.idUsuario,
          role: usuario.rol
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        usuario: {
          idUsuario: usuario.idUsuario,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rol: usuario.rol,
          numeroTelefono: usuario.numeroTelefono
        },
        token
      });
    } catch (error) {
      return respondWithDatabaseError(
        res,
        error,
        'Error al iniciar sesión:',
        'No se pudo validar el acceso. Intentá nuevamente más tarde.'
      );
    }
  };

  const me = async (req, res) => {
    try {
      const db = getPrisma();
      const usuario = await db.usuario.findUnique({
        where: { idUsuario: req.user.userId },
        select: usuarioPublico
      });

      if (!usuario) {
        return res.status(401).json({
          error: 'La sesión ya no es válida'
        });
      }

      return res.json({ usuario });
    } catch (error) {
      return respondWithDatabaseError(
        res,
        error,
        'Error al validar la sesión:',
        'No se pudo validar la sesión. Intentá nuevamente más tarde.'
      );
    }
  };

  return { register, login, me };
}

module.exports = { createAuthHandlers };
