const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      nombre,
      apellido,
      rol,
      numeroTelefono
    } = req.body;

    if (!email || !password || !nombre || !apellido || !rol) {
      return res.status(400).json({
        error: 'Todos los campos obligatorios son requeridos'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    const rolesValidos = ['TECNICO', 'ADMINISTRADOR', 'CLIENTE'];

    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({
        error: 'Rol inválido'
      });
    }

    const existing = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(409).json({
        error: 'El email ya está registrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const usuario = await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        apellido,
        rol,
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

    const token = jwt.sign(
      {
        userId: usuario.idUsuario,
        role: usuario.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.status(201).json({
      usuario,
      token
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};