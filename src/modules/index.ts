import type { Router } from "express";

import { admisionesRouter } from "./admisiones/admisiones.routes.js";
import { alumnosRouter } from "./alumnos/alumnos.routes.js";
import { aspirantesRouter } from "./aspirantes/aspirantes.routes.js";
import { authRouter } from "./auth/auth.routes.js";
import { controlEscolarRouter } from "./control-escolar/control-escolar.routes.js";
import { coordinacionRouter } from "./coordinacion/coordinacion.routes.js";
import { historialRouter } from "./historial/historial.routes.js";
import { mensajesRouter } from "./mensajes/mensajes.routes.js";

const moduleRoutes = [
  { name: "auth", path: "/auth", router: authRouter },
  { name: "aspirantes", path: "/aspirantes", router: aspirantesRouter },
  { name: "admisiones", path: "/admisiones", router: admisionesRouter },
  {
    name: "control-escolar",
    path: "/control-escolar",
    router: controlEscolarRouter,
  },
  { name: "coordinacion", path: "/coordinacion", router: coordinacionRouter },
  { name: "alumnos", path: "/alumnos", router: alumnosRouter },
  { name: "mensajes", path: "/mensajes", router: mensajesRouter },
  { name: "historial", path: "/historial", router: historialRouter },
] as const;

export const moduleNames = moduleRoutes.map(({ name }) => name);

export const mountModuleRoutes = (apiRouter: Router): void => {
  for (const moduleRoute of moduleRoutes) {
    apiRouter.use(moduleRoute.path, moduleRoute.router);
  }
};
