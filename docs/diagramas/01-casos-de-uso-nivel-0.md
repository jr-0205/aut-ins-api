# Diagrama 1. Casos de uso — Nivel 0

El sistema se representa como el límite que contiene las funciones y automatizaciones. Por esta razón, `Sistema` no aparece como actor externo.

```mermaid
flowchart LR
    subgraph LEFT["ACTORES DEL PROCESO DE INGRESO"]
        direction TB
        ASP["ASPIRANTE"]
        ADM["COORDINACIÓN DE<br/>ADMISIONES"]
        CE["CONTROL ESCOLAR"]
    end

    subgraph SYS["SISTEMA AUT-INS"]
        direction TB

        subgraph F1["1 · ADMISIÓN"]
            direction LR
            UC01(["Pre-registrar aspirante<br/>y cargar documentos"])
            UC02(["Revisar expediente<br/>y emitir dictamen"])
            UC03(["Corregir documentación<br/>observada"])
        end

        subgraph F2["2 · INSCRIPCIÓN Y CONTROL ESCOLAR"]
            direction LR
            UC04(["Enrolar aspirante<br/>aceptado"])
            UC05(["Administrar alumnos<br/>y personal"])
            UC06(["Asignar grupo y<br/>controlar disponibilidad"])
        end

        subgraph F3["3 · PORTAL Y SERVICIOS COMPLEMENTARIOS"]
            direction LR
            UC07(["Consultar información<br/>personal y escolar"])
            UC08(["Gestionar mensajes<br/>internos"])
            UC09(["Consultar reportes<br/>estadísticos"])
        end

        subgraph AUTO["AUTOMATIZACIONES TRANSVERSALES"]
            direction LR
            AU01(["Validar CURP y<br/>procesos vigentes"])
            AU02(["Notificar al aspirante<br/>mediante EmailJS"])
            AU03(["Generar matrícula y<br/>credenciales"])
            AU04(["Autenticar mediante<br/>JWT y roles"])
        end
    end

    subgraph RIGHT["ACTORES DEL PROCESO ESCOLAR"]
        direction TB
        COORD["COORDINADOR<br/>ACADÉMICO"]
        ALU["ALUMNO"]
        DIR["DIRECCIÓN ESCOLAR"]
    end

    ASP --- UC01
    ASP --- UC03
    ADM --- UC02
    CE --- UC04
    CE --- UC05
    CE --- UC06
    CE --- UC08
    UC06 --- COORD
    UC08 --- COORD
    UC07 --- ALU
    UC08 --- ALU
    UC09 --- DIR

    UC01 -. "incluye" .-> AU01
    UC01 -. "incluye" .-> AU02
    UC02 -. "genera" .-> AU02
    UC02 -. "si es aceptado" .-> UC04
    UC04 -. "incluye" .-> AU03
    UC06 -. "requiere" .-> AU04
    UC07 -. "requiere" .-> AU04
    UC08 -. "requiere" .-> AU04

    classDef actor fill:#ffffff,stroke:#111827,stroke-width:2px,color:#111827,font-weight:bold
    classDef principal fill:#ffffff,stroke:#1f2937,stroke-width:1.4px,color:#111827
    classDef automatico fill:#f3f4f6,stroke:#6b7280,stroke-width:1.2px,color:#111827

    class ASP,ADM,CE,COORD,ALU,DIR actor
    class UC01,UC02,UC03,UC04,UC05,UC06,UC07,UC08,UC09 principal
    class AU01,AU02,AU03,AU04 automatico
```

Dirección Escolar se considera un actor complementario porque consulta reportes generales. Si el equipo decide excluir ese módulo del alcance evaluado, deberá retirarse también este actor.
