# Base de datos con Prisma y MySQL

Este directorio contiene la línea base del modelo de datos AUT-INS.

## Estructura

- `schema.prisma`: modelos, relaciones, tipos e índices.
- `migrations/20260809000000_init/migration.sql`: creación inicial de la base.
- `seed.ts`: estados, roles y tipos documentales iniciales.
- `migrations/migration_lock.toml`: proveedor fijado en MySQL.

## Preparación local

Requisito: MySQL 8.4 instalado en Windows. El repositorio incluye un administrador local que aísla los datos en `.local/mysql`, usa el puerto `3307` y genera credenciales aleatorias fuera de Git.

1. Instalar dependencias y preparar la instancia, la base y el archivo `.env`:

```powershell
npm install
npm run mysql:setup
```

2. Aplicar la migración y cargar los catálogos iniciales:

```powershell
npm run db:deploy
npm run db:seed
```

3. Verificar o administrar la instancia cuando sea necesario:

```powershell
npm run mysql:status
npm run mysql:start
npm run mysql:stop
```

La conexión generada utiliza esta forma, sin exponer la contraseña real:

```env
DATABASE_URL="mysql://aut_ins:CONTRASENA_GENERADA@127.0.0.1:3307/aut_ins_local"
```

4. Abrir el visor opcional:

```bash
npm run db:studio
```

## Producción

Microsoft Azure se utilizará exclusivamente para alojar MySQL. En despliegues se deberá proporcionar `DATABASE_URL` desde variables seguras y ejecutar:

```bash
npm run db:deploy
```

No se debe ejecutar `migrate dev` sobre la base de producción ni incluir credenciales reales en Git.

En otra instalación limpia se usa `db:deploy`, porque la migración inicial ya forma parte del repositorio. `db:migrate` queda reservado para crear migraciones nuevas durante el desarrollo del modelo.

## Reglas operativas

- Los registros históricos no se eliminan.
- Los cambios de estado, cupo, enrolamiento y documentos se ejecutan en transacciones.
- El cupo se calcula con inscripciones cuyo estado indique `ocupaCupo = true`.
- `tbl_proceso_activo` es la autoridad para impedir dos procesos vigentes de la misma persona.
- `tbl_documento_vigente` es la autoridad para seleccionar la versión documental actual.
