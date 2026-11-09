import "dotenv/config";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { PrismaClient } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/modules/auth/password.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL es obligatoria para ejecutar los datos semilla.");
}

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });

const estadosExpediente = [
  {
    codigo: "PENDIENTE_DOCUMENTOS",
    descripcion: "El aspirante todavía debe completar su expediente.",
    bloqueaCurp: true,
    esTerminal: false,
    orden: 10,
  },
  {
    codigo: "PENDIENTE_REVISION",
    descripcion: "El expediente se encuentra listo para revisión de Admisiones.",
    bloqueaCurp: true,
    esTerminal: false,
    orden: 20,
  },
  {
    codigo: "OBSERVADO",
    descripcion: "El aspirante debe subsanar uno o más documentos.",
    bloqueaCurp: true,
    esTerminal: false,
    orden: 30,
  },
  {
    codigo: "ACEPTADO",
    descripcion: "Admisiones aprobó el expediente para enrolamiento.",
    bloqueaCurp: true,
    esTerminal: false,
    orden: 40,
  },
  {
    codigo: "RECHAZADO",
    descripcion: "El proceso terminó sin generar un alumno.",
    bloqueaCurp: false,
    esTerminal: true,
    orden: 50,
  },
  {
    codigo: "CANCELADO",
    descripcion: "El proceso fue cerrado antes del enrolamiento.",
    bloqueaCurp: false,
    esTerminal: true,
    orden: 60,
  },
] as const;

const estadosAlumno = [
  {
    codigo: "ACTIVO",
    descripcion: "El alumno mantiene una relación académica vigente.",
    bloqueaCurp: true,
    esTerminal: false,
    orden: 10,
  },
  {
    codigo: "BAJA_TEMPORAL",
    descripcion: "La relación académica está suspendida, pero puede reanudarse.",
    bloqueaCurp: true,
    esTerminal: false,
    orden: 20,
  },
  {
    codigo: "BAJA_DEFINITIVA",
    descripcion: "La relación académica terminó por baja definitiva.",
    bloqueaCurp: false,
    esTerminal: true,
    orden: 30,
  },
  {
    codigo: "EGRESADO",
    descripcion: "El alumno concluyó su trayectoria académica.",
    bloqueaCurp: false,
    esTerminal: true,
    orden: 40,
  },
] as const;

const estadosInscripcion = [
  {
    codigo: "ACTIVA",
    descripcion: "La inscripción se encuentra vigente y ocupa un lugar.",
    ocupaCupo: true,
    esTerminal: false,
  },
  {
    codigo: "CANCELADA",
    descripcion: "La inscripción fue cancelada y ya no ocupa cupo.",
    ocupaCupo: false,
    esTerminal: true,
  },
  {
    codigo: "FINALIZADA",
    descripcion: "La inscripción concluyó al terminar el periodo.",
    ocupaCupo: false,
    esTerminal: true,
  },
] as const;

const roles = [
  { codigo: "ADMISIONES", nombre: "Coordinación de Admisiones" },
  { codigo: "CONTROL_ESCOLAR", nombre: "Control Escolar" },
  { codigo: "COORDINACION", nombre: "Coordinación Académica" },
] as const;

const tiposDocumento = [
  { codigo: "ACTA_NACIMIENTO", nombre: "Acta de nacimiento", orden: 10 },
  { codigo: "CERTIFICADO_ESTUDIOS", nombre: "Certificado de estudios", orden: 20 },
  { codigo: "IDENTIFICACION_OFICIAL", nombre: "Identificación oficial", orden: 30 },
  { codigo: "COMPROBANTE_DOMICILIO", nombre: "Comprobante de domicilio", orden: 40 },
  { codigo: "CURP", nombre: "Constancia de CURP", orden: 50 },
  { codigo: "FOTOGRAFIA", nombre: "Fotografía", orden: 60 },
] as const;

/**
 * Cuentas de personal solo para probar el inicio de sesion en desarrollo.
 * Se crean unicamente cuando SEED_DEMO_USERS="true" y nunca en produccion.
 */
const usuariosDemo = [
  {
    matricula: "20260001",
    password: "Cambiar123!",
    rolCodigo: "ADMISIONES",
    nombre: "Admisiones",
    apellidoPaterno: "Demo",
  },
  {
    matricula: "20260002",
    password: "Cambiar123!",
    rolCodigo: "CONTROL_ESCOLAR",
    nombre: "Control Escolar",
    apellidoPaterno: "Demo",
  },
] as const;

async function seedUsuariosDemo(): Promise<number> {
  if (process.env.SEED_DEMO_USERS !== "true") {
    return 0;
  }

  let creados = 0;

  for (const demo of usuariosDemo) {
    const rol = await prisma.rolEmpleado.findUnique({ where: { codigo: demo.rolCodigo } });

    if (!rol) {
      continue;
    }

    const passwordHash = await hashPassword(demo.password);

    const usuario = await prisma.usuario.upsert({
      where: { matricula: demo.matricula },
      update: { passwordHash, activo: true, debeCambiarPassword: false },
      create: {
        matricula: demo.matricula,
        passwordHash,
        tipo: "EMPLEADO",
        activo: true,
        debeCambiarPassword: false,
      },
    });

    const empleado = await prisma.empleado.findUnique({ where: { usuarioId: usuario.id } });

    if (!empleado) {
      await prisma.empleado.create({
        data: {
          usuarioId: usuario.id,
          nombre: demo.nombre,
          apellidoPaterno: demo.apellidoPaterno,
          rolId: rol.id,
          activo: true,
        },
      });
    }

    creados += 1;
  }

  return creados;
}

async function main(): Promise<void> {
  await prisma.$transaction([
    ...estadosExpediente.map((estado) =>
      prisma.estadoExpediente.upsert({
        where: { codigo: estado.codigo },
        update: estado,
        create: estado,
      }),
    ),
    ...estadosAlumno.map((estado) =>
      prisma.estadoAlumno.upsert({
        where: { codigo: estado.codigo },
        update: estado,
        create: estado,
      }),
    ),
    ...estadosInscripcion.map((estado) =>
      prisma.estadoInscripcion.upsert({
        where: { codigo: estado.codigo },
        update: estado,
        create: estado,
      }),
    ),
    ...roles.map((rol) =>
      prisma.rolEmpleado.upsert({
        where: { codigo: rol.codigo },
        update: { ...rol, activo: true },
        create: { ...rol, activo: true },
      }),
    ),
    ...tiposDocumento.map((tipo) =>
      prisma.tipoDocumentoCatalogo.upsert({
        where: { codigo: tipo.codigo },
        update: { ...tipo, requerido: true, activo: true },
        create: { ...tipo, requerido: true, activo: true },
      }),
    ),
  ]);

  const usuariosDemoCreados = await seedUsuariosDemo();

  console.log(
    `Datos semilla aplicados: ${estadosExpediente.length} estados de expediente, ` +
      `${estadosAlumno.length} estados de alumno, ${estadosInscripcion.length} estados de inscripción, ` +
      `${roles.length} roles y ${tiposDocumento.length} tipos de documento.`,
  );

  if (usuariosDemoCreados > 0) {
    console.log(
      `Usuarios demo habilitados: ${usuariosDemoCreados} cuentas de personal (SEED_DEMO_USERS=true).`,
    );
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
