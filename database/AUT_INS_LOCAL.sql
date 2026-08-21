-- ============================================================================
-- AUT-INS | Base de datos local MySQL 8.4
-- Generado a partir de prisma/schema.prisma y la migración inicial aprobada.
--
-- Uso recomendado (base nueva):
--   mysql -u root -p < database/AUT_INS_LOCAL.sql
--
-- Este archivo NO elimina una base existente. Si aut_ins_local ya contiene las
-- tablas, use las migraciones de Prisma o cree primero una base vacía.
-- Todos los registros incluidos son ficticios y exclusivos para demostración.
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '-06:00';

CREATE DATABASE IF NOT EXISTS `aut_ins_local`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `aut_ins_local`;

-- La estructura siguiente coincide con la migración inicial del repositorio.
-- CreateTable
CREATE TABLE `tbl_persona` (
    `id_persona` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `curp` CHAR(18) NOT NULL,
    `nombre` VARCHAR(80) NOT NULL,
    `apellido_paterno` VARCHAR(80) NOT NULL,
    `apellido_materno` VARCHAR(80) NULL,
    `correo_principal` VARCHAR(254) NOT NULL,
    `telefono` VARCHAR(20) NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_persona_curp`(`curp`),
    INDEX `idx_persona_nombre`(`apellido_paterno`, `apellido_materno`, `nombre`),
    PRIMARY KEY (`id_persona`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_cat_carrera` (
    `id_carrera` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `clave` VARCHAR(20) NOT NULL,
    `nombre` VARCHAR(150) NOT NULL,
    `descripcion` TEXT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_carrera_clave`(`clave`),
    UNIQUE INDEX `uq_carrera_nombre`(`nombre`),
    INDEX `idx_carrera_activa`(`activa`, `nombre`),
    PRIMARY KEY (`id_carrera`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_aspirante` (
    `id_aspirante` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_persona` INTEGER UNSIGNED NOT NULL,
    `id_carrera` INTEGER UNSIGNED NOT NULL,
    `correo_contacto` VARCHAR(254) NOT NULL,
    `telefono_contacto` VARCHAR(20) NULL,
    `fecha_registro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_aspirante_persona_fecha`(`id_persona`, `fecha_registro`),
    INDEX `idx_aspirante_carrera_fecha`(`id_carrera`, `fecha_registro`),
    UNIQUE INDEX `uq_aspirante_id_persona`(`id_aspirante`, `id_persona`),
    PRIMARY KEY (`id_aspirante`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_proceso_activo` (
    `id_persona` INTEGER UNSIGNED NOT NULL,
    `id_aspirante` INTEGER UNSIGNED NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `uq_proceso_activo_aspirante`(`id_aspirante`, `id_persona`),
    PRIMARY KEY (`id_persona`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_cat_estado_expediente` (
    `id_estado_expediente` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(30) NOT NULL,
    `descripcion` VARCHAR(120) NOT NULL,
    `bloquea_curp` BOOLEAN NOT NULL DEFAULT true,
    `es_terminal` BOOLEAN NOT NULL DEFAULT false,
    `orden` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `uq_estado_expediente_codigo`(`codigo`),
    PRIMARY KEY (`id_estado_expediente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_expediente` (
    `id_expediente` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `folio` VARCHAR(30) NOT NULL,
    `id_aspirante` INTEGER UNSIGNED NOT NULL,
    `id_estado_expediente` TINYINT UNSIGNED NOT NULL,
    `observaciones` TEXT NULL,
    `fecha_dictamen` DATETIME(3) NULL,
    `dictaminado_por` INTEGER UNSIGNED NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_expediente_folio`(`folio`),
    UNIQUE INDEX `uq_expediente_aspirante`(`id_aspirante`),
    INDEX `idx_expediente_estado_fecha`(`id_estado_expediente`, `actualizado_en`),
    INDEX `idx_expediente_dictaminador`(`dictaminado_por`),
    PRIMARY KEY (`id_expediente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_cat_tipo_documento` (
    `id_tipo_documento` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(40) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `requerido` BOOLEAN NOT NULL DEFAULT true,
    `orden` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `uq_tipo_documento_codigo`(`codigo`),
    PRIMARY KEY (`id_tipo_documento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_documento` (
    `id_documento` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_expediente` INTEGER UNSIGNED NOT NULL,
    `id_tipo_documento` TINYINT UNSIGNED NOT NULL,
    `version` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    `nombre_original` VARCHAR(255) NOT NULL,
    `ruta_almacenamiento` VARCHAR(500) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `tamano_bytes` INTEGER UNSIGNED NOT NULL,
    `estado` ENUM('PENDIENTE', 'VALIDADO', 'OBSERVADO', 'REEMPLAZADO') NOT NULL DEFAULT 'PENDIENTE',
    `observaciones` TEXT NULL,
    `reemplaza_a` INTEGER UNSIGNED NULL,
    `revisado_por` INTEGER UNSIGNED NULL,
    `cargado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revisado_en` DATETIME(3) NULL,

    UNIQUE INDEX `uq_documento_reemplaza`(`reemplaza_a`),
    INDEX `idx_documento_expediente_tipo`(`id_expediente`, `id_tipo_documento`, `estado`),
    INDEX `idx_documento_estado`(`estado`, `revisado_en`),
    UNIQUE INDEX `uq_documento_version`(`id_expediente`, `id_tipo_documento`, `version`),
    UNIQUE INDEX `uq_documento_id_expediente_tipo`(`id_documento`, `id_expediente`, `id_tipo_documento`),
    PRIMARY KEY (`id_documento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_documento_vigente` (
    `id_expediente` INTEGER UNSIGNED NOT NULL,
    `id_tipo_documento` TINYINT UNSIGNED NOT NULL,
    `id_documento` INTEGER UNSIGNED NOT NULL,
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_documento_vigente_documento`(`id_documento`, `id_expediente`, `id_tipo_documento`),
    PRIMARY KEY (`id_expediente`, `id_tipo_documento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_usuario` (
    `id_usuario` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `matricula` VARCHAR(30) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `tipo` ENUM('ALUMNO', 'EMPLEADO') NOT NULL,
    `debe_cambiar_password` BOOLEAN NOT NULL DEFAULT true,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `ultimo_acceso_en` DATETIME(3) NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_usuario_matricula`(`matricula`),
    INDEX `idx_usuario_tipo_activo`(`tipo`, `activo`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_cat_estado_alumno` (
    `id_estado_alumno` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(30) NOT NULL,
    `descripcion` VARCHAR(120) NOT NULL,
    `bloquea_curp` BOOLEAN NOT NULL DEFAULT true,
    `es_terminal` BOOLEAN NOT NULL DEFAULT false,
    `orden` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `uq_estado_alumno_codigo`(`codigo`),
    PRIMARY KEY (`id_estado_alumno`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_alumno` (
    `id_alumno` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER UNSIGNED NOT NULL,
    `id_expediente` INTEGER UNSIGNED NOT NULL,
    `id_carrera` INTEGER UNSIGNED NOT NULL,
    `id_estado_alumno` TINYINT UNSIGNED NOT NULL,
    `fecha_alta` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_alumno_usuario`(`id_usuario`),
    UNIQUE INDEX `uq_alumno_expediente`(`id_expediente`),
    INDEX `idx_alumno_carrera_estado`(`id_carrera`, `id_estado_alumno`),
    PRIMARY KEY (`id_alumno`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_cat_rol_empleado` (
    `id_rol_empleado` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(30) NOT NULL,
    `nombre` VARCHAR(80) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `uq_rol_empleado_codigo`(`codigo`),
    PRIMARY KEY (`id_rol_empleado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_empleado` (
    `id_empleado` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER UNSIGNED NOT NULL,
    `nombre` VARCHAR(80) NOT NULL,
    `apellido_paterno` VARCHAR(80) NOT NULL,
    `apellido_materno` VARCHAR(80) NULL,
    `id_rol_empleado` TINYINT UNSIGNED NOT NULL,
    `id_carrera` INTEGER UNSIGNED NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_empleado_usuario`(`id_usuario`),
    INDEX `idx_empleado_rol_activo`(`id_rol_empleado`, `activo`),
    INDEX `idx_empleado_carrera_activo`(`id_carrera`, `activo`),
    PRIMARY KEY (`id_empleado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_cat_periodo` (
    `id_periodo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(30) NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NOT NULL,
    `estado` ENUM('PLANEADO', 'ACTIVO', 'CERRADO') NOT NULL DEFAULT 'PLANEADO',
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_periodo_nombre`(`nombre`),
    INDEX `idx_periodo_estado_fecha`(`estado`, `fecha_inicio`),
    PRIMARY KEY (`id_periodo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_grupo` (
    `id_grupo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `clave` VARCHAR(20) NOT NULL,
    `turno` ENUM('MATUTINO', 'VESPERTINO', 'MIXTO') NOT NULL,
    `grado` TINYINT UNSIGNED NOT NULL,
    `capacidad_maxima` SMALLINT UNSIGNED NOT NULL,
    `id_carrera` INTEGER UNSIGNED NOT NULL,
    `id_periodo` INTEGER UNSIGNED NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    INDEX `idx_grupo_disponibilidad`(`id_carrera`, `id_periodo`, `activo`),
    UNIQUE INDEX `uq_grupo_periodo_carrera_clave`(`id_periodo`, `id_carrera`, `clave`),
    UNIQUE INDEX `uq_grupo_id_periodo`(`id_grupo`, `id_periodo`),
    PRIMARY KEY (`id_grupo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_cat_estado_inscripcion` (
    `id_estado_inscripcion` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(30) NOT NULL,
    `descripcion` VARCHAR(120) NOT NULL,
    `ocupa_cupo` BOOLEAN NOT NULL DEFAULT true,
    `es_terminal` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `uq_estado_inscripcion_codigo`(`codigo`),
    PRIMARY KEY (`id_estado_inscripcion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_inscripcion` (
    `id_inscripcion` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_alumno` INTEGER UNSIGNED NOT NULL,
    `id_periodo` INTEGER UNSIGNED NOT NULL,
    `id_grupo` INTEGER UNSIGNED NOT NULL,
    `id_estado_inscripcion` TINYINT UNSIGNED NOT NULL,
    `registrado_por` INTEGER UNSIGNED NOT NULL,
    `fecha_inscripcion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    INDEX `idx_inscripcion_grupo_estado`(`id_grupo`, `id_estado_inscripcion`),
    INDEX `idx_inscripcion_empleado_fecha`(`registrado_por`, `fecha_inscripcion`),
    UNIQUE INDEX `uq_inscripcion_alumno_periodo`(`id_alumno`, `id_periodo`),
    PRIMARY KEY (`id_inscripcion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_historial_inscripcion` (
    `id_historial_inscripcion` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_inscripcion` INTEGER UNSIGNED NOT NULL,
    `id_estado_anterior` TINYINT UNSIGNED NULL,
    `id_estado_nuevo` TINYINT UNSIGNED NOT NULL,
    `id_grupo_anterior` INTEGER UNSIGNED NULL,
    `id_grupo_nuevo` INTEGER UNSIGNED NOT NULL,
    `registrado_por` INTEGER UNSIGNED NOT NULL,
    `motivo` VARCHAR(500) NULL,
    `registrado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_hist_inscripcion_fecha`(`id_inscripcion`, `registrado_en`),
    PRIMARY KEY (`id_historial_inscripcion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_historial_estado_expediente` (
    `id_historial_expediente` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_expediente` INTEGER UNSIGNED NOT NULL,
    `id_estado_anterior` TINYINT UNSIGNED NULL,
    `id_estado_nuevo` TINYINT UNSIGNED NOT NULL,
    `registrado_por` INTEGER UNSIGNED NULL,
    `observaciones` TEXT NULL,
    `registrado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_hist_expediente_fecha`(`id_expediente`, `registrado_en`),
    PRIMARY KEY (`id_historial_expediente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_historial_estado_alumno` (
    `id_historial_alumno` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_alumno` INTEGER UNSIGNED NOT NULL,
    `id_estado_anterior` TINYINT UNSIGNED NULL,
    `id_estado_nuevo` TINYINT UNSIGNED NOT NULL,
    `registrado_por` INTEGER UNSIGNED NULL,
    `motivo` VARCHAR(500) NULL,
    `registrado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_hist_alumno_fecha`(`id_alumno`, `registrado_en`),
    PRIMARY KEY (`id_historial_alumno`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_conversacion` (
    `id_conversacion` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_alumno` INTEGER UNSIGNED NOT NULL,
    `id_empleado_asignado` INTEGER UNSIGNED NULL,
    `area_destino` ENUM('CONTROL_ESCOLAR', 'COORDINACION') NOT NULL,
    `asunto` VARCHAR(160) NOT NULL,
    `estado` ENUM('ABIERTA', 'EN_ATENCION', 'CERRADA') NOT NULL DEFAULT 'ABIERTA',
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,
    `cerrado_en` DATETIME(3) NULL,

    INDEX `idx_conversacion_alumno_fecha`(`id_alumno`, `actualizado_en`),
    INDEX `idx_conversacion_bandeja`(`area_destino`, `estado`, `actualizado_en`),
    PRIMARY KEY (`id_conversacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_mensaje` (
    `id_mensaje` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_conversacion` INTEGER UNSIGNED NOT NULL,
    `id_usuario_remitente` INTEGER UNSIGNED NOT NULL,
    `contenido` TEXT NOT NULL,
    `enviado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_mensaje_conversacion_fecha`(`id_conversacion`, `enviado_en`),
    INDEX `idx_mensaje_remitente_fecha`(`id_usuario_remitente`, `enviado_en`),
    PRIMARY KEY (`id_mensaje`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_mensaje_lectura` (
    `id_mensaje` INTEGER UNSIGNED NOT NULL,
    `id_usuario` INTEGER UNSIGNED NOT NULL,
    `leido_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_lectura_usuario_fecha`(`id_usuario`, `leido_en`),
    PRIMARY KEY (`id_mensaje`, `id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_notificacion_aspirante` (
    `id_notificacion` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_aspirante` INTEGER UNSIGNED NOT NULL,
    `tipo` ENUM('REGISTRO_RECIBIDO', 'EXPEDIENTE_OBSERVADO', 'DICTAMEN_ACEPTADO', 'DICTAMEN_RECHAZADO') NOT NULL,
    `destinatario` VARCHAR(254) NOT NULL,
    `estado` ENUM('PENDIENTE', 'ENVIADA', 'FALLIDA') NOT NULL DEFAULT 'PENDIENTE',
    `identificador_externo` VARCHAR(120) NULL,
    `error_detalle` TEXT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `enviado_en` DATETIME(3) NULL,

    INDEX `idx_notificacion_aspirante_fecha`(`id_aspirante`, `creado_en`),
    INDEX `idx_notificacion_pendiente`(`estado`, `creado_en`),
    PRIMARY KEY (`id_notificacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tbl_aspirante` ADD CONSTRAINT `tbl_aspirante_id_persona_fkey` FOREIGN KEY (`id_persona`) REFERENCES `tbl_persona`(`id_persona`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_aspirante` ADD CONSTRAINT `tbl_aspirante_id_carrera_fkey` FOREIGN KEY (`id_carrera`) REFERENCES `tbl_cat_carrera`(`id_carrera`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_proceso_activo` ADD CONSTRAINT `tbl_proceso_activo_id_persona_fkey` FOREIGN KEY (`id_persona`) REFERENCES `tbl_persona`(`id_persona`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_proceso_activo` ADD CONSTRAINT `tbl_proceso_activo_id_aspirante_id_persona_fkey` FOREIGN KEY (`id_aspirante`, `id_persona`) REFERENCES `tbl_aspirante`(`id_aspirante`, `id_persona`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_expediente` ADD CONSTRAINT `tbl_expediente_id_aspirante_fkey` FOREIGN KEY (`id_aspirante`) REFERENCES `tbl_aspirante`(`id_aspirante`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_expediente` ADD CONSTRAINT `tbl_expediente_id_estado_expediente_fkey` FOREIGN KEY (`id_estado_expediente`) REFERENCES `tbl_cat_estado_expediente`(`id_estado_expediente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_expediente` ADD CONSTRAINT `tbl_expediente_dictaminado_por_fkey` FOREIGN KEY (`dictaminado_por`) REFERENCES `tbl_empleado`(`id_empleado`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_documento` ADD CONSTRAINT `tbl_documento_id_expediente_fkey` FOREIGN KEY (`id_expediente`) REFERENCES `tbl_expediente`(`id_expediente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_documento` ADD CONSTRAINT `tbl_documento_id_tipo_documento_fkey` FOREIGN KEY (`id_tipo_documento`) REFERENCES `tbl_cat_tipo_documento`(`id_tipo_documento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_documento` ADD CONSTRAINT `tbl_documento_reemplaza_a_fkey` FOREIGN KEY (`reemplaza_a`) REFERENCES `tbl_documento`(`id_documento`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tbl_documento` ADD CONSTRAINT `tbl_documento_revisado_por_fkey` FOREIGN KEY (`revisado_por`) REFERENCES `tbl_empleado`(`id_empleado`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_documento_vigente` ADD CONSTRAINT `tbl_documento_vigente_id_documento_id_expediente_id_tipo_do_fkey` FOREIGN KEY (`id_documento`, `id_expediente`, `id_tipo_documento`) REFERENCES `tbl_documento`(`id_documento`, `id_expediente`, `id_tipo_documento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_alumno` ADD CONSTRAINT `tbl_alumno_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_alumno` ADD CONSTRAINT `tbl_alumno_id_expediente_fkey` FOREIGN KEY (`id_expediente`) REFERENCES `tbl_expediente`(`id_expediente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_alumno` ADD CONSTRAINT `tbl_alumno_id_carrera_fkey` FOREIGN KEY (`id_carrera`) REFERENCES `tbl_cat_carrera`(`id_carrera`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_alumno` ADD CONSTRAINT `tbl_alumno_id_estado_alumno_fkey` FOREIGN KEY (`id_estado_alumno`) REFERENCES `tbl_cat_estado_alumno`(`id_estado_alumno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_empleado` ADD CONSTRAINT `tbl_empleado_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_empleado` ADD CONSTRAINT `tbl_empleado_id_rol_empleado_fkey` FOREIGN KEY (`id_rol_empleado`) REFERENCES `tbl_cat_rol_empleado`(`id_rol_empleado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_empleado` ADD CONSTRAINT `tbl_empleado_id_carrera_fkey` FOREIGN KEY (`id_carrera`) REFERENCES `tbl_cat_carrera`(`id_carrera`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_grupo` ADD CONSTRAINT `tbl_grupo_id_carrera_fkey` FOREIGN KEY (`id_carrera`) REFERENCES `tbl_cat_carrera`(`id_carrera`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_grupo` ADD CONSTRAINT `tbl_grupo_id_periodo_fkey` FOREIGN KEY (`id_periodo`) REFERENCES `tbl_cat_periodo`(`id_periodo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_inscripcion` ADD CONSTRAINT `tbl_inscripcion_id_alumno_fkey` FOREIGN KEY (`id_alumno`) REFERENCES `tbl_alumno`(`id_alumno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_inscripcion` ADD CONSTRAINT `tbl_inscripcion_id_periodo_fkey` FOREIGN KEY (`id_periodo`) REFERENCES `tbl_cat_periodo`(`id_periodo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_inscripcion` ADD CONSTRAINT `tbl_inscripcion_id_grupo_id_periodo_fkey` FOREIGN KEY (`id_grupo`, `id_periodo`) REFERENCES `tbl_grupo`(`id_grupo`, `id_periodo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_inscripcion` ADD CONSTRAINT `tbl_inscripcion_id_estado_inscripcion_fkey` FOREIGN KEY (`id_estado_inscripcion`) REFERENCES `tbl_cat_estado_inscripcion`(`id_estado_inscripcion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_inscripcion` ADD CONSTRAINT `tbl_inscripcion_registrado_por_fkey` FOREIGN KEY (`registrado_por`) REFERENCES `tbl_empleado`(`id_empleado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_historial_inscripcion` ADD CONSTRAINT `tbl_historial_inscripcion_id_inscripcion_fkey` FOREIGN KEY (`id_inscripcion`) REFERENCES `tbl_inscripcion`(`id_inscripcion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_historial_inscripcion` ADD CONSTRAINT `tbl_historial_inscripcion_id_estado_anterior_fkey` FOREIGN KEY (`id_estado_anterior`) REFERENCES `tbl_cat_estado_inscripcion`(`id_estado_inscripcion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_historial_inscripcion` ADD CONSTRAINT `tbl_historial_inscripcion_id_estado_nuevo_fkey` FOREIGN KEY (`id_estado_nuevo`) REFERENCES `tbl_cat_estado_inscripcion`(`id_estado_inscripcion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_historial_inscripcion` ADD CONSTRAINT `tbl_historial_inscripcion_id_grupo_anterior_fkey` FOREIGN KEY (`id_grupo_anterior`) REFERENCES `tbl_grupo`(`id_grupo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_historial_inscripcion` ADD CONSTRAINT `tbl_historial_inscripcion_id_grupo_nuevo_fkey` FOREIGN KEY (`id_grupo_nuevo`) REFERENCES `tbl_grupo`(`id_grupo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_historial_inscripcion` ADD CONSTRAINT `tbl_historial_inscripcion_registrado_por_fkey` FOREIGN KEY (`registrado_por`) REFERENCES `tbl_empleado`(`id_empleado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_historial_estado_expediente` ADD CONSTRAINT `tbl_historial_estado_expediente_id_expediente_fkey` FOREIGN KEY (`id_expediente`) REFERENCES `tbl_expediente`(`id_expediente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_historial_estado_expediente` ADD CONSTRAINT `tbl_historial_estado_expediente_id_estado_anterior_fkey` FOREIGN KEY (`id_estado_anterior`) REFERENCES `tbl_cat_estado_expediente`(`id_estado_expediente`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tbl_historial_estado_expediente` ADD CONSTRAINT `tbl_historial_estado_expediente_id_estado_nuevo_fkey` FOREIGN KEY (`id_estado_nuevo`) REFERENCES `tbl_cat_estado_expediente`(`id_estado_expediente`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tbl_historial_estado_expediente` ADD CONSTRAINT `tbl_historial_estado_expediente_registrado_por_fkey` FOREIGN KEY (`registrado_por`) REFERENCES `tbl_empleado`(`id_empleado`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_historial_estado_alumno` ADD CONSTRAINT `tbl_historial_estado_alumno_id_alumno_fkey` FOREIGN KEY (`id_alumno`) REFERENCES `tbl_alumno`(`id_alumno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_historial_estado_alumno` ADD CONSTRAINT `tbl_historial_estado_alumno_id_estado_anterior_fkey` FOREIGN KEY (`id_estado_anterior`) REFERENCES `tbl_cat_estado_alumno`(`id_estado_alumno`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tbl_historial_estado_alumno` ADD CONSTRAINT `tbl_historial_estado_alumno_id_estado_nuevo_fkey` FOREIGN KEY (`id_estado_nuevo`) REFERENCES `tbl_cat_estado_alumno`(`id_estado_alumno`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tbl_historial_estado_alumno` ADD CONSTRAINT `tbl_historial_estado_alumno_registrado_por_fkey` FOREIGN KEY (`registrado_por`) REFERENCES `tbl_empleado`(`id_empleado`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_conversacion` ADD CONSTRAINT `tbl_conversacion_id_alumno_fkey` FOREIGN KEY (`id_alumno`) REFERENCES `tbl_alumno`(`id_alumno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_conversacion` ADD CONSTRAINT `tbl_conversacion_id_empleado_asignado_fkey` FOREIGN KEY (`id_empleado_asignado`) REFERENCES `tbl_empleado`(`id_empleado`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_mensaje` ADD CONSTRAINT `tbl_mensaje_id_conversacion_fkey` FOREIGN KEY (`id_conversacion`) REFERENCES `tbl_conversacion`(`id_conversacion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_mensaje` ADD CONSTRAINT `tbl_mensaje_id_usuario_remitente_fkey` FOREIGN KEY (`id_usuario_remitente`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_mensaje_lectura` ADD CONSTRAINT `tbl_mensaje_lectura_id_mensaje_fkey` FOREIGN KEY (`id_mensaje`) REFERENCES `tbl_mensaje`(`id_mensaje`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_mensaje_lectura` ADD CONSTRAINT `tbl_mensaje_lectura_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_notificacion_aspirante` ADD CONSTRAINT `tbl_notificacion_aspirante_id_aspirante_fkey` FOREIGN KEY (`id_aspirante`) REFERENCES `tbl_aspirante`(`id_aspirante`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Reglas físicas que complementan las relaciones generadas por Prisma.
ALTER TABLE `tbl_persona`
  ADD CONSTRAINT `chk_persona_curp` CHECK (`curp` REGEXP '^[A-Z0-9]{18}$');

ALTER TABLE `tbl_cat_periodo`
  ADD CONSTRAINT `chk_periodo_fechas` CHECK (`fecha_fin` > `fecha_inicio`);

ALTER TABLE `tbl_grupo`
  ADD CONSTRAINT `chk_grupo_grado` CHECK (`grado` > 0),
  ADD CONSTRAINT `chk_grupo_capacidad` CHECK (`capacidad_maxima` > 0);

ALTER TABLE `tbl_documento`
  ADD CONSTRAINT `chk_documento_version` CHECK (`version` > 0),
  ADD CONSTRAINT `chk_documento_tamano` CHECK (`tamano_bytes` > 0);

ALTER TABLE `tbl_usuario`
  ADD CONSTRAINT `chk_usuario_password_hash` CHECK (CHAR_LENGTH(`password_hash`) >= 50);

ALTER TABLE `tbl_mensaje`
  ADD CONSTRAINT `chk_mensaje_contenido` CHECK (CHAR_LENGTH(TRIM(`contenido`)) > 0);

ALTER TABLE `tbl_conversacion`
  ADD CONSTRAINT `chk_conversacion_asunto` CHECK (CHAR_LENGTH(TRIM(`asunto`)) > 0);

ALTER TABLE `tbl_historial_estado_expediente`
  ADD CONSTRAINT `chk_historial_expediente_cambio` CHECK (`id_estado_anterior` IS NULL OR `id_estado_anterior` <> `id_estado_nuevo`);

ALTER TABLE `tbl_historial_estado_alumno`
  ADD CONSTRAINT `chk_historial_alumno_cambio` CHECK (`id_estado_anterior` IS NULL OR `id_estado_anterior` <> `id_estado_nuevo`);


-- ============================================================================
-- CATÁLOGOS INICIALES
-- ============================================================================

INSERT INTO `tbl_cat_estado_expediente`
  (`id_estado_expediente`, `codigo`, `descripcion`, `bloquea_curp`, `es_terminal`, `orden`)
VALUES
  (1, 'PENDIENTE_DOCUMENTOS', 'El aspirante todavía debe completar su expediente.', TRUE, FALSE, 10),
  (2, 'PENDIENTE_REVISION', 'El expediente se encuentra listo para revisión de Admisiones.', TRUE, FALSE, 20),
  (3, 'OBSERVADO', 'El aspirante debe subsanar uno o más documentos.', TRUE, FALSE, 30),
  (4, 'ACEPTADO', 'Admisiones aprobó el expediente para enrolamiento.', TRUE, FALSE, 40),
  (5, 'RECHAZADO', 'El proceso terminó sin generar un alumno.', FALSE, TRUE, 50),
  (6, 'CANCELADO', 'El proceso fue cerrado antes del enrolamiento.', FALSE, TRUE, 60);

INSERT INTO `tbl_cat_estado_alumno`
  (`id_estado_alumno`, `codigo`, `descripcion`, `bloquea_curp`, `es_terminal`, `orden`)
VALUES
  (1, 'ACTIVO', 'El alumno mantiene una relación académica vigente.', TRUE, FALSE, 10),
  (2, 'BAJA_TEMPORAL', 'La relación académica está suspendida, pero puede reanudarse.', TRUE, FALSE, 20),
  (3, 'BAJA_DEFINITIVA', 'La relación académica terminó por baja definitiva.', FALSE, TRUE, 30),
  (4, 'EGRESADO', 'El alumno concluyó su trayectoria académica.', FALSE, TRUE, 40);

INSERT INTO `tbl_cat_estado_inscripcion`
  (`id_estado_inscripcion`, `codigo`, `descripcion`, `ocupa_cupo`, `es_terminal`)
VALUES
  (1, 'ACTIVA', 'La inscripción se encuentra vigente y ocupa un lugar.', TRUE, FALSE),
  (2, 'CANCELADA', 'La inscripción fue cancelada y ya no ocupa cupo.', FALSE, TRUE),
  (3, 'FINALIZADA', 'La inscripción concluyó al terminar el periodo.', FALSE, TRUE);

INSERT INTO `tbl_cat_rol_empleado`
  (`id_rol_empleado`, `codigo`, `nombre`, `activo`)
VALUES
  (1, 'ADMISIONES', 'Coordinación de Admisiones', TRUE),
  (2, 'CONTROL_ESCOLAR', 'Control Escolar', TRUE),
  (3, 'COORDINACION', 'Coordinación Académica', TRUE);

INSERT INTO `tbl_cat_tipo_documento`
  (`id_tipo_documento`, `codigo`, `nombre`, `requerido`, `orden`, `activo`)
VALUES
  (1, 'ACTA_NACIMIENTO', 'Acta de nacimiento', TRUE, 10, TRUE),
  (2, 'CERTIFICADO_ESTUDIOS', 'Certificado de estudios', TRUE, 20, TRUE),
  (3, 'IDENTIFICACION_OFICIAL', 'Identificación oficial', TRUE, 30, TRUE),
  (4, 'COMPROBANTE_DOMICILIO', 'Comprobante de domicilio', TRUE, 40, TRUE),
  (5, 'CURP', 'Constancia de CURP', TRUE, 50, TRUE),
  (6, 'FOTOGRAFIA', 'Fotografía', TRUE, 60, TRUE);

INSERT INTO `tbl_cat_carrera`
  (`id_carrera`, `clave`, `nombre`, `descripcion`, `activa`, `creado_en`, `actualizado_en`)
VALUES
  (1, 'ISC', 'Ingeniería en Sistemas Computacionales',
   'Carrera ficticia utilizada para validar el flujo local de AUT-INS.',
   TRUE, NOW(3), NOW(3));

INSERT INTO `tbl_cat_periodo`
  (`id_periodo`, `nombre`, `fecha_inicio`, `fecha_fin`, `estado`, `creado_en`, `actualizado_en`)
VALUES
  (1, '2026-2', '2026-08-01', '2026-12-15', 'ACTIVO', NOW(3), NOW(3));

-- ============================================================================
-- CUENTAS Y PERSONAL FICTICIO
-- La misma cadena bcrypt de demostración se usa en las cuatro cuentas.
-- Debe sustituirse cuando se implemente la autenticación definitiva.
-- ============================================================================

INSERT INTO `tbl_usuario`
  (`id_usuario`, `matricula`, `password_hash`, `tipo`, `debe_cambiar_password`,
   `activo`, `ultimo_acceso_en`, `creado_en`, `actualizado_en`)
VALUES
  (1, 'ADM-DEMO', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'EMPLEADO', TRUE, TRUE, NULL, NOW(3), NOW(3)),
  (2, 'CE-DEMO', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'EMPLEADO', TRUE, TRUE, NULL, NOW(3), NOW(3)),
  (3, 'COORD-DEMO', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'EMPLEADO', TRUE, TRUE, NULL, NOW(3), NOW(3)),
  (4, '2026-000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'ALUMNO', TRUE, TRUE, NULL, NOW(3), NOW(3));

INSERT INTO `tbl_empleado`
  (`id_empleado`, `id_usuario`, `nombre`, `apellido_paterno`, `apellido_materno`,
   `id_rol_empleado`, `id_carrera`, `activo`, `creado_en`, `actualizado_en`)
VALUES
  (1, 1, 'Adriana', 'Demo', 'Admisiones', 1, NULL, TRUE, NOW(3), NOW(3)),
  (2, 2, 'César', 'Demo', 'Escolar', 2, NULL, TRUE, NOW(3), NOW(3)),
  (3, 3, 'Carolina', 'Demo', 'Coordinación', 3, 1, TRUE, NOW(3), NOW(3));

-- ============================================================================
-- FLUJO FICTICIO COMPLETO
-- ============================================================================

INSERT INTO `tbl_persona`
  (`id_persona`, `curp`, `nombre`, `apellido_paterno`, `apellido_materno`,
   `correo_principal`, `telefono`, `creado_en`, `actualizado_en`)
VALUES
  (1, 'AUID060101HDFXXX01', 'Alex', 'Usuario', 'Integración',
   'aspirante.demo@example.com', '5512345678', NOW(3), NOW(3));

INSERT INTO `tbl_aspirante`
  (`id_aspirante`, `id_persona`, `id_carrera`, `correo_contacto`,
   `telefono_contacto`, `fecha_registro`)
VALUES
  (1, 1, 1, 'aspirante.demo@example.com', '5512345678', NOW(3));

INSERT INTO `tbl_proceso_activo`
  (`id_persona`, `id_aspirante`, `creado_en`)
VALUES
  (1, 1, NOW(3));

INSERT INTO `tbl_expediente`
  (`id_expediente`, `folio`, `id_aspirante`, `id_estado_expediente`,
   `observaciones`, `fecha_dictamen`, `dictaminado_por`, `creado_en`, `actualizado_en`)
VALUES
  (1, 'AUT-INS-2026-000001', 1, 4,
   'Expediente ficticio aceptado para pruebas locales.', NOW(3), 1, NOW(3), NOW(3));

INSERT INTO `tbl_documento`
  (`id_documento`, `id_expediente`, `id_tipo_documento`, `version`,
   `nombre_original`, `ruta_almacenamiento`, `mime_type`, `tamano_bytes`,
   `estado`, `observaciones`, `reemplaza_a`, `revisado_por`, `cargado_en`, `revisado_en`)
VALUES
  (1, 1, 1, 1, 'acta_demo.pdf', 'demo/documentos/acta_demo.pdf',
   'application/pdf', 102400, 'VALIDADO', 'Documento ficticio validado.',
   NULL, 1, NOW(3), NOW(3));

INSERT INTO `tbl_documento_vigente`
  (`id_expediente`, `id_tipo_documento`, `id_documento`, `actualizado_en`)
VALUES
  (1, 1, 1, NOW(3));

INSERT INTO `tbl_alumno`
  (`id_alumno`, `id_usuario`, `id_expediente`, `id_carrera`,
   `id_estado_alumno`, `fecha_alta`, `actualizado_en`)
VALUES
  (1, 4, 1, 1, 1, NOW(3), NOW(3));

INSERT INTO `tbl_grupo`
  (`id_grupo`, `clave`, `turno`, `grado`, `capacidad_maxima`, `id_carrera`,
   `id_periodo`, `activo`, `creado_en`, `actualizado_en`)
VALUES
  (1, 'ISC-1A', 'MATUTINO', 1, 30, 1, 1, TRUE, NOW(3), NOW(3));

INSERT INTO `tbl_inscripcion`
  (`id_inscripcion`, `id_alumno`, `id_periodo`, `id_grupo`,
   `id_estado_inscripcion`, `registrado_por`, `fecha_inscripcion`, `actualizado_en`)
VALUES
  (1, 1, 1, 1, 1, 2, NOW(3), NOW(3));

INSERT INTO `tbl_historial_estado_expediente`
  (`id_historial_expediente`, `id_expediente`, `id_estado_anterior`,
   `id_estado_nuevo`, `registrado_por`, `observaciones`, `registrado_en`)
VALUES
  (1, 1, 2, 4, 1, 'Dictamen ficticio de aceptación.', NOW(3));

INSERT INTO `tbl_historial_estado_alumno`
  (`id_historial_alumno`, `id_alumno`, `id_estado_anterior`,
   `id_estado_nuevo`, `registrado_por`, `motivo`, `registrado_en`)
VALUES
  (1, 1, NULL, 1, 2, 'Alta inicial del alumno ficticio.', NOW(3));

INSERT INTO `tbl_historial_inscripcion`
  (`id_historial_inscripcion`, `id_inscripcion`, `id_estado_anterior`,
   `id_estado_nuevo`, `id_grupo_anterior`, `id_grupo_nuevo`,
   `registrado_por`, `motivo`, `registrado_en`)
VALUES
  (1, 1, NULL, 1, NULL, 1, 2, 'Inscripción inicial ficticia.', NOW(3));

INSERT INTO `tbl_conversacion`
  (`id_conversacion`, `id_alumno`, `id_empleado_asignado`, `area_destino`,
   `asunto`, `estado`, `creado_en`, `actualizado_en`, `cerrado_en`)
VALUES
  (1, 1, 3, 'COORDINACION', 'Consulta de grupo de demostración',
   'ABIERTA', NOW(3), NOW(3), NULL);

INSERT INTO `tbl_mensaje`
  (`id_mensaje`, `id_conversacion`, `id_usuario_remitente`, `contenido`, `enviado_en`)
VALUES
  (1, 1, 4, 'Mensaje ficticio para comprobar la bandeja de Coordinación.', NOW(3));

INSERT INTO `tbl_mensaje_lectura`
  (`id_mensaje`, `id_usuario`, `leido_en`)
VALUES
  (1, 3, NOW(3));

INSERT INTO `tbl_notificacion_aspirante`
  (`id_notificacion`, `id_aspirante`, `tipo`, `destinatario`, `estado`,
   `identificador_externo`, `error_detalle`, `creado_en`, `enviado_en`)
VALUES
  (1, 1, 'DICTAMEN_ACEPTADO', 'aspirante.demo@example.com', 'ENVIADA',
   'EMAILJS-DEMO-0001', NULL, NOW(3), NOW(3));

-- ============================================================================
-- COMPROBACIÓN RÁPIDA
-- ============================================================================

SELECT 'AUT-INS local creada correctamente' AS resultado;
SELECT COUNT(*) AS tablas_creadas
FROM information_schema.tables
WHERE table_schema = 'aut_ins_local';
SELECT p.curp, e.folio, u.matricula, c.nombre AS carrera,
       g.clave AS grupo, cei.codigo AS estado_inscripcion
FROM tbl_persona p
JOIN tbl_aspirante a ON a.id_persona = p.id_persona
JOIN tbl_expediente e ON e.id_aspirante = a.id_aspirante
JOIN tbl_alumno al ON al.id_expediente = e.id_expediente
JOIN tbl_usuario u ON u.id_usuario = al.id_usuario
JOIN tbl_cat_carrera c ON c.id_carrera = al.id_carrera
JOIN tbl_inscripcion i ON i.id_alumno = al.id_alumno
JOIN tbl_grupo g ON g.id_grupo = i.id_grupo
JOIN tbl_cat_estado_inscripcion cei
  ON cei.id_estado_inscripcion = i.id_estado_inscripcion;
