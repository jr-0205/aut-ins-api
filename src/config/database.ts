import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "./env.js";

const createPrismaClient = (): PrismaClient => {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL es obligatoria para utilizar la base de datos.");
  }

  const adapter = new PrismaMariaDb(env.databaseUrl);
  return new PrismaClient({ adapter });
};

const globalDatabase = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

/**
 * El cliente se crea de forma perezosa: importar los modulos no abre una
 * conexion ni exige DATABASE_URL. Esto mantiene las pruebas y la revision de
 * estructura libres de una base de datos real.
 */
export const getPrisma = (): PrismaClient => {
  const existing = globalDatabase.prisma;

  if (existing) {
    return existing;
  }

  const client = createPrismaClient();
  globalDatabase.prisma = client;
  return client;
};
