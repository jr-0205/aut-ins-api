import type { AuthContext } from "./auth.types.js";

declare global {
  namespace Express {
    interface Request {
      /** Sesion resuelta por requireAuth. Solo existe en rutas protegidas. */
      auth?: AuthContext | undefined;
    }
  }
}

export {};
