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

export const prisma = globalDatabase.prisma ?? createPrismaClient();

if (env.nodeEnv !== "production") {
  globalDatabase.prisma = prisma;
}
