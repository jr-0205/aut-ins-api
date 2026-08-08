# 3. Modelo de datos

## Entidades identificadas

| Entidad lógica | Responsabilidad principal | Alcance |
|---|---|---|
| `tbl_aspirante` | Representar cada solicitud de ingreso. | Núcleo |
| `tbl_expediente` | Conservar documentación, folio, observaciones y estado. | Núcleo |
| `tbl_cat_estadoExpediente` | Controlar los estados del trámite. | Núcleo |
| `tbl_alumno` | Representar al aspirante aceptado y su matrícula. | Núcleo |
| `tbl_cat_estadoAlumno` | Controlar la situación académica del alumno. | Apoyo |
| `tbl_inscripcion` | Relacionar alumno, grupo y responsable de la operación. | Núcleo |
| `tbl_grupo` | Conservar carrera, periodo, turno y capacidad máxima. | Núcleo |
| `tbl_cat_periodo` | Normalizar los periodos escolares. | Apoyo |
| `tbl_empleado` | Representar personal autorizado. | Núcleo |
| `tbl_cat_rolEmpleado` | Definir Admisiones, Control Escolar y Coordinación. | Núcleo |
| `tbl_cat_carrera` | Mantener la oferta educativa. | Apoyo |
| `tbl_conversacion` | Vincular alumno, empleado y asunto. | Complementario |
| `tbl_mensaje` | Conservar las intervenciones de una conversación. | Complementario |

## Reglas principales

- Un CURP no podrá tener más de un proceso vigente al mismo tiempo.
- Los procesos rechazados o cerrados permanecerán como historial.
- Un expediente aceptado puede originar un alumno.
- Una inscripción debe relacionar un alumno con un grupo.
- La inscripción no podrá provocar que el grupo supere su capacidad máxima.
- La base de datos conserva estados e historial; la aplicación decide qué registros mostrar en cada vista.

## Decisiones pendientes

1. Sustituir los estados ambiguos `Inactivo` y `No activo` por nombres más claros.
2. Definir si el periodo se obtendrá mediante `tbl_grupo` o se conservará también en `tbl_inscripcion`.
3. Documentar restricciones únicas para folio y matrículas.
4. Completar la normalización formal y el modelo físico.
5. Crear el esquema definitivo de Prisma y sus migraciones.
