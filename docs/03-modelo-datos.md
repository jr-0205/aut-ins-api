# 3. Modelo de datos

## Estado

El modelo lógico y físico inicial está **definido, migrado y validado localmente**. La implementación utiliza MySQL 8.4 y Prisma ORM 7.9.1. El esquema, la migración y los datos semilla constituyen la línea base para desarrollar los módulos de la API.

## Decisiones definitivas

### Identidad e historial por CURP

La persona y el intento de admisión se modelan por separado:

- `tbl_persona` conserva la identidad y aplica `UNIQUE` sobre la CURP.
- `tbl_aspirante` representa cada intento de ingreso de una persona.
- `tbl_proceso_activo` mantiene un único apuntador vigente por persona.

Esta estructura permite consultar todo el historial de una CURP sin duplicar la identidad y evita desde la base que existan dos procesos activos simultáneos. Al cerrar definitivamente un proceso se elimina solamente el apuntador activo; los aspirantes, expedientes, alumnos e inscripciones permanecen como historial.

### Estados sin ambigüedad

El estado de Admisiones y la situación académica se controlan por separado:

| Ámbito | Estados iniciales |
|---|---|
| Expediente | `PENDIENTE_DOCUMENTOS`, `PENDIENTE_REVISION`, `OBSERVADO`, `ACEPTADO`, `RECHAZADO`, `CANCELADO` |
| Alumno | `ACTIVO`, `BAJA_TEMPORAL`, `BAJA_DEFINITIVA`, `EGRESADO` |
| Inscripción | `ACTIVA`, `CANCELADA`, `FINALIZADA` |

Los estados terminales indican cuándo puede liberarse el proceso activo de una CURP. La baja temporal conserva el bloqueo; el rechazo, la cancelación, la baja definitiva y el egreso permiten iniciar posteriormente otro proceso.

### Expediente y documentos

Los archivos no se almacenan como columnas dentro del expediente. `tbl_documento` conserva metadatos y versiones; `tbl_documento_vigente` señala una sola versión actual por expediente y tipo documental. La sustitución documental inserta una nueva versión y conserva la anterior como evidencia.

### Cuenta de acceso unificada

`tbl_usuario` centraliza matrícula, hash de contraseña y tipo de usuario. Alumno y empleado se relacionan uno a uno con esta cuenta. Esto garantiza que una matrícula no pueda repetirse entre ambos tipos de usuario y simplifica la autenticación JWT.

### Periodos, grupos e inscripciones

El periodo forma parte de la identidad funcional de una inscripción y cada alumno puede tener como máximo una inscripción por periodo. La relación compuesta con el grupo garantiza que ambos pertenezcan al mismo periodo. Los cambios de grupo o estado se registran en `tbl_historial_inscripcion`.

### Conservación de información

Las entidades con valor histórico utilizan `ON DELETE RESTRICT`. Los cambios de vigencia se representan mediante estados y tablas de historial; no se eliminan físicamente expedientes, alumnos, inscripciones, mensajes ni notificaciones.

## Entidades del modelo físico

| Grupo | Entidades | Función |
|---|---|---|
| Identidad | `Persona`, `Aspirante`, `ProcesoActivo` | Identidad única, intentos de ingreso y control de proceso vigente. |
| Admisiones | `Expediente`, `EstadoExpediente`, `HistorialEstadoExpediente` | Folio, dictamen, estado y trazabilidad. |
| Documentos | `TipoDocumentoCatalogo`, `Documento`, `DocumentoVigente` | Tipos, versiones, revisión y documento actual. |
| Seguridad | `Usuario`, `RolEmpleado`, `Empleado` | Matrícula única, credenciales y permisos del personal. |
| Alumnos | `Alumno`, `EstadoAlumno`, `HistorialEstadoAlumno` | Condición académica e historial de estados. |
| Oferta | `Carrera`, `Periodo`, `Grupo` | Carreras, ciclos, turnos, grados y capacidad. |
| Inscripción | `Inscripcion`, `EstadoInscripcion`, `HistorialInscripcion` | Asignación vigente y movimientos históricos. |
| Mensajería | `Conversacion`, `Mensaje`, `MensajeLectura` | Caja de mensajes, remitente real y lectura por usuario. |
| Notificaciones | `NotificacionAspirante` | Evidencia del envío de EmailJS al aspirante. |

No se incluye una entidad de materias en la primera versión. Ese catálogo es complementario y no condiciona el proceso prioritario de admisión e inscripción.

## Restricciones e índices principales

- CURP única en `tbl_persona`.
- Folio único en `tbl_expediente`.
- Matrícula única global en `tbl_usuario`.
- Un expediente por aspirante y un alumno por expediente.
- Un proceso activo por persona.
- Una versión documental vigente por expediente y tipo.
- Una inscripción por alumno y periodo.
- Grupo y periodo compatibles mediante clave foránea compuesta.
- Fechas de periodo coherentes y capacidades mayores que cero.
- Contraseñas almacenadas únicamente como hashes seguros.
- Índices para CURP, nombres, estados, carrera, periodo, cupo, mensajes e historial.

## Operaciones que deberán ser transaccionales

La base aporta restricciones estructurales, pero las reglas que requieren conteos o varios cambios deben ejecutarse desde la API dentro de una transacción:

1. Pre-registro: persona, aspirante, expediente y proceso activo.
2. Dictamen: estado, historial, notificación y liberación del proceso cuando sea terminal.
3. Enrolamiento: usuario, alumno e historial inicial.
4. Inscripción: bloqueo del grupo, validación de carrera y periodo, conteo de cupo e inserción.
5. Cambio de grupo: validación de cupo, actualización e historial del movimiento.
6. Baja definitiva o egreso: estado del alumno, historial y liberación del proceso activo.
7. Sustitución documental: nueva versión, actualización del apuntador vigente y conservación de la versión anterior.

## Datos semilla

El archivo `prisma/seed.ts` registra de forma idempotente:

- seis estados de expediente;
- cuatro estados de alumno;
- tres estados de inscripción;
- tres roles de empleado;
- seis tipos de documento.

No se crean carreras, periodos, empleados ni usuarios ficticios.

## Archivos de implementación

- `prisma/schema.prisma`: modelo físico.
- `prisma/migrations/20260809000000_init/migration.sql`: primera migración MySQL.
- `prisma/seed.ts`: catálogos iniciales.
- `prisma.config.ts`: configuración de Prisma 7.
- `src/config/database.ts`: cliente Prisma compartido por la API.

## Comandos

```bash
npm run mysql:setup
npm run db:validate
npm run db:generate
npm run db:deploy
npm run db:seed
npm run db:studio
```

`mysql:setup` prepara una instancia aislada en `.local/mysql`, crea `aut_ins_local` en el puerto `3307` y genera `.env` con credenciales aleatorias. Tanto `.local` como `.env` están excluidos de Git. En equipos que ya dispongan de otro servidor MySQL puede configurarse manualmente una `DATABASE_URL` válida.
