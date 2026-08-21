import { app } from "./app.js";
import { env } from "./config/env.js";

const host = "0.0.0.0";

const server = app.listen(env.port, host, () => {
  console.log(`AUT-INS API disponible en http://localhost:${env.port}/api/health`);
});

const shutdown = (signal: NodeJS.Signals): void => {
  console.log(`${signal} recibido. Cerrando AUT-INS API...`);
  server.close((error) => {
    if (error) {
      console.error("No fue posible cerrar el servidor correctamente.", error);
      process.exitCode = 1;
      return;
    }

    process.exitCode = 0;
  });
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
