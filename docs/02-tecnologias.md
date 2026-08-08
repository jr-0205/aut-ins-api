# 2. Tecnologías y decisiones

## Confirmadas

### Node.js

Será el entorno de ejecución de la API. Permite utilizar el mismo ecosistema de JavaScript y TypeScript en el backend, dispone de soporte amplio para servicios web y facilita el trabajo conjunto del equipo.

### Express

Será la base HTTP de la API. Su sistema de rutas y middleware permite separar las capacidades por módulo sin imponer una arquitectura innecesariamente compleja para el alcance académico del proyecto.

Como soporte inicial se utilizarán `cors` para declarar los orígenes autorizados y `dotenv` para cargar la configuración local sin almacenar secretos en el código. Los controles de seguridad específicos se incorporarán con la implementación de autenticación.

### TypeScript

Será el lenguaje principal del backend. El tipado estático ayuda a detectar errores antes de ejecutar la aplicación y vuelve más claros los contratos entre rutas, servicios y acceso a datos.

### MySQL

Base de datos relacional elegida para conservar aspirantes, expedientes, alumnos, grupos, inscripciones, estados y comunicaciones con integridad referencial.

### Microsoft Azure

Se utilizará exclusivamente para alojar MySQL en la nube. Las credenciales y reglas de conexión deberán manejarse como secretos y nunca almacenarse en el repositorio. Azure no será, por ahora, el alojamiento de la API.

### Prisma ORM

Funcionará como capa de acceso entre la API y MySQL. Permitirá definir modelos, ejecutar consultas y administrar migraciones de manera consistente una vez integrado el esquema aprobado.

### JWT

Permitirá autenticar usuarios y proteger las operaciones de acuerdo con el rol correspondiente. Su implementación pertenece al módulo `auth` y no debe definir por sí misma las reglas funcionales de los demás módulos.

### EmailJS

Se empleará para confirmar solicitudes y comunicar dictámenes u observaciones al aspirante. No se utilizará como mensajería del alumno; esa comunicación se resolverá mediante el módulo interno `mensajes`.

### Git y GitHub

Mantendrán el historial del código y la documentación, facilitarán el trabajo por ramas y permitirán revisar los cambios antes de integrarlos. GitHub almacenará el repositorio, pero no ejecutará la API.

## Pendientes de decisión

- Servicio donde se ejecutará la API.
- Estrategia de almacenamiento de archivos documentales.
- Herramientas y alcance de las pruebas automatizadas.
- Estrategia de integración y despliegue continuo.

Toda tecnología adicional deberá registrarse con su uso, justificación, responsable y efecto sobre la arquitectura.
