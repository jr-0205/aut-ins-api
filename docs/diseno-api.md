# Diseño preliminar de la API

## Estado

La identificación de recursos está concluida. Los contratos definitivos, parámetros, respuestas, validaciones y códigos HTTP permanecen en diseño.

## Recursos identificados

| Recurso | Función | Alcance |
|---|---|---|
| `/auth` | Autenticación, JWT y control por rol. | Núcleo |
| `/aspirantes` | Pre-registro, consulta, dictamen y corrección. | Núcleo |
| `/documentos` | Carga y validación del expediente digital. | Núcleo |
| `/alumnos` | Enrolamiento y administración del expediente estudiantil. | Núcleo |
| `/usuarios` | Administración del personal y sus roles. | Apoyo |
| `/carreras` | Consulta y administración de la oferta educativa. | Apoyo |
| `/grupos` | Administración de grupos y disponibilidad. | Núcleo |
| `/inscripciones` | Registro de la inscripción del alumno. | Núcleo |
| `/materias` | Administración académica ampliada. | Complementario |
| `/conversaciones` | Canal interno entre alumno y personal. | Complementario |
| `/mensajes` | Mensajes y seguimiento de lectura. | Complementario |
| `/reportes` | Indicadores del proceso de inscripción. | Complementario |

## Rutas registradas hasta el momento

| Método | Ruta | Propósito | Estado |
|---|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión y devolver un JWT. | Preliminar |
| `POST` | `/api/aspirantes` | Registrar públicamente al aspirante. | Preliminar |
| `GET` | `/api/aspirantes` | Listar aspirantes para revisión. | Preliminar |
| `PATCH` | `/api/aspirantes/:id/dictamen` | Aprobar, rechazar u observar la solicitud. | Preliminar |
| `POST` | `/api/alumnos` | Convertir un aspirante aceptado en alumno. | Preliminar |
| `GET` | `/api/alumnos` | Consultar y filtrar alumnos. | Preliminar |
| `GET` | `/api/alumnos/:id` | Consultar un expediente de alumno. | Preliminar |
| `PUT` | `/api/alumnos/:id` | Actualizar información autorizada. | Preliminar |
| `GET` | `/api/grupos` | Consultar grupos y cupos disponibles. | Preliminar |
| `POST` | `/api/grupos` | Crear un grupo académico. | Preliminar |
| `POST` | `/api/inscripciones` | Inscribir un alumno y asignarle grupo. | Preliminar |
| `POST` | `/api/documentos/upload` | Cargar documentación del aspirante. | Preliminar |
| `GET` | `/api/reportes/inscripciones` | Consultar un reporte general. | Preliminar |

## Trabajo siguiente

- Definir rutas faltantes para corrección documental.
- Diseñar conversaciones y mensajes internos.
- Establecer parámetros, filtros y paginación.
- Documentar cuerpos de solicitud y respuesta.
- Definir códigos HTTP y formato uniforme de errores.
- Determinar qué rutas requieren JWT y qué roles pueden utilizarlas.
- Preparar una colección de pruebas para Postman.
