import { createHmac, timingSafeEqual } from "node:crypto";

import { AppError } from "../common/errors/app-error.js";
import type { AuthContext, TokenPayload } from "./auth.types.js";

/**
 * Emision y validacion de JWT firmados con HS256 usando solo node:crypto.
 * No se agregan dependencias externas para conservar el lockfile y permitir
 * que `npm ci` siga funcionando sin pasos adicionales.
 */

const ALGORITHM = "HS256";
const HEADER = { alg: ALGORITHM, typ: "JWT" } as const;
const CLOCK_TOLERANCE_SECONDS = 5;

const encodeJson = (value: unknown): string =>
  Buffer.from(JSON.stringify(value), "utf8").toString("base64url");

const sign = (content: string, secret: string): string =>
  createHmac("sha256", secret).update(content).digest("base64url");

export interface SignTokenOptions {
  secret: string;
  expiresInSeconds: number;
}

export const signToken = (context: AuthContext, options: SignTokenOptions): string => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    ...context,
    iat: issuedAt,
    exp: issuedAt + options.expiresInSeconds,
  };

  const encodedHeader = encodeJson(HEADER);
  const encodedPayload = encodeJson(payload);
  const signature = sign(`${encodedHeader}.${encodedPayload}`, options.secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const invalidToken = (message: string): AppError =>
  new AppError(message, 401, "TOKEN_INVALID");

export const verifyToken = (token: string, secret: string): TokenPayload => {
  const segments = token.split(".");

  if (segments.length !== 3) {
    throw invalidToken("El token de sesion esta mal formado.");
  }

  const [encodedHeader, encodedPayload, providedSignature] = segments as [string, string, string];

  let header: { alg?: unknown };
  try {
    header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8")) as { alg?: unknown };
  } catch {
    throw invalidToken("El token de sesion esta mal formado.");
  }

  if (header.alg !== ALGORITHM) {
    throw invalidToken("El algoritmo del token no es soportado.");
  }

  const expectedSignature = Buffer.from(sign(`${encodedHeader}.${encodedPayload}`, secret), "base64url");
  const providedBuffer = Buffer.from(providedSignature, "base64url");

  if (
    expectedSignature.length !== providedBuffer.length ||
    !timingSafeEqual(expectedSignature, providedBuffer)
  ) {
    throw invalidToken("La firma del token de sesion no es valida.");
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as TokenPayload;
  } catch {
    throw invalidToken("El contenido del token de sesion no es valido.");
  }

  const now = Math.floor(Date.now() / 1000);

  if (typeof payload.exp !== "number" || payload.exp <= now - CLOCK_TOLERANCE_SECONDS) {
    throw new AppError("La sesion expiro. Vuelve a iniciar sesion.", 401, "TOKEN_EXPIRED");
  }

  return payload;
};
