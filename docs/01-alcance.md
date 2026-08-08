# 1. Alcance funcional

## Objetivo

Administrar el proceso de admisión e inscripción escolar mediante una solución que centralice la información, reduzca duplicidades, controle la disponibilidad de grupos y permita consultar el estado de cada trámite.

## Núcleo del proyecto

1. Pre-registro del aspirante.
2. Captura de datos y carrera solicitada.
3. Carga del expediente digital.
4. Validación de duplicidad y vigencia del CURP.
5. Revisión documental por Admisiones.
6. Emisión del dictamen.
7. Corrección de documentos observados.
8. Notificación del avance al aspirante.
9. Enrolamiento del aspirante aceptado.
10. Generación de matrícula y credenciales.
11. Inscripción y asignación de grupo.
12. Validación de disponibilidad y cupo máximo.

## Componentes complementarios

- Portal privado del alumno.
- Consulta de información personal y escolar.
- Mensajería interna entre alumnos y personal.
- Administración académica ampliada.
- Reportes estadísticos para Dirección.

Estos componentes ayudan a demostrar la continuidad del sistema, pero no deberán desplazar el objetivo principal de asegurar el proceso de inscripción.

## Límites confirmados

- EmailJS se utilizará únicamente para notificaciones al aspirante.
- Cuando la persona sea alumno, la comunicación se realizará dentro de su plataforma mediante conversaciones y mensajes.
- Microsoft Azure alojará exclusivamente la base de datos MySQL.
- El repositorio GitHub almacenará el código y la documentación; no representa el alojamiento de ejecución de la API.
