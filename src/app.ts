import cors from "cors";
import express, { Router } from "express";

import { env } from "./config/env.js";
import { errorHandler } from "./modules/common/middleware/error-handler.js";
import { notFound } from "./modules/common/middleware/not-found.js";
import { healthRouter } from "./modules/common/routes/health.routes.js";
import { mountModuleRoutes } from "./modules/index.js";

export const createApp = () => {
  const app = express();
  const apiRouter = Router();

  app.disable("x-powered-by");
  app.use(
    cors({
      origin:
        env.corsOrigin === "*"
          ? "*"
          : env.corsOrigin.split(",").map((origin) => origin.trim()),
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  apiRouter.use("/health", healthRouter);
  mountModuleRoutes(apiRouter);

  app.use("/api", apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export const app = createApp();
