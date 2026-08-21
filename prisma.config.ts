import "dotenv/config";
import { defineConfig } from "prisma/config";

// Generar y validar el cliente no requiere una conexión activa. Este valor
// ficticio permite compilar la beta pública; migraciones y semillas continúan
// exigiendo DATABASE_URL de forma explícita en sus respectivos comandos.
const buildDatabaseUrl =
  process.env.DATABASE_URL ??
  "mysql://aut_ins_build:aut_ins_build@127.0.0.1:3306/aut_ins_build";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node scripts/run-seed.cjs",
  },
  datasource: {
    url: buildDatabaseUrl,
  },
});
