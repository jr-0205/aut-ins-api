/** Tipo de cuenta unificado en tbl_usuario. */
export type TipoUsuario = "ALUMNO" | "EMPLEADO";

/** Roles de personal definidos en tbl_cat_rol_empleado mas el rol implicito del alumno. */
export type Rol = "ALUMNO" | "ADMISIONES" | "CONTROL_ESCOLAR" | "COORDINACION";

/** Identidad de la sesion que viaja dentro del JWT y consumen los guardias. */
export interface AuthContext {
  usuarioId: number;
  matricula: string;
  tipo: TipoUsuario;
  roles: string[];
  alumnoId: number | null;
  empleadoId: number | null;
}

/** Contexto ya firmado, con las marcas temporales del estandar JWT. */
export interface TokenPayload extends AuthContext {
  iat: number;
  exp: number;
}
