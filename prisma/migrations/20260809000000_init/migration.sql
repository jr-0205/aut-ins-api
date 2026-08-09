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
