import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const requestContext: RequestHandler = (request, response, next) => {
  const requestId = request.get("x-request-id")?.slice(0, 100) || randomUUID();
  response.setHeader("x-request-id", requestId);
  response.locals.requestId = requestId;
  next();
};

