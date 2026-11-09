# 6. Historial de cambios

Los cambios relevantes del proyecto se registrarán en este archivo.

## Sin publicar

### Agregado

- Estructura inicial del repositorio.
- README principal del proyecto.
- Documentación de alcance, tecnologías, base de datos y API.
- Diagrama general de casos de uso.
- Plantillas de colaboración para Scrum y pull requests.
- Base ejecutable de Node.js, Express y TypeScript.
- Módulos iniciales de autenticación, aspirantes, admisiones, Control Escolar, coordinación, alumnos, mensajes e historial.
- Ruta de diagnóstico `GET /api/health` y manejo uniforme de rutas inexistentes y errores.

### Autenticación

- `POST /api/auth/login`: valida matrícula y contraseña y devuelve un JWT de sesión.
- `GET /api/auth/me`: devuelve el contexto de la sesión a partir del JWT.
- Contraseñas almacenadas con scrypt (`node:crypto`) en formato versionado; sin dependencias externas nuevas.
- JWT firmados con HS256 (`node:crypto`) con expiración configurable por `JWT_EXPIRES_IN`.
- Guardias reutilizables `requireAuth` y `requireRole` para proteger los módulos restantes.
- Comparación de relleno en el inicio de sesión para no revelar qué matrículas existen.
- `JWT_SECRET` obligatorio (mínimo 32 caracteres) en producción; en desarrollo se admite un secreto efímero.
- Cliente Prisma con creación perezosa: importar los módulos ya no exige `DATABASE_URL`.
- Cuentas de personal de prueba opcionales con `SEED_DEMO_USERS=true` (solo desarrollo).
- Pruebas de contraseñas, JWT y servicio de autenticación en `tests/auth.test.ts`.

### Base de datos local

- Verificada la compatibilidad de la migración inicial y los datos semilla con MariaDB 10.4 (XAMPP, puerto `3306`), además de MySQL 8.4.
- `mysql:setup` queda como opción para una instancia aislada en el puerto `3307`; también puede usarse un servidor ya instalado definiendo `DATABASE_URL`.
- Procedimiento de las dos rutas documentado en `prisma/README.md` y en el inicio rápido del README principal.

### Organizado

- Documentación numerada conforme al orden de desarrollo del proyecto.
- Guías de colaboración y seguridad centralizadas en `.github`.
- Navegación y estructura principal simplificadas.
- Responsabilidades funcionales separadas por módulo, sin modificar todavía el modelo de datos ni implementar reglas de negocio.
