# 4. Diseño de la API

## Estado de la etapa

La etapa se encuentra **concluida**. Los entregables SCRUM-19 a SCRUM-24 forman la línea base para iniciar el desarrollo de la API. Cualquier modificación posterior deberá registrarse como cambio de contrato antes de aplicarse al código.

| Actividad | Entregable | Estado |
|---|---|---|
| SCRUM-19 | Identificación y delimitación de recursos | Concluido |
| SCRUM-20 | Rutas y métodos HTTP | Concluido |
| SCRUM-21 | Entradas, salidas y respuestas uniformes | Concluido |
| SCRUM-22 | Validaciones, excepciones y códigos HTTP | Concluido |
| SCRUM-23 | Autenticación JWT y permisos por rol | Concluido |
| SCRUM-24 | Colección inicial de Postman y revisión integral | Concluido |

## Colección inicial de Postman

La especificación operativa se reunió en [`postman/AUT-INS_API.postman_collection.json`](postman/AUT-INS_API.postman_collection.json), bajo el esquema Postman Collection v2.1. La colección contiene:

- 35 solicitudes organizadas en 13 carpetas funcionales.
- Variable `baseUrl` y variables reutilizables para JWT, token temporal e identificadores.
- Autenticación pública, JWT general y token temporal según el tipo de operación.
- Cuerpos JSON, formularios de carga, filtros y parámetros de ejemplo.
- Pruebas iniciales para códigos HTTP, formato JSON, tiempos de respuesta y captura de identificadores.

La colección representa los contratos aprobados, pero sus pruebas de ejecución deberán completarse cuando la API esté implementada. Esa evidencia corresponde a la sexta etapa.

## Cobertura de las UFP

| UFP | Proceso cubierto | Carpetas o rutas principales | Resultado |
|---|---|---|---|
| UFP-01 | Pre-registro y carga documental | Aspirantes, Documentos y Carreras | Cubierta |
| UFP-02 | Revisión y dictamen de Admisiones | Expedientes, Dictamen y Documentos | Cubierta |
| UFP-03 | Enrolamiento y credenciales | Alumnos e Inscripciones | Cubierta |
| UFP-04 | Administración general | Alumnos, Personal, Expedientes e Historial | Cubierta |
| UFP-05 | Asignación académica y grupos | Periodos, Grupos, Inscripciones y Materias | Cubierta |
| UFP-06 | Consulta privada del alumno | Perfil e inscripción propios | Cubierta |
| UFP-07 | Mesa de ayuda | Conversaciones, Mensajes, Lectura y Estado | Cubierta |
| UFP-08 | Reportes e historial | Historial por CURP y Reportes | Cubierta |
| UFP-SUG-01 | Validación de cupo | Grupos e Inscripciones | Cubierta |
| UFP-SUG-02 | Autenticación y roles | Login, JWT y permisos de rutas | Cubierta |
| UFP-SUG-03 | Subsanación documental | Estado del trámite y reemplazo de documentos | Cubierta |

## Revisión conjunta del diseño

La revisión se realizó cruzando la colección contra los apartados de recursos, rutas, contratos, validaciones y permisos. Se comprobó lo siguiente:

- Las 35 combinaciones de método y ruta son únicas.
- Todas las UFP tienen al menos una ruta asociada.
- Las operaciones públicas y temporales no heredan indebidamente el JWT administrativo.
- Los identificadores del usuario autenticado se obtienen de la sesión cuando corresponde.
- Las contraseñas, hashes y datos internos no forman parte de las respuestas documentadas.
- Las rutas de mensajes separan consulta, envío, lectura y cierre de conversación.
- Los módulos complementarios no bloquean la primera entrega funcional de admisión e inscripción.

**Resultado:** el diseño es consistente con el alcance aprobado y queda aceptado como línea base inicial para cerrar el sprint e iniciar la quinta etapa.

## Validación reproducible

La colección se genera y comprueba desde el repositorio:

```bash
npm run postman:build
npm run check:postman
```

El segundo comando verifica el esquema, la cantidad de solicitudes, la ausencia de rutas duplicadas, la presencia de pruebas iniciales y la cobertura de las once UFP.

## Uso inicial

1. Importar la colección en Postman.
2. Ajustar `baseUrl` al entorno local o desplegado.
3. Ejecutar el inicio de sesión para guardar el JWT automáticamente.
4. Ejecutar el flujo de pre-registro para obtener aspirante, expediente y token temporal.
5. Sustituir los identificadores de ejemplo conforme se creen registros reales.

La ejecución completa y las evidencias de casos correctos y de error se documentarán durante la etapa de pruebas.
