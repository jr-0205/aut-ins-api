import { AppError } from "../common/errors/app-error.js";
import {
  findUsuarioByMatricula,
  registrarUltimoAcceso,
  type UsuarioSesion,
} from "./auth.repository.js";
import { DUMMY_PASSWORD_HASH, verifyPassword } from "./password.js";

export interface Credenciales {
  matricula: string;
  password: string;
}

/** Puerto de acceso a datos; permite probar el servicio sin una base real. */
export interface RepositorioAutenticacion {
  buscarPorMatricula(matricula: string): Promise<UsuarioSesion | null>;
  registrarAcceso?(usuarioId: number): Promise<void>;
}

const repositorioPorDefecto: RepositorioAutenticacion = {
  buscarPorMatricula: findUsuarioByMatricula,
  registrarAcceso: registrarUltimoAcceso,
};

const CREDENCIALES_INVALIDAS = (): AppError =>
  new AppError("La matricula o la contrasena son incorrectas.", 401, "CREDENCIALES_INVALIDAS");

export const autenticarCredenciales = async (
  credenciales: Credenciales,
  repositorio: RepositorioAutenticacion = repositorioPorDefecto,
): Promise<UsuarioSesion> => {
  const usuario = await repositorio.buscarPorMatricula(credenciales.matricula);

  if (!usuario) {
    // Comparacion de relleno: evita revelar por tiempo de respuesta si la
    // matricula existe o no.
    await verifyPassword(credenciales.password, DUMMY_PASSWORD_HASH);
    throw CREDENCIALES_INVALIDAS();
  }

  const coincide = await verifyPassword(credenciales.password, usuario.passwordHash);

  if (!coincide) {
    throw CREDENCIALES_INVALIDAS();
  }

  if (!usuario.activo) {
    throw new AppError("La cuenta esta inactiva. Solicita apoyo a Control Escolar.", 403, "CUENTA_INACTIVA");
  }

  await repositorio.registrarAcceso?.(usuario.id);

  return usuario;
};
