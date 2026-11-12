const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// GET /api/admin/usuarios  (ADMINISTRADOR)
exports.getUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        idUsuario: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        fechaCreacion: true,
      },
      orderBy: [{ fechaCreacion: 'desc' }, { idUsuario: 'desc' }],
    });
    res.json({ usuarios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

const ESTADOS = [
  'PENDIENTE',
  'ACEPTADA',
  'EN_PROGRESO',
  'COMPLETADA',
  'RECHAZADA',
  'CANCELADA',
];

// GET /api/admin/solicitudes?estado=PENDIENTE  (ADMINISTRADOR)
exports.getSolicitudes = async (req, res) => {
  try {
    const { estado } = req.query;
    let where = {};

    if (estado !== undefined) {
      const estadoNormalizado = String(estado).toUpperCase();
      if (!ESTADOS.includes(estadoNormalizado)) {
        return res.status(400).json({
          error: `El estado no es válido. Valores permitidos: ${ESTADOS.join(', ')}`,
        });
      }
      where = { estado: estadoNormalizado };
    }

    const solicitudes = await prisma.solicitud.findMany({
      where,
      select: {
        idSolicitud: true,
        detalle: true,
        estado: true,
        fechaCreacion: true,
        fechaAceptacion: true,
        fechaFinalizacion: true,
        servicio: { select: { idServicio: true, nombreServicio: true } },
        cliente: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        tecnico: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
      orderBy: [{ fechaCreacion: 'desc' }, { idSolicitud: 'desc' }],
    });

    res.json({ solicitudes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las solicitudes' });
  }
};

// PATCH /api/admin/solicitudes/:id/cancelar  (ADMINISTRADOR)
exports.cancelarSolicitud = async (req, res) => {
  try {
    const idSolicitud = Number(req.params.id);
    if (!Number.isInteger(idSolicitud) || idSolicitud < 1) {
      return res
        .status(400)
        .json({ error: 'El id de la solicitud debe ser un número válido' });
    }

    const solicitud = await prisma.solicitud.findUnique({
      where: { idSolicitud },
    });
    if (!solicitud) {
      return res.status(404).json({ error: 'La solicitud no existe' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const actualizadas = await tx.solicitud.updateMany({
        where: { idSolicitud, estado: { in: ['PENDIENTE', 'ACEPTADA'] } },
        data: { estado: 'CANCELADA' },
      });
      if (actualizadas.count === 0) return null;

      await tx.evento.create({
        data: {
          nombreEvento: 'SOLICITUD_CANCELADA',
          idUsuario: req.user.userId,
          idSolicitud,
        },
      });

      return tx.solicitud.findUnique({
        where: { idSolicitud },
        select: { idSolicitud: true, estado: true },
      });
    });

    if (!resultado) {
      return res.status(409).json({
        error: 'La solicitud no se puede cancelar en su estado actual',
      });
    }
    res.json({ mensaje: 'Solicitud cancelada', solicitud: resultado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cancelar la solicitud' });
  }
};

// Get /api/admin/metricas  (ADMINISTRADOR)
exports.getMetricas = async (req, res) => {
  try {
    const matchRate = await prisma.$queryRaw`SELECT
      COUNT(*) FILTER (
        WHERE s."fechaAceptacion" IS NOT NULL
      ) * 100.0 / NULLIF(COUNT(*), 0) AS match_rate
    FROM "Solicitud" s
    JOIN "Usuario" u
      ON u."idUsuario" = s."idCliente"
    WHERE u."usuarioDePrueba" = FALSE`;

    const timeToMatch = await prisma.$queryRaw`SELECT
        AVG(
          EXTRACT(EPOCH FROM
            (s."fechaAceptacion" - s."fechaCreacion")
          ) / 60.0
        ) AS tiempo_medio_match_minutos
      FROM "Solicitud" s
      JOIN "Usuario" u
        ON u."idUsuario" = s."idCliente"
      WHERE s."fechaAceptacion" IS NOT NULL
        AND u."usuarioDePrueba" = FALSE`;

    const clientTechnicianRatio = await prisma.$queryRaw`SELECT
        COUNT(*) FILTER (
          WHERE rol = 'CLIENTE'
        ) * 1.0
        / NULLIF(
          COUNT(*) FILTER (
            WHERE rol = 'TECNICO'
          ),
          0
        ) AS client_technician_ratio
      FROM "Usuario"
      WHERE "usuarioDePrueba" = FALSE;`;

    const liquidity = await prisma.$queryRaw`SELECT
        COUNT(*) FILTER (
          WHERE s."fechaAceptacion"
            <= s."fechaCreacion" + INTERVAL '30 minutes'
        ) * 100.0 / NULLIF(COUNT(*), 0) AS liquidity_rate
      FROM "Solicitud" s
      JOIN "Usuario" u
        ON u."idUsuario" = s."idCliente"
      WHERE s."fechaAceptacion" IS NOT NULL
        AND u."usuarioDePrueba" = FALSE;`;

    const registrationConversion = await prisma.$queryRaw`WITH registros AS (
      SELECT COUNT(*) AS total
      FROM "Usuario"
      WHERE "rol" IN ('CLIENTE', 'TECNICO')
        AND "usuarioDePrueba" = FALSE
    ),
    vistas AS (
      SELECT COUNT(*) AS total
      FROM "Evento" e
      LEFT JOIN "Usuario" u
        ON u."idUsuario" = e."idUsuario"
      WHERE e."nombreEvento" = 'VISTA_REGISTRO'
        AND (
          e."idUsuario" IS NULL
          OR u."usuarioDePrueba" = FALSE
        )
    )
    SELECT
      registros.total AS total_registros,
      vistas.total AS total_vistas_registro,
      ROUND(
        registros.total * 100.0 / NULLIF(vistas.total, 0),
        2
      ) AS tasa_conversion_registro
    FROM registros
    CROSS JOIN vistas;`;

    const activationRate = await prisma.$queryRaw`SELECT
        COUNT(*) FILTER (
          WHERE "ultimoLogin" IS NOT NULL
        ) * 100.0 / NULLIF(COUNT(*), 0) AS activation_rate
      FROM "Usuario"
      WHERE "rol" IN ('CLIENTE', 'TECNICO')
        AND "usuarioDePrueba" = FALSE`;

    const dau = await prisma.$queryRaw
    `SELECT
      COUNT(*) AS dau
    FROM "Usuario"
    WHERE "ultimoLogin" >= CURRENT_DATE
      AND "ultimoLogin" < CURRENT_DATE + INTERVAL '1 day'
      AND "rol" IN ('CLIENTE', 'TECNICO')
      AND "usuarioDePrueba" = FALSE`    

    const requestAbandonmentRate = await prisma.$queryRaw
    `SELECT COUNT(*) AS total_intentos,
    COUNT(*) FILTER (
      WHERE completado = TRUE
    ) AS total_completados,
    COUNT(*) FILTER (
      WHERE completado = FALSE
    ) AS total_abandonados,
    ROUND(
      COUNT(*) FILTER (WHERE completado = FALSE)
      * 100.0 / NULLIF(COUNT(*), 0),
      2
    ) AS tasa_abandono_porcentaje
    FROM ( SELECT "instanciaFormularioId",
      MIN("fechaHora") AS fecha_inicio,
        BOOL_OR(
          "nombreEvento" = 'SOLICITUD_CREADA'
        ) AS completado
    FROM "Evento"
    WHERE "instanciaFormularioId" IS NOT NULL
      AND "nombreEvento" IN (
        'SOLICITUD_INICIADA',
        'SOLICITUD_CREADA'
      )
    GROUP BY "instanciaFormularioId"
    ) AS intentos
    WHERE fecha_inicio <= CURRENT_TIMESTAMP - INTERVAL '2 hours'`    

    res.json({
      metricas: {
        matchRate:
          matchRate[0].match_rate !== null
            ? parseFloat(parseFloat(matchRate[0].match_rate).toFixed(1))
            : null,
        timeToMatchMinutos:
          timeToMatch[0].tiempo_medio_match_minutos !== null
            ? parseInt(timeToMatch[0].tiempo_medio_match_minutos)
            : null,
        ratioClientesTecnicos:
          clientTechnicianRatio[0].client_technician_ratio !== null
            ? parseFloat(
                parseFloat(
                  clientTechnicianRatio[0].client_technician_ratio,
                ).toFixed(1),
              )
            : null,
        liquidity:
          liquidity[0].liquidity_rate !== null
            ? parseInt(liquidity[0].liquidity_rate)
            : null,
        conversionRegistro: registrationConversion[0].tasa_conversion_registro
          ? parseInt(registrationConversion[0].tasa_conversion_registro)
          : null,
        activationRate:
          activationRate[0].activation_rate !== null
            ? parseInt(activationRate[0].activation_rate)
            : null,
        dau: dau[0].dau ? Number(dau[0].dau): 0,
        abandonoSolicitud: {
          totalIntentos: Number(requestAbandonmentRate[0].total_intentos),
          totalCompletados: Number(requestAbandonmentRate[0].total_completados),
          totalAbandonados: Number(requestAbandonmentRate[0].total_abandonados),
          tasaAbandono: Number(requestAbandonmentRate[0].tasa_abandono_porcentaje),
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las metricas' });
  }
};

// POST /api/admin/servicios  (ADMINISTRADOR)
exports.crearServicio = async (req, res) => {
  try {
    const nombreServicio = String(req.body.nombreServicio || '').trim();
    const descripcion = String(req.body.descripcion || '').trim();

    if (!nombreServicio || nombreServicio.length > 100 || !descripcion) {
      return res.status(400).json({ error: 'Datos inválidos: nombreServicio y descripcion son obligatorios (nombre máximo 100 caracteres)' });
    }

    const existe = await prisma.servicio.findFirst({
      where: { nombreServicio: { equals: nombreServicio, mode: 'insensitive' } },
    });
    if (existe) {
      return res.status(409).json({ error: 'Ya existe un servicio con ese nombre' });
    }

    const servicio = await prisma.servicio.create({
      data: { nombreServicio, descripcion },
      select: { idServicio: true, nombreServicio: true, descripcion: true },
    });

    res.status(201).json({ mensaje: 'Servicio creado correctamente', servicio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el servicio' });
  }
};
