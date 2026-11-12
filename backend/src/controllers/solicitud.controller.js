const getPrisma = require('../lib/prisma');
const { respondWithDatabaseError } = require('../lib/errors');

const getIdUsuario = (req) => req.user.userId;

// POST /api/solicitudes  (CLIENTE)
exports.create = async (req, res) => {
  try {
    const {
      titulo,
      detalle,
      idServicio,
      direccion,
      instanciaFormularioId
    } = req.body ?? {};

    if (typeof titulo !== 'string' || !titulo.trim()) {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }
    if (titulo.trim().length > 100) {
      return res.status(400).json({ error: 'El título no puede superar los 100 caracteres' });
    }
    if (typeof detalle !== 'string' || !detalle.trim()) {
      return res.status(400).json({ error: 'El detalle es obligatorio' });
    }
    if (detalle.trim().length > 1000) {
      return res.status(400).json({ error: 'El detalle no puede superar los 1000 caracteres' });
    }
    const idServicioNormalizado = Number(idServicio);
    if (!Number.isInteger(idServicioNormalizado) || idServicioNormalizado < 1) {
      return res.status(400).json({ error: 'idServicio debe ser un número entero positivo' });
    }
    if (typeof direccion !== 'string' || !direccion.trim()) {
      return res.status(400).json({ error: 'La dirección es obligatoria' });
    }
    if (direccion.trim().length > 200) {
      return res.status(400).json({ error: 'La dirección no puede superar los 200 caracteres' });
    }
    if (
      instanciaFormularioId !== undefined &&
      (typeof instanciaFormularioId !== 'string' || instanciaFormularioId.length > 100)
    ) {
      return res.status(400).json({ error: 'instanciaFormularioId debe ser texto de hasta 100 caracteres' });
    }

    const prisma = getPrisma();
    const servicio = await prisma.servicio.findUnique({
      where: { idServicio: idServicioNormalizado }
    });
    if (!servicio) {
      return res.status(404).json({ error: 'El servicio no existe' });
    }

    const solicitud = await prisma.$transaction(async (tx) => {
      const nueva = await tx.solicitud.create({
        data: {
          titulo: titulo.trim(),
          detalle: detalle.trim(),
          direccion: direccion.trim(),
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
          idSolicitud: nueva.idSolicitud,
          instanciaFormularioId: instanciaFormularioId || null
        }
      });

      return nueva;
    });

    res.status(201).json(solicitud);
  } catch (error) {
    return respondWithDatabaseError(
      res,
      error,
      'Error al crear la solicitud:',
      'No se pudo crear la solicitud. Intentá nuevamente más tarde.'
    );
  }
};

// GET /api/solicitudes/mias  (CLIENTE)
exports.getMias = async (req, res) => {
  try {
    const prisma = getPrisma();
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
    return respondWithDatabaseError(
      res,
      error,
      'Error al obtener tus solicitudes:',
      'No se pudo cargar tus solicitudes. Intentá nuevamente más tarde.'
    );
  }
};

// GET /api/solicitudes  (TECNICO) - disponibles
exports.getDisponibles = async (req, res) => {
  try {
    const prisma = getPrisma();
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
    return respondWithDatabaseError(
      res,
      error,
      'Error al obtener las solicitudes disponibles:',
      'No se pudo cargar las solicitudes disponibles. Intentá nuevamente más tarde.'
    );
  }
};

// PATCH /api/solicitudes/:id/aceptar  (TECNICO)
exports.aceptar = async (req, res) => {
  try {
    const prisma = getPrisma();
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
    return respondWithDatabaseError(
      res,
      error,
      'Error al aceptar la solicitud:',
      'No se pudo aceptar la solicitud. Intentá nuevamente más tarde.'
    );
  }
};

// PATCH /api/solicitudes/:id/rechazar  (TECNICO)
exports.rechazar = async (req, res) => {
  try {
    const prisma = getPrisma();
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
    return respondWithDatabaseError(
      res,
      error,
      'Error al rechazar la solicitud:',
      'No se pudo rechazar la solicitud. Intentá nuevamente más tarde.'
    );
  }
};

