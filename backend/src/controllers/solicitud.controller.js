const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

const getIdUsuario = (req) => req.user.userId;

// POST /api/solicitudes  (CLIENTE)
exports.create = async (req, res) => {
  try {
    const { detalle, idServicio } = req.body;

    if (!detalle || !idServicio) {
      return res.status(400).json({ error: 'detalle e idServicio son requeridos' });
    }
    if (!Number.isInteger(Number(idServicio))) {
      return res.status(400).json({ error: 'idServicio debe ser un número' });
    }

    const servicio = await prisma.servicio.findUnique({
      where: { idServicio: Number(idServicio) }
    });
    if (!servicio) {
      return res.status(404).json({ error: 'El servicio no existe' });
    }

    const solicitud = await prisma.$transaction(async (tx) => {
      const nueva = await tx.solicitud.create({
        data: {
          detalle,
          idServicio: servicio.idServicio,
          idCliente: getIdUsuario(req)
        },
        include: {
          servicio: { select: { nombreServicio: true } },
          cliente: { select: { nombre: true, apellido: true, numeroTelefono: true } }
        }
      });

      await tx.evento.create({
        data: {
          nombreEvento: 'SOLICITUD_CREADA',
          idUsuario: getIdUsuario(req),
          idSolicitud: nueva.idSolicitud
        }
      });

      return nueva;
    });

    res.status(201).json(solicitud);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la solicitud' });
  }
};

