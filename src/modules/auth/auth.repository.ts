import { getPrisma } from "../../config/database.js";
import type { TipoUsuario } from "./auth.types.js";

/** Datos minimos de una cuenta necesarios para autenticar y firmar la sesion. */
export interface UsuarioSesion {
  id: number;
  matricula: string;
  passwordHash: string;
  tipo: TipoUsuario;
  debeCambiarPassword: boolean;
  activo: boolean;
  roles: string[];
  alumnoId: number | null;
  empleadoId: number | null;
}

export const findUsuarioByMatricula = async (matricula: string): Promise<UsuarioSesion | null> => {
  const usuario = await getPrisma().usuario.findUnique({
    where: { matricula },
    include: {
      alumno: { select: { id: true } },
      empleado: { select: { id: true, rol: { select: { codigo: true } } } },
    },
  });

  if (!usuario) {
    return null;
  }

  return {
    id: usuario.id,
    matricula: usuario.matricula,
    passwordHash: usuario.passwordHash,
    tipo: usuario.tipo,
    debeCambiarPassword: usuario.debeCambiarPassword,
    activo: usuario.activo,
    roles: usuario.empleado ? [usuario.empleado.rol.codigo] : ["ALUMNO"],
    alumnoId: usuario.alumno?.id ?? null,
    empleadoId: usuario.empleado?.id ?? null,
  };
};

export const registrarUltimoAcceso = async (usuarioId: number): Promise<void> => {
  await getPrisma().usuario.update({
    where: { id: usuarioId },
    data: { ultimoAccesoEn: new Date() },
  });
};