// GET /api/solicitudes/asignadas  (TECNICO)
exports.getAsignadas = async (req, res) => {
  try {
    const prisma = getPrisma();
    const solicitudes = await prisma.solicitud.findMany({
      where: { idTecnico: getIdUsuario(req) },
      select: {
        idSolicitud: true,
        titulo: true,
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
    return respondWithDatabaseError(
      res,
      error,
      'Error al obtener tus solicitudes asignadas:',
      'No se pudo cargar tus solicitudes asignadas. Intentá nuevamente más tarde.'
    );
  }
};

// PATCH /api/solicitudes/:id/iniciar  (TECNICO asignado)
exports.iniciar = async (req, res) => {
  try {
    const prisma = getPrisma();
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
    return respondWithDatabaseError(
      res,
      error,
      'Error al iniciar la solicitud:',
      'No se pudo iniciar la solicitud. Intentá nuevamente más tarde.'
    );
  }
};

// PATCH /api/solicitudes/:id/completar  (TECNICO asignado)
exports.completar = async (req, res) => {
  try {
    const prisma = getPrisma();
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
    return respondWithDatabaseError(
      res,
      error,
      'Error al completar la solicitud:',
      'No se pudo completar la solicitud. Intentá nuevamente más tarde.'
    );
  }
};

// PATCH /api/solicitudes/:id/cancelar  (CLIENTE dueño o TECNICO asignado)
exports.cancelar = async (req, res) => {
  try {
    const prisma = getPrisma();
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
    return respondWithDatabaseError(
      res,
      error,
      'Error al cancelar la solicitud:',
      'No se pudo cancelar la solicitud. Intentá nuevamente más tarde.'
    );
  }
};

// GET /api/solicitudes/:id  (CLIENTE dueño, TECNICO asignado o elegible, ADMINISTRADOR)
exports.getById = async (req, res) => {
  try {
    const prisma = getPrisma();
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
        titulo: solicitud.titulo,
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
    return respondWithDatabaseError(
      res,
      error,
      'Error al obtener la solicitud:',
      'No se pudo cargar la solicitud. Intentá nuevamente más tarde.'
    );
  }
};

// GET /api/solicitudes/:id/eventos  (CLIENTE dueño, TECNICO asignado, ADMINISTRADOR)
exports.getEventos = async (req, res) => {
  try {
    const prisma = getPrisma();
    const idSolicitud = Number(req.params.id);
    if (!Number.isInteger(idSolicitud) || idSolicitud < 1) {
      return res.status(400).json({ error: 'El id de la solicitud debe ser un número válido' });
    }
    const idUsuario = getIdUsuario(req);
    const rol = req.user.role;

    const solicitud = await prisma.solicitud.findUnique({ where: { idSolicitud } });
    if (!solicitud) {
      return res.status(404).json({ error: 'La solicitud no existe' });
    }

    const autorizado =
      rol === 'ADMINISTRADOR' ||
      (rol === 'CLIENTE' && solicitud.idCliente === idUsuario) ||
      (rol === 'TECNICO' && solicitud.idTecnico === idUsuario);
    if (!autorizado) {
      return res.status(403).json({ error: 'No tenés permiso para ver los eventos de esta solicitud' });
    }

    const select = {
      idEvento: true,
      nombreEvento: true,
      fechaHora: true
    };
    if (rol === 'ADMINISTRADOR') {
      select.usuario = { select: { idUsuario: true, nombre: true } };
    }

    const eventos = await prisma.evento.findMany({
      where: { idSolicitud },
      select,
      orderBy: [{ fechaHora: 'asc' }, { idEvento: 'asc' }]
    });

    res.json({ eventos });
  } catch (error) {
    return respondWithDatabaseError(
      res,
      error,
      'Error al obtener los eventos de la solicitud:',
      'No se pudo cargar los eventos de la solicitud. Intentá nuevamente más tarde.'
    );
  }
};