// GET /api/solicitudes/mias  (CLIENTE)
exports.getMias = async (req, res) => {
  try {
    const solicitudes = await prisma.solicitud.findMany({
      where: { idCliente: getIdUsuario(req) },
      include: {
        servicio: { select: { nombreServicio: true } },
        tecnico: { select: { nombre: true, apellido: true, numeroTelefono: true } }
      },
      orderBy: { fechaCreacion: 'desc' }
    });
    res.json(solicitudes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tus solicitudes' });
  }
};

// GET /api/solicitudes  (TECNICO) - disponibles
exports.getDisponibles = async (req, res) => {
  try {
    const idTecnico = getIdUsuario(req);

    const misServicios = await prisma.tecnicoServicio.findMany({
      where: { idTecnico },
      select: { idServicio: true }
    });
    const idsServicios = misServicios.map((s) => s.idServicio);

    const solicitudes = await prisma.solicitud.findMany({
      where: {
        estado: 'PENDIENTE',
        idTecnico: null,
        idServicio: { in: idsServicios },
        // no mostrar las que este técnico ya rechazó (rechazo individual, según contrato)
        eventos: {
          none: { idUsuario: idTecnico, nombreEvento: 'SOLICITUD_RECHAZADA' }
        }
      },
      include: {
        servicio: { select: { nombreServicio: true } },
        cliente: { select: { nombre: true, apellido: true } }
      },
      orderBy: { fechaCreacion: 'desc' }
    });
    res.json(solicitudes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las solicitudes disponibles' });
  }
};

// PATCH /api/solicitudes/:id/aceptar  (TECNICO)
exports.aceptar = async (req, res) => {
  try {
    const idSolicitud = Number(req.params.id);
    if (!Number.isInteger(idSolicitud) || idSolicitud < 1) {
      return res.status(400).json({ error: 'El id de la solicitud debe ser un número válido' });
    }
    const idTecnico = getIdUsuario(req);

    const solicitud = await prisma.solicitud.findUnique({ where: { idSolicitud } });
    if (!solicitud) {
      return res.status(404).json({ error: 'La solicitud no existe' });
    }

    const ofreceServicio = await prisma.tecnicoServicio.findUnique({
      where: { idTecnico_idServicio: { idTecnico, idServicio: solicitud.idServicio } }
    });
    if (!ofreceServicio) {
      return res.status(403).json({ error: 'No ofrecés el servicio de esta solicitud' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const actualizadas = await tx.solicitud.updateMany({
        where: { idSolicitud, estado: 'PENDIENTE', idTecnico: null },
        data: { estado: 'ACEPTADA', idTecnico, fechaAceptacion: new Date() }
      });
      if (actualizadas.count === 0) return null;

      await tx.evento.create({
        data: { nombreEvento: 'SOLICITUD_ACEPTADA', idUsuario: idTecnico, idSolicitud }
      });

      return tx.solicitud.findUnique({
        where: { idSolicitud },
        select: { idSolicitud: true, estado: true, idTecnico: true }
      });
    });

    if (!resultado) {
      return res.status(409).json({ error: 'La solicitud ya no está disponible' });
    }
    res.json({ mensaje: 'Solicitud aceptada', solicitud: resultado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al aceptar la solicitud' });
  }
};

// PATCH /api/solicitudes/:id/rechazar  (TECNICO)
exports.rechazar = async (req, res) => {
  try {
    const idSolicitud = Number(req.params.id);
    if (!Number.isInteger(idSolicitud) || idSolicitud < 1) {
      return res.status(400).json({ error: 'El id de la solicitud debe ser un número válido' });
    }
    const idTecnico = getIdUsuario(req);

    const solicitud = await prisma.solicitud.findUnique({ where: { idSolicitud } });
    if (!solicitud) {
      return res.status(404).json({ error: 'La solicitud no existe' });
    }

    const ofreceServicio = await prisma.tecnicoServicio.findUnique({
      where: { idTecnico_idServicio: { idTecnico, idServicio: solicitud.idServicio } }
    });
    if (!ofreceServicio) {
      return res.status(403).json({ error: 'No ofrecés el servicio de esta solicitud' });
    }

    if (solicitud.estado !== 'PENDIENTE') {
      return res.status(409).json({ error: 'La solicitud ya no está pendiente' });
    }

    const yaRechazo = await prisma.evento.findFirst({
      where: { idSolicitud, idUsuario: idTecnico, nombreEvento: 'SOLICITUD_RECHAZADA' }
    });
    if (yaRechazo) {
      return res.status(409).json({ error: 'Ya rechazaste esta solicitud' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      await tx.evento.create({
        data: { nombreEvento: 'SOLICITUD_RECHAZADA', idUsuario: idTecnico, idSolicitud }
      });

      const elegibles = await tx.tecnicoServicio.count({
        where: { idServicio: solicitud.idServicio }
      });
      const rechazos = await tx.evento.count({
        where: { idSolicitud, nombreEvento: 'SOLICITUD_RECHAZADA' }
      });

      if (rechazos >= elegibles) {
        await tx.solicitud.updateMany({
          where: { idSolicitud, estado: 'PENDIENTE' },
          data: { estado: 'RECHAZADA' }
        });
      }

      return tx.solicitud.findUnique({
        where: { idSolicitud },
        select: { idSolicitud: true, estado: true }
      });
    });

    res.json({ mensaje: 'Rechazo registrado', solicitud: resultado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al rechazar la solicitud' });
  }
};

// GET /api/solicitudes/asignadas  (TECNICO)
exports.getAsignadas = async (req, res) => {
  try {
    const solicitudes = await prisma.solicitud.findMany({
      where: { idTecnico: getIdUsuario(req) },
      select: {
        idSolicitud: true,
        detalle: true,
        direccion: true,
        estado: true,
        fechaCreacion: true,
        fechaAceptacion: true,
        fechaFinalizacion: true,
        servicio: { select: { idServicio: true, nombreServicio: true } },
        cliente: { select: { idUsuario: true, nombre: true, apellido: true, numeroTelefono: true } }
      },
      orderBy: { fechaAceptacion: 'desc' }
    });
    res.json({ solicitudes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tus solicitudes asignadas' });
  }
};

// PATCH /api/solicitudes/:id/iniciar  (TECNICO asignado)
exports.iniciar = async (req, res) => {
  try {
    const idSolicitud = Number(req.params.id);
    if (!Number.isInteger(idSolicitud) || idSolicitud < 1) {
      return res.status(400).json({ error: 'El id de la solicitud debe ser un número válido' });
    }
    const idTecnico = getIdUsuario(req);

    const solicitud = await prisma.solicitud.findUnique({ where: { idSolicitud } });
    if (!solicitud) {
      return res.status(404).json({ error: 'La solicitud no existe' });
    }
    if (solicitud.idTecnico !== idTecnico) {
      return res.status(403).json({ error: 'La solicitud no está asignada al técnico indicado' });
    }


    const resultado = await prisma.$transaction(async (tx) => {
      const actualizadas = await tx.solicitud.updateMany({
        where: { idSolicitud, idTecnico, estado: 'ACEPTADA' },
        data: { estado: 'EN_PROGRESO' }
      });
      if (actualizadas.count === 0) return null;

      await tx.evento.create({
        data: { nombreEvento: 'SOLICITUD_EN_PROGRESO', idUsuario: idTecnico, idSolicitud }
      });

      return tx.solicitud.findUnique({
        where: { idSolicitud },
        select: { idSolicitud: true, estado: true }
      });
    });

    if (!resultado) {
      return res.status(409).json({ error: 'La solicitud no está en estado ACEPTADA' });
    }
    res.json({ mensaje: 'Solicitud en progreso', solicitud: resultado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar la solicitud' });
  }
};

// PATCH /api/solicitudes/:id/completar  (TECNICO asignado)
exports.completar = async (req, res) => {
  try {
    const idSolicitud = Number(req.params.id);
    if (!Number.isInteger(idSolicitud) || idSolicitud < 1) {
      return res.status(400).json({ error: 'El id de la solicitud debe ser un número válido' });
    }
    const idTecnico = getIdUsuario(req);

    const solicitud = await prisma.solicitud.findUnique({ where: { idSolicitud } });
    if (!solicitud) {
      return res.status(404).json({ error: 'La solicitud no existe' });
    }
    if (solicitud.idTecnico !== idTecnico) {
      return res.status(403).json({ error: 'La solicitud no está asignada al técnico indicado' });
    }


    const resultado = await prisma.$transaction(async (tx) => {
      const actualizadas = await tx.solicitud.updateMany({
        where: { idSolicitud, idTecnico, estado: 'EN_PROGRESO' },
        data: { estado: 'COMPLETADA', fechaFinalizacion: new Date() }
      });
      if (actualizadas.count === 0) return null;

      await tx.evento.create({
        data: { nombreEvento: 'SOLICITUD_COMPLETADA', idUsuario: idTecnico, idSolicitud }
      });

      return tx.solicitud.findUnique({
        where: { idSolicitud },
        select: { idSolicitud: true, estado: true, fechaFinalizacion: true }
      });
    });

    if (!resultado) {
      return res.status(409).json({ error: 'La solicitud no está en estado EN_PROGRESO' });
    }
    res.json({ mensaje: 'Solicitud completada', solicitud: resultado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al completar la solicitud' });
  }
};

// PATCH /api/solicitudes/:id/cancelar  (CLIENTE dueño o TECNICO asignado)
exports.cancelar = async (req, res) => {
  try {
    const idSolicitud = Number(req.params.id);
    if (!Number.isInteger(idSolicitud) || idSolicitud < 1) {
      return res.status(400).json({ error: 'El id de la solicitud debe ser un número válido' });
    }
    const idUsuario = getIdUsuario(req);

    const solicitud = await prisma.solicitud.findUnique({ where: { idSolicitud } });
    if (!solicitud) {
      return res.status(404).json({ error: 'La solicitud no existe' });
    }

    const esDuenio = solicitud.idCliente === idUsuario;
    const esTecnicoAsignado = solicitud.idTecnico === idUsuario;
    if (!esDuenio && !esTecnicoAsignado) {
      return res.status(403).json({ error: 'No sos parte de esta solicitud' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const actualizadas = await tx.solicitud.updateMany({
        where: { idSolicitud, estado: { in: ['PENDIENTE', 'ACEPTADA'] } },
        data: { estado: 'CANCELADA' }
      });
      if (actualizadas.count === 0) return null;

      await tx.evento.create({
        data: { nombreEvento: 'SOLICITUD_CANCELADA', idUsuario, idSolicitud }
      });

      return tx.solicitud.findUnique({
        where: { idSolicitud },
        select: { idSolicitud: true, estado: true }
      });
    });

    if (!resultado) {
      return res.status(409).json({ error: 'La solicitud no se puede cancelar en su estado actual' });
    }
    res.json({ mensaje: 'Solicitud cancelada', solicitud: resultado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cancelar la solicitud' });
  }
};

// GET /api/solicitudes/:id  (CLIENTE dueño, TECNICO asignado o elegible, ADMINISTRADOR)
exports.getById = async (req, res) => {
  try {
    const idSolicitud = Number(req.params.id);
    if (!Number.isInteger(idSolicitud) || idSolicitud < 1) {
      return res.status(400).json({ error: 'El id de la solicitud debe ser un número válido' });
    }
    const idUsuario = getIdUsuario(req);
    const rol = req.user.role;

    const solicitud = await prisma.solicitud.findUnique({
      where: { idSolicitud },
      include: {
        servicio: { select: { idServicio: true, nombreServicio: true } },
        cliente: { select: { idUsuario: true, nombre: true } },
        tecnico: { select: { idUsuario: true, nombre: true } }
      }
    });
    if (!solicitud) {
      return res.status(404).json({ error: 'La solicitud no existe' });
    }

    let autorizado = false;
    if (rol === 'ADMINISTRADOR') {
      autorizado = true;
    } else if (rol === 'CLIENTE') {
      autorizado = solicitud.idCliente === idUsuario;
    } else if (rol === 'TECNICO') {
      if (solicitud.idTecnico === idUsuario) {
        autorizado = true;
      } else {
        const ofreceServicio = await prisma.tecnicoServicio.findUnique({
          where: { idTecnico_idServicio: { idTecnico: idUsuario, idServicio: solicitud.idServicio } }
        });
        autorizado = !!ofreceServicio;
      }
    }
    if (!autorizado) {
      return res.status(403).json({ error: 'No tenés permiso para ver esta solicitud' });
    }

    const [tecnicosQueRechazaron, tecnicosElegibles] = await Promise.all([
      prisma.evento.count({ where: { idSolicitud, nombreEvento: 'SOLICITUD_RECHAZADA' } }),
      prisma.tecnicoServicio.count({ where: { idServicio: solicitud.idServicio } })
    ]);

    res.json({
      solicitud: {
        idSolicitud: solicitud.idSolicitud,
        detalle: solicitud.detalle,
        direccion: solicitud.direccion,
        estado: solicitud.estado,
        servicio: solicitud.servicio,
        cliente: solicitud.cliente,
        tecnico: solicitud.tecnico,
        fechaCreacion: solicitud.fechaCreacion,
        fechaAceptacion: solicitud.fechaAceptacion,
        fechaFinalizacion: solicitud.fechaFinalizacion,
        rechazos: { tecnicosQueRechazaron, tecnicosElegibles }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la solicitud' });
  }
};
