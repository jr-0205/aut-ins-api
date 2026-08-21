import { Router } from "express";

import { moduleNames } from "../../index.js";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    data: {
      service: "AUT-INS API",
      status: "operational",
      apiVersion: "v1",
      releaseStage: "beta",
      modules: moduleNames,
      timestamp: new Date().toISOString(),
    },
  });
});
