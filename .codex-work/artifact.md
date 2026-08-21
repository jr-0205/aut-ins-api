# Contrato de edición del documento AUT-INS

## Referencia

- Archivo: `C:\VS Code\aut-ins-api\docs\entregables\Proyecto_Aplicacion_AUT-INS_2_ETAPA_4_CERRADA.docx`
- SHA-256: `1ECE37134C1034F786DAC6038551758A5912BFB2FB65F2F68DBDF66C67E818C6`
- Evidencia: `.codex-work/stage4-content.json`, `.codex-work/stage4-style.json`, `.codex-work/stage4-reference.pdf` y `.codex-work/reference-pages/`.
- Extensión: 32 páginas, 1 sección, 50 tablas y 1 figura en línea.

## Sistema de página

- Carta vertical: 8.5 x 11 pulgadas.
- Márgenes: superior 0.85, inferior 0.80, izquierdo 0.90 y derecho 0.90 pulgadas.
- Encabezado y pie: 0.35 pulgadas; primera página diferente.
- Encabezado interior: `APLICACIÓN ESCOLAR · DOCUMENTO DEL PROYECTO` en gris y centrado.
- Pie: número de página alineado a la derecha.

## Tipografía y jerarquía

- Cuerpo: Arial 10.5 pt, negro, 6 pt posteriores, alineación justificada cuando corresponda.
- Título 1: 14 pt, negrita, azul `365F91`, 16 pt antes y 7 pt después.
- Título 2: 13 pt, negrita, azul `4F81BD`, 12 pt antes y 5 pt después.
- Título 3: 11 pt, negrita, negro, 9 pt antes y 4 pt después.
- Título 4: negrita cursiva, utilizado únicamente para ejemplos técnicos.
- Código: Consolas con fondo gris claro.

## Tablas y componentes

- Tablas formales con encabezado negro, texto blanco y filas blancas/gris claro alternadas.
- La cadena de valor es la única tabla con color y debe conservar su paleta original.
- Las tablas deben mantenerse dentro del ancho útil, repetir encabezado al dividirse y permitir que las filas crezcan.
- La portada usa una tabla superior con metadatos y un espacio de logotipo a la derecha.
- La figura `Figura 1.1. Diagrama general de actores y Unidades Funcionales de Proceso` debe conservarse sin sustituirse.

## Flujo y slots

- Preservar la portada, el objetivo, la problemática, la cadena de valor y la figura general.
- Actualizar el índice manual para incluir las etapas 5 a 8, conclusiones y anexos.
- Corregir localmente la matriz de actores y las UFP para respetar el alcance actual.
- Actualizar tecnologías con la implementación real del repositorio.
- Reemplazar por completo la etapa 3, desde `3. Tercera etapa...` hasta antes de la etapa 4, porque el modelo físico cambió y ya cuenta con migración y catálogos.
- Conservar la estructura y las tablas de la etapa 4; añadir una nota que diferencie el contrato diseñado de los endpoints actualmente implementados.
- Sustituir los textos pendientes de las etapas 5, 6 y 7 por resultados verificables y agregar la etapa 8, conclusiones y anexos.

## Preservación de paquete

- Preservar estilos, tema, numeración, encabezado, pie, relaciones de la figura existente y configuración de sección.
- Se autoriza modificar `word/document.xml`, agregar la imagen del logotipo y su relación, y actualizar `docProps`.
- No se autorizan cambios a la figura existente, su relación ni el encabezado/pie salvo actualización automática de campos.

## Puertas de fidelidad

- La primera página debe conservar el diseño de portada e incorporar el logo AUT-INS.
- No debe reaparecer la página casi vacía observada antes de la etapa 3.
- La cadena de valor y la figura 1.1 deben permanecer juntas y legibles.
- Las secciones nuevas deben usar la jerarquía y las tablas del documento base.
- Todas las afirmaciones de implementación deben coincidir con el repositorio: base de datos y front demostrativo implementados; endpoints de negocio todavía pendientes.
- El documento final deberá exportarse con Microsoft Word, revisarse página por página y corregirse hasta eliminar cortes, solapamientos y tablas defectuosas.
