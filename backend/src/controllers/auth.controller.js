const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const NOMBRE_REGEX = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;
const esTexto = (valor) => typeof valor === 'string';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// REGISTRO DE USUARIOS
exports.register = async (req, res) => {
  try {
    const { email, password, nombre, apellido, rol, numeroTelefono, idServicios } = req.body;

    if (![email, password, nombre, apellido, rol].every(esTexto)) {
      return res.status(400).json({ error: 'Email, contraseña, nombre, apellido y rol son obligatorios y deben ser texto' });
    }

    const nombreLimpio = nombre.trim();
    const apellidoLimpio = apellido.trim();

    if (nombreLimpio.length < 2 || nombreLimpio.length > 50 || !NOMBRE_REGEX.test(nombreLimpio)) {
      return res.status(400).json({ error: 'El nombre debe tener entre 2 y 50 letras y no puede incluir números ni símbolos' });
    }

    if (apellidoLimpio.length < 2 || apellidoLimpio.length > 50 || !NOMBRE_REGEX.test(apellidoLimpio)) {
      return res.status(400).json({ error: 'El apellido debe tener entre 2 y 50 letras y no puede incluir números ni símbolos' });
    }

    let telefonoLimpio = null;
    if (numeroTelefono !== undefined && numeroTelefono !== null && numeroTelefono !== '') {
      if (!esTexto(numeroTelefono)) {
        return res.status(400).json({ error: 'El número de teléfono debe ser texto' });
      }
      telefonoLimpio = numeroTelefono.trim();
      if (!/^\+?[0-9\s()-]{8,20}$/.test(telefonoLimpio)) {
        return res.status(400).json({ error: 'El número de teléfono no es válido' });
      }
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }
    
    if (Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ error: 'La contraseña es demasiado larga (máximo 72 caracteres)' });
    }

    const rolesValidos = ['TECNICO', 'CLIENTE'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailNormalizado = email.trim().toLowerCase();
    if (!emailRegex.test(emailNormalizado)) {
      return res.status(400).json({ error: 'El formato del email no es válido' });
    }

    const existing = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });
    if (existing) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    let usuario = {};

    if (rol === 'TECNICO') {
      
      if (!Array.isArray(idServicios) || idServicios.length === 0) {
        return res.status(400).json({ error: 'El técnico debe ofrecer al menos un servicio' });
      }

      if (idServicios.length > 50) {
        return res.status(400).json({ error: 'No se pueden indicar más de 50 servicios' });
      }

      if (!idServicios.every((id) => Number.isInteger(id) && id >= 1 && id <= 2147483647)) {
        return res.status(400).json({ error: 'Los IDs de servicios deben ser números enteros válidos' });
      }

      const idServiciosUnicos = [...new Set(idServicios)];

      const servicios = await prisma.servicio.findMany({
        where: { idServicio: { in: idServiciosUnicos } },
      });

      if (servicios.length !== idServiciosUnicos.length) {
        return res.status(400).json({ error: 'Uno o más servicios no existen' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      
      usuario = await prisma.$transaction(async (tx) => {
        const nuevoUsuario = await tx.usuario.create({
          data: {
            email: emailNormalizado,
            password: hashedPassword,
            nombre: nombreLimpio,
            apellido: apellidoLimpio,
            rol,
            numeroTelefono,
          },
          select: {
            idUsuario: true,
            email: true,
            nombre: true,
            apellido: true,
            rol: true,
            numeroTelefono: true,
          },
        });

        await tx.tecnicoServicio.createMany({
          data: idServiciosUnicos.map((idServicio) => ({
            idTecnico: nuevoUsuario.idUsuario,
            idServicio,
          })),
        });

        return nuevoUsuario;
      });
    } else { //rol: CLIENTE
      const hashedPassword = await bcrypt.hash(password, 12);
      usuario = await prisma.usuario.create({
        data: {
          email: emailNormalizado,
          password: hashedPassword,
          nombre: nombreLimpio,
          apellido: apellidoLimpio,
          rol,
          numeroTelefono,
        },
        select: {
          idUsuario: true,
          email: true,
          nombre: true,
          apellido: true,
          rol: true,
          numeroTelefono: true,
        },
      });
    }

    const token = jwt.sign(
      { userId: usuario.idUsuario, role: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ usuario, token });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// INICIO DE SESIÓN
exports.login = async (req, res) => {
  try {
    const { email, password, sesionId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    if (sesionId !== undefined && sesionId !== null && (typeof sesionId !== 'string' || sesionId.length > 100)) {
      return res.status(400).json({ error: 'sesionId debe ser texto de hasta 100 caracteres' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Actualiza último login y registra el evento LOGIN_EXITOSO con sesionId
    await prisma.$transaction([
      prisma.usuario.update({
        where: { idUsuario: usuario.idUsuario },
        data: { ultimoLogin: new Date() },
      }),
      prisma.evento.create({
        data: {
          nombreEvento: 'LOGIN_EXITOSO',
          idUsuario: usuario.idUsuario,
          sesionId: sesionId || null,
        },
      }),
    ]);

    const token = jwt.sign(
      { userId: usuario.idUsuario, role: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      usuario: {
        idUsuario: usuario.idUsuario,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        numeroTelefono: usuario.numeroTelefono,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ==========================================
// OBTENER PERFIL ACTUAL
// ==========================================
exports.me = async (req, res) => {
  try {
    const idUsuario = req.user ? req.user.userId : null;

    if (!idUsuario) {
      return res.status(401).json({ error: 'token ausente o inválido' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { idUsuario },
    });

    res.json({
      usuario: {
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};