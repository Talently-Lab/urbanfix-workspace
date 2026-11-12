-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('TECNICO', 'ADMINISTRADOR', 'CLIENTE');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'ACEPTADA', 'EN_PROGRESO', 'COMPLETADA', 'RECHAZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('SOLICITUD_CREADA', 'SOLICITUD_ACEPTADA', 'SOLICITUD_RECHAZADA', 'SOLICITUD_EN_PROGRESO', 'SOLICITUD_COMPLETADA', 'SOLICITUD_CANCELADA', 'SOLICITUD_INICIADA', 'VISTA_REGISTRO', 'VISTA_LOGIN', 'LOGIN_EXITOSO');

-- CreateTable
CREATE TABLE "Usuario" (
    "idUsuario" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "numeroTelefono" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimoLogin" TIMESTAMP(3),
    "usuarioDePrueba" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "idServicio" SERIAL NOT NULL,
    "nombreServicio" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("idServicio")
);

-- CreateTable
CREATE TABLE "TecnicoServicio" (
    "idTecnico" INTEGER NOT NULL,
    "idServicio" INTEGER NOT NULL,

    CONSTRAINT "TecnicoServicio_pkey" PRIMARY KEY ("idTecnico","idServicio")
);

-- CreateTable
CREATE TABLE "Solicitud" (
    "idSolicitud" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL DEFAULT '',
    "detalle" TEXT NOT NULL,
    "direccion" TEXT NOT NULL DEFAULT 'Sin especificar',
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "idCliente" INTEGER NOT NULL,
    "idServicio" INTEGER NOT NULL,
    "idTecnico" INTEGER,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFinalizacion" TIMESTAMP(3),
    "fechaAceptacion" TIMESTAMP(3),

    CONSTRAINT "Solicitud_pkey" PRIMARY KEY ("idSolicitud")
);

-- CreateTable
CREATE TABLE "Evento" (
    "idEvento" SERIAL NOT NULL,
    "nombreEvento" "TipoEvento" NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUsuario" INTEGER,
    "idSolicitud" INTEGER,
    "sesionId" TEXT,
    "instanciaFormularioId" TEXT,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("idEvento")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "TecnicoServicio" ADD CONSTRAINT "TecnicoServicio_idTecnico_fkey" FOREIGN KEY ("idTecnico") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TecnicoServicio" ADD CONSTRAINT "TecnicoServicio_idServicio_fkey" FOREIGN KEY ("idServicio") REFERENCES "Servicio"("idServicio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_idServicio_fkey" FOREIGN KEY ("idServicio") REFERENCES "Servicio"("idServicio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_idTecnico_fkey" FOREIGN KEY ("idTecnico") REFERENCES "Usuario"("idUsuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_idSolicitud_fkey" FOREIGN KEY ("idSolicitud") REFERENCES "Solicitud"("idSolicitud") ON DELETE SET NULL ON UPDATE CASCADE;
