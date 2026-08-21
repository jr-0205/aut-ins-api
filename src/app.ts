import cors from "cors";
import express, { Router } from "express";
import { fileURLToPath } from "node:url";

import { env } from "./config/env.js";
import { errorHandler } from "./modules/common/middleware/error-handler.js";
import { notFound } from "./modules/common/middleware/not-found.js";
import { requestContext } from "./modules/common/middleware/request-context.js";
import { securityHeaders } from "./modules/common/middleware/security-headers.js";
import { healthRouter } from "./modules/common/routes/health.routes.js";
import { mountModuleRoutes } from "./modules/index.js";

export const createApp = () => {
  const app = express();
  const apiRouter = Router();
  const publicDirectory = fileURLToPath(new URL("../public", import.meta.url));

  app.disable("x-powered-by");
  app.set("trust proxy", env.nodeEnv === "production" ? 1 : false);
  app.use(requestContext);
  app.use(securityHeaders);
  app.use(
    cors({
      origin:
        env.corsOrigin === "*"
          ? "*"
          : env.corsOrigin
              .split(",")
              .map((origin) => origin.trim())
              .filter(Boolean),
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(
    express.static(publicDirectory, {
      index: false,
      maxAge: env.nodeEnv === "production" ? "1h" : 0,
    }),
  );

  app.get("/", (_request, response) => {
    response.sendFile("index.html", { root: publicDirectory });
  });

  apiRouter.use("/health", healthRouter);
  mountModuleRoutes(apiRouter);

  app.use("/api", apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export const app = createApp();
