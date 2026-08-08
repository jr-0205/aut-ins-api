<p align="center">
  <img src="docs/assets/aut-ins-mark.svg" width="220" alt="Identidad gráfica de AUT-INS">
</p>

<h1 align="center">AUT-INS API</h1>

<p align="center">
  Backend modular para administrar el proceso de admisión e inscripción escolar.
</p>

<p align="center">
  <img alt="Estado del proyecto" src="https://img.shields.io/badge/estado-base%20inicial-374151">
  <img alt="Metodología Scrum" src="https://img.shields.io/badge/metodolog%C3%ADa-Scrum-111827">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-22%2B-4b5563">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-API-1f2937">
</p>

---

## Propósito

AUT-INS busca sustituir el manejo manual de inscripciones por un proceso centralizado, seguro y trazable. El alcance prioritario acompaña al aspirante desde el pre-registro y la carga documental hasta el dictamen, el enrolamiento y la generación de su matrícula institucional.

Esta versión establece la base ejecutable del backend. Los contratos funcionales, las reglas de negocio y el acceso a MySQL se implementarán por módulo conforme sean aprobados en el tablero Scrum.

## Inicio rápido

Requisitos: Node.js 22 o superior y npm.

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

El servidor quedará disponible en `http://localhost:3000`. Para comprobarlo:

```http
GET /api/health
```

Comandos disponibles:

| Comando | Uso |
|---|---|
| `npm run dev` | Inicia el servidor en modo de desarrollo. |
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
| Modelo y normalización de datos | En desarrollo |
| Diseño de recursos de la API | En desarrollo |
| Base modular de Node.js, Express y TypeScript | Disponible |
| Reglas de negocio y persistencia | Pendientes por módulo |
| Pruebas funcionales | Pendientes |
| Front end | Pendiente |

## Tecnologías

| Tecnología | Responsabilidad |
|---|---|
| Node.js y Express | Ejecución y enrutamiento de la API. |
| TypeScript | Tipado y mantenimiento del código. |
| CORS y dotenv | Orígenes autorizados y configuración por entorno. |
| MySQL en Microsoft Azure | Persistencia relacional alojada en la nube. |
| Prisma ORM | Acceso a datos y migraciones, cuando se integre el esquema aprobado. |
| JWT | Autenticación y autorización por rol, pendiente de implementación. |
| EmailJS | Notificaciones externas dirigidas exclusivamente a aspirantes. |
| Git y GitHub | Control de versiones, revisión y colaboración. |

Microsoft Azure alojará únicamente MySQL. GitHub conservará el código fuente; el servicio donde se ejecutará la API aún debe definirse.

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
