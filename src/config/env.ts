import { randomBytes } from "node:crypto";
import "dotenv/config";

const parsePort = (rawValue: string | undefined): number => {
  const port = Number.parseInt(rawValue ?? "3000", 10);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT debe ser un numero entero entre 1 y 65535.");
  }

  return port;
};

/** Convierte "3600", "30m", "1h" o "7d" en segundos. */
const parseDuration = (rawValue: string | undefined): number => {
  const value = (rawValue ?? "1h").trim();
  const match = /^(\d+)\s*([smhd])?$/i.exec(value);

  if (!match) {
    throw new Error("JWT_EXPIRES_IN debe usar el formato 3600, 45s, 30m, 1h o 7d.");
  }

  const amount = Number.parseInt(match[1] ?? "0", 10);
  const unit = (match[2] ?? "s").toLowerCase();
  const factor = unit === "m" ? 60 : unit === "h" ? 3_600 : unit === "d" ? 86_400 : 1;
  const seconds = amount * factor;

  if (seconds < 1) {
    throw new Error("JWT_EXPIRES_IN debe representar una duracion mayor que cero.");
  }

  return seconds;
};

/**
 * En produccion el secreto es obligatorio. En desarrollo y pruebas se acepta un
 * secreto efimero para que el proyecto arranque sin configuracion manual; ese
 * secreto cambia en cada reinicio, por lo que solo sirve para trabajo local.
 */
const resolveJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET?.trim();

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET es obligatorio y debe tener al menos 32 caracteres en produccion.");
  }

  console.warn(
    "[aut-ins] JWT_SECRET no definido o demasiado corto. Se usa un secreto efimero de desarrollo.",
  );

  return randomBytes(48).toString("hex");
};

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT),
  corsOrigin:
    process.env.CORS_ORIGIN ??
    (process.env.RENDER_EXTERNAL_HOSTNAME
      ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
      : process.env.NODE_ENV === "production"
        ? ""
        : "*"),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: resolveJwtSecret(),
  jwtExpiresInSeconds: parseDuration(process.env.JWT_EXPIRES_IN),
});
