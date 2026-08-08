# Guía de colaboración

Esta guía establece una forma de trabajo sencilla para mantener el repositorio ordenado y relacionar cada cambio con el tablero Scrum.

## Flujo recomendado

1. Seleccionar una tarea preparada en el tablero.
2. Crear una rama desde `develop`.
3. Implementar únicamente el alcance de esa tarea.
4. Ejecutar las validaciones disponibles.
5. Abrir un pull request hacia `develop`.
6. Solicitar la revisión de al menos otro integrante.
7. Integrar el cambio cuando cumpla los criterios de aceptación.

## Nombres de ramas

```text
feature/SCRUM-XX-descripcion-corta
fix/SCRUM-XX-descripcion-corta
docs/SCRUM-XX-descripcion-corta
test/SCRUM-XX-descripcion-corta
```

Ejemplo:

```text
docs/SCRUM-20-recursos-api
```

## Mensajes de commit

Se recomienda utilizar mensajes breves, claros y en modo imperativo:

```text
docs: documentar recursos iniciales de la API
feat: agregar registro de aspirantes
fix: corregir validación de cupo máximo
test: cubrir dictamen rechazado
```

## Pull requests

Cada solicitud deberá indicar:

- Tarea del tablero relacionada.
- Objetivo del cambio.
- Archivos o módulos afectados.
- Evidencias de funcionamiento.
- Validaciones realizadas.
- Trabajo que permanece pendiente.

No deberán incluirse contraseñas, cadenas de conexión reales, tokens, documentos personales ni archivos `.env`.
