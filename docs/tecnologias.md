# Tecnologías y decisiones

## Confirmadas

### MySQL

Base de datos relacional elegida para conservar aspirantes, expedientes, alumnos, grupos, inscripciones, estados y comunicaciones con integridad referencial.

### Microsoft Azure

Se utilizará exclusivamente para alojar MySQL en la nube. Las credenciales y reglas de conexión deberán manejarse como secretos y nunca almacenarse en el repositorio.

### Prisma ORM

Funcionará como capa de acceso entre la API y MySQL. Permitirá definir modelos, ejecutar consultas y administrar migraciones de manera consistente.

### JWT

Permitirá autenticar usuarios y proteger las operaciones de acuerdo con el rol correspondiente.

### EmailJS

Se empleará para confirmar solicitudes y comunicar dictámenes u observaciones al aspirante. No se utilizará como mensajería del alumno.

### Git y GitHub

Mantendrán el historial del código y la documentación, facilitarán el trabajo por ramas y permitirán revisar los cambios antes de integrarlos.

## Pendientes de decisión

- Entorno de ejecución y framework definitivo de la API.
- Servicio donde se ejecutará la API.
- Estrategia de almacenamiento de archivos documentales.
- Herramientas de pruebas automatizadas.
- Estrategia de integración y despliegue continuo.

Toda tecnología adicional deberá registrarse con su uso, justificación, responsable y efecto sobre la arquitectura.
