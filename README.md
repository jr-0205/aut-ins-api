<p align="center">
  <img src="public/assets/img/aut-ins-logo.svg" width="280" alt="Logotipo oficial de AUT-INS">
</p>

> **Estado beta académico:** la plataforma base, la demostración por roles y el contrato documental están disponibles. La autenticación real y las reglas de negocio continúan en desarrollo; no deben emplearse datos personales reales.

<h1 align="center">AUT-INS API</h1>

<p align="center">
  Backend modular para administrar el proceso de admisión e inscripción escolar.
</p>

<p align="center">
  <img alt="Estado del proyecto" src="https://img.shields.io/badge/estado-demo%20funcional-1d5aa6">
  <img alt="Metodología Scrum" src="https://img.shields.io/badge/metodolog%C3%ADa-Scrum-111827">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-22%2B-4b5563">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-API-1f2937">
</p>

---

## Propósito

AUT-INS busca sustituir el manejo manual de inscripciones por un proceso centralizado, seguro y trazable. El alcance prioritario acompaña al aspirante desde el pre-registro y la carga documental hasta el dictamen, el enrolamiento y la generación de su matrícula institucional.

Esta versión establece la base ejecutable del backend, el contrato inicial de la API y el modelo MySQL migrable. Las reglas operativas de cada módulo se implementarán conforme a los contratos aprobados en el tablero Scrum.

## Inicio rápido

Requisitos generales: Node.js 22 o superior y npm. Para trabajar con persistencia local se requiere MySQL 8.4 instalado.

```powershell
npm install
npm run mysql:setup
npm run db:deploy
npm run db:seed
npm run dev
```

La interfaz quedará disponible en `http://localhost:3000` y la comprobación de la API en:

```http
GET /api/health
```

## Despliegue en Render

El repositorio incluye [`render.yaml`](render.yaml) para crear un Web Service gratuito y reproducible desde GitHub.

1. En Render selecciona **New → Blueprint**.
2. Conecta el repositorio `jr-0205/aut-ins-api` y la rama `main`.
3. Confirma el servicio `aut-ins-api` definido por el Blueprint.
4. Espera a que termine el despliegue y comprueba `GET /api/health` en la URL asignada.

La configuración versionada utiliza Node.js 24.14.1, ejecuta `npm ci --include=dev && npm run build`, inicia con `npm start` y configura `/api/health` como comprobación HTTP. `JWT_SECRET` se genera dentro de Render y no se guarda en Git. En producción, CORS autoriza automáticamente el dominio HTTPS asignado por Render; otros orígenes deben declararse explícitamente en `CORS_ORIGIN`.

La beta pública actual puede mostrar la interfaz y los flujos demostrativos sin base remota porque esos datos se mantienen en el navegador. Para activar persistencia real, agrega `DATABASE_URL` en **Environment** con una conexión MySQL accesible desde internet; una dirección local como `127.0.0.1:3307` sólo funciona en tu computadora. Después ejecuta `npm run db:deploy` y `npm run db:seed` contra esa base.

El front end incluye una modalidad demostrativa almacenada en el navegador. Desde el inicio de sesión se pueden cargar accesos de prueba para Admisiones, Control Escolar, Coordinación Académica y Alumno. Al enrolar un aspirante aceptado, la demostración genera matrícula, contraseña temporal y un PDF confidencial descargable; esas credenciales permiten abrir inmediatamente el portal del nuevo alumno. Esta modalidad permite validar navegación y operaciones iniciales mientras se implementan la autenticación JWT y los endpoints definitivos; no debe utilizarse con datos personales reales.

### Accesos de demostración

| Área | Usuario | Contraseña | Operaciones disponibles |
|---|---|---|---|
| Admisiones | `admisiones@aut-ins.demo` | `Admisiones2026!` | Revisar aspirantes y emitir dictámenes. |
| Control Escolar | `control@aut-ins.demo` | `Control2026!` | Enrolar aspirantes aceptados, generar matrícula y atender solicitudes. |
| Coordinación | `coordinacion@aut-ins.demo` | `Coordinacion2026!` | Gestionar grupos, revisar cupos y recibir mensajes dirigidos. |
| Alumno | `AUT20260001` | `Alumno2026!` | Consultar perfil, inscripción y enviar solicitudes. |

El formulario comprueba longitudes y campos obligatorios, limita a cinco intentos fallidos y bloquea durante 30 segundos antes de permitir un nuevo intento. Las credenciales se muestran únicamente como datos ficticios de evaluación. La experiencia visual usa un sistema oscuro de navegación lateral, tarjetas, tablas y estados consistente entre los cuatro paneles.

