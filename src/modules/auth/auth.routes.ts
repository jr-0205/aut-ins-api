import { Router } from "express";

import { env } from "../../config/env.js";
import { AppError } from "../common/errors/app-error.js";
import { requireAuth } from "./auth.middleware.js";
import { autenticarCredenciales, type Credenciales } from "./auth.service.js";
import { signToken } from "./token.js";

export const authRouter = Router();

const validarCredenciales = (body: unknown): Credenciales => {
  if (typeof body !== "object" || body === null) {
    throw new AppError("El cuerpo de la solicitud es obligatorio.", 400, "VALIDATION_ERROR");
  }

  const { matricula, password } = body as Record<string, unknown>;

  if (typeof matricula !== "string" || matricula.trim().length < 1 || matricula.trim().length > 30) {
    throw new AppError("La matricula es obligatoria y admite hasta 30 caracteres.", 400, "VALIDATION_ERROR", {
      campo: "matricula",
    });
  }

  if (typeof password !== "string" || password.length < 1 || password.length > 200) {
    throw new AppError("La contrasena es obligatoria y admite hasta 200 caracteres.", 400, "VALIDATION_ERROR", {
      campo: "password",
    });
  }

  return { matricula: matricula.trim(), password };
};

authRouter.post("/login", async (request, response, next) => {
  try {
    const credenciales = validarCredenciales(request.body);
    const usuario = await autenticarCredenciales(credenciales);

    const token = signToken(
      {
        usuarioId: usuario.id,
        matricula: usuario.matricula,
        tipo: usuario.tipo,
        roles: usuario.roles,
        alumnoId: usuario.alumnoId,
        empleadoId: usuario.empleadoId,
      },
      { secret: env.jwtSecret, expiresInSeconds: env.jwtExpiresInSeconds },
    );

    response.status(200).json({
      success: true,
      data: {
        token,
        tokenType: "Bearer",
        expiresIn: env.jwtExpiresInSeconds,
        user: {
          matricula: usuario.matricula,
          tipo: usuario.tipo,
          roles: usuario.roles,
          alumnoId: usuario.alumnoId,
          empleadoId: usuario.empleadoId,
          debeCambiarPassword: usuario.debeCambiarPassword,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, (request, response) => {
  const auth = request.auth;

  if (!auth) {
    // Defensivo: requireAuth garantiza la sesion, pero el tipo lo exige.
    throw new AppError("Se requiere una sesion activa.", 401, "TOKEN_REQUIRED");
  }

  response.status(200).json({ success: true, data: { ...auth } });
});
