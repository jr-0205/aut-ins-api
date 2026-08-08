# Arquitectura del código fuente

La API utiliza una estructura modular. Cada carpeta representa una capacidad del sistema y evita mezclar responsabilidades entre áreas.

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

## Responsabilidad de cada módulo

| Módulo | Alcance |
|---|---|
| `auth` | Identidad, sesión y permisos. |
| `aspirantes` | Pre-registro, seguimiento y subsanación documental. |
| `admisiones` | Revisión documental y dictamen. |
| `control-escolar` | Enrolamiento, matrícula y gestión administrativa. |
| `coordinacion` | Asignaciones académicas dentro del alcance aprobado. |
| `alumnos` | Consulta personal del alumno y operaciones autorizadas. |
| `mensajes` | Comunicación interna para alumnos y personal. |
| `historial` | Trazabilidad de trámites y expedientes asociados a una CURP. |
| `common` | Errores, middleware y utilidades compartidas. |

## Regla de crecimiento

Cada módulo comienza con su archivo de rutas. Al implementarlo podrá incorporar controladores, servicios, repositorios y esquemas de validación dentro de su propia carpeta. `common` solo debe contener piezas reutilizadas por más de un módulo.

La estructura creada no implementa todavía reglas de negocio ni modifica el esquema de la base de datos. Esas decisiones deben provenir del contrato de API y del modelo de datos aprobados.