Todas las áreas comparten la misma política de sesión: cierre automático después de 15 minutos sin actividad por defecto, aviso previo y retorno obligatorio al inicio de sesión después de cerrar o expirar la sesión. Desde cada panel puede configurarse una vigencia de demostración de entre 10 segundos y 30 minutos; el botón de retroceso no permite recuperar un panel sin una sesión vigente.

La mensajería demostrativa distingue destinatarios: el alumno puede enviar una solicitud al departamento de Control Escolar, visible para cualquier usuario con ese rol, o dirigirla a un coordinador específico, quien la recibe en su bandeja personal.

Comandos disponibles:

| Comando | Uso |
|---|---|
| `npm run dev` | Inicia el servidor en modo de desarrollo. |
| `npm run mysql:setup` | Prepara MySQL local, la base y credenciales seguras. |
| `npm run db:deploy` | Aplica las migraciones pendientes. |
| `npm run db:seed` | Carga o actualiza los catálogos iniciales. |
| `npm run check` | Ejecuta todas las validaciones del repositorio. |
| `npm test` | Compila y ejecuta las pruebas HTTP del contrato base. |
| `npm run check:structure` | Verifica módulos e importaciones internas. |
| `npm run typecheck` | Revisa los tipos sin generar archivos. |
| `npm run build` | Compila TypeScript en `dist/`. |
| `npm start` | Ejecuta la compilación generada. |

## Arquitectura modular

```text
src/
|-- app.ts
|-- server.ts
|-- config/
`-- modules/
    |-- auth/
    |-- aspirantes/
    |-- admisiones/
    |-- control-escolar/
    |-- coordinacion/
    |-- alumnos/
    |-- mensajes/
    |-- historial/
    `-- common/
```

Todas las rutas se agrupan bajo `/api`. Cada módulo tiene una frontera explícita para que su desarrollo no redefina tareas pertenecientes a otra etapa. Consulta la [guía de arquitectura del código](src/README.md) para conocer el alcance de cada carpeta.

## Estado del proyecto

| Área | Estado |
|---|---|
| Análisis, actores, UFP y cadena de valor | Concluido |
| Tecnologías y requisitos | Registrados |
| Modelo y normalización de datos | Definido y migrado localmente |
| Diseño de recursos de la API | Documentado y revisado |
| Base modular de Node.js, Express y TypeScript | Disponible |
| Reglas de negocio por módulo | Pendientes de implementación |
| Pruebas funcionales | Pendientes |
| Front end | Demostración funcional por roles, validación de acceso y flujos de edición; integración real con la API pendiente |

## Tecnologías

| Tecnología | Responsabilidad |
|---|---|
| Node.js y Express | Ejecución y enrutamiento de la API. |
| TypeScript | Tipado y mantenimiento del código. |
| CORS y dotenv | Orígenes autorizados y configuración por entorno. |
| MySQL en Microsoft Azure | Persistencia relacional alojada en la nube. |
| Prisma ORM | Acceso tipado a datos, migraciones y catálogos iniciales. |
| JWT | Autenticación y autorización por rol, pendiente de implementación. |
| EmailJS | Notificaciones externas dirigidas exclusivamente a aspirantes. |
| HTML5, CSS3 y Bootstrap 5.3 | Interfaz responsive, formularios y paneles por rol. |
| jsPDF 4.2 | Generación local del documento descargable con las credenciales iniciales del alumno. |
| Git y GitHub | Control de versiones, revisión y colaboración. |

Microsoft Azure puede alojar MySQL cuando se active la persistencia remota. GitHub conserva el código fuente y Render ejecuta la beta pública de la aplicación.

## Documentación

- [Índice documental](docs/README.md)
- [1. Alcance funcional](docs/01-alcance.md)
- [2. Tecnologías y decisiones](docs/02-tecnologias.md)
- [3. Modelo de datos](docs/03-modelo-datos.md)
- [4. Diseño preliminar de la API](docs/04-diseno-api.md)
- [5. Organización Scrum](docs/05-scrum.md)
- [6. Historial de cambios](docs/06-historial-cambios.md)
- [Diagrama de casos de uso — nivel 0](docs/diagramas/01-casos-de-uso-nivel-0.md)

## Colaboración

Cada cambio debe vincularse con una tarea del tablero, desarrollarse en una rama creada desde `main` e integrarse mediante un pull request revisado. Consulta la [guía de colaboración](.github/CONTRIBUTING.md) y la [política de seguridad](.github/SECURITY.md).

## Equipo

- Carlos Eduardo Martínez Morales — dirección técnica y desarrollo.
- Daen Sánchez Marín — coordinación del equipo y desarrollo.
- Fernando Pérez Acuautla — desarrollo.
- Fernando Aguilar Velázquez — desarrollo.
- Pedro Jair Suárez Flores — pruebas.

## Aviso

Este repositorio corresponde a un proyecto académico privado. No deben publicarse credenciales, tokens, documentos personales ni datos reales de aspirantes o alumnos.
