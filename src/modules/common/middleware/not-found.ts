import type { RequestHandler } from "express";

import { AppError } from "../errors/app-error.js";

export const notFound: RequestHandler = (request, _response, next) => {
  next(
    new AppError(
      `La ruta ${request.method} ${request.originalUrl} no existe.`,
      404,
      "ROUTE_NOT_FOUND",
    ),
  );
};
