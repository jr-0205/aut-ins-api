import type { RequestHandler } from "express";

import { env } from "../../config/env.js";
import { AppError } from "../common/errors/app-error.js";
import "./auth-request.js";
import { verifyToken } from "./token.js";

const bearerToken = (header: string | undefined): string | null => {
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(" ");

  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
};

/** Exige un JWT valido y publica la sesion en request.auth. */
export const requireAuth: RequestHandler = (request, _response, next) => {
  const token = bearerToken(request.get("authorization"));

  if (!token) {
    next(new AppError("Se requiere una sesion activa.", 401, "TOKEN_REQUIRED"));
    return;
  }

  try {
    const payload = verifyToken(token, env.jwtSecret);
    request.auth = {
      usuarioId: payload.usuarioId,
      matricula: payload.matricula,
      tipo: payload.tipo,
      roles: payload.roles,
      alumnoId: payload.alumnoId,
      empleadoId: payload.empleadoId,
    };
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restringe una ruta a los roles indicados. Debe usarse despues de requireAuth.
 */
export const requireRole =
  (...roles: string[]): RequestHandler =>
  (request, _response, next) => {
    const auth = request.auth;

    if (!auth) {
      next(new AppError("Se requiere una sesion activa.", 401, "TOKEN_REQUIRED"));
      return;
    }

    if (!auth.roles.some((rol) => roles.includes(rol))) {
      next(new AppError("No tienes permisos para realizar esta operacion.", 403, "PERMISO_DENEGADO"));
      return;
    }

    next();
  };
