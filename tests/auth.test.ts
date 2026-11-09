import assert from "node:assert/strict";
import test from "node:test";

import { AppError } from "../src/modules/common/errors/app-error.js";
import type { UsuarioSesion } from "../src/modules/auth/auth.repository.js";
import {
  autenticarCredenciales,
  type RepositorioAutenticacion,
} from "../src/modules/auth/auth.service.js";
import { hashPassword, verifyPassword } from "../src/modules/auth/password.js";
import { signToken, verifyToken } from "../src/modules/auth/token.js";

const SECRET = "secreto-de-pruebas-suficientemente-largo-1234567890";

const contextoBase = {
  usuarioId: 7,
  matricula: "20260001",
  tipo: "EMPLEADO" as const,
  roles: ["ADMISIONES"],
  alumnoId: null,
  empleadoId: 3,
};

const esAppError = (statusCode: number, code: string) => (error: unknown): boolean => {
  const appError = error as AppError;
  return appError instanceof AppError && appError.statusCode === statusCode && appError.code === code;
};

test("hashPassword produce un hash verificable y distinto por sal", async () => {
  const primero = await hashPassword("Cambiar123!");
  const segundo = await hashPassword("Cambiar123!");

  assert.notEqual(primero, segundo);
  assert.equal(await verifyPassword("Cambiar123!", primero), true);
  assert.equal(await verifyPassword("otra-clave", primero), false);
  assert.equal(await verifyPassword("Cambiar123!", "hash-invalido"), false);
});

test("signToken y verifyToken conservan el contexto de la sesion", () => {
  const token = signToken(contextoBase, { secret: SECRET, expiresInSeconds: 60 });
  const payload = verifyToken(token, SECRET);

  assert.equal(payload.usuarioId, 7);
  assert.equal(payload.matricula, "20260001");
  assert.deepEqual(payload.roles, ["ADMISIONES"]);
  assert.equal(payload.empleadoId, 3);
  assert.equal(typeof payload.exp, "number");
});

test("verifyToken rechaza un token manipulado", () => {
  const token = signToken(contextoBase, { secret: SECRET, expiresInSeconds: 60 });
  const [header, body, signature] = token.split(".");
  const alterado = `${header}.${body}.${signature ?? ""}x`;

  assert.throws(() => verifyToken(alterado, SECRET), esAppError(401, "TOKEN_INVALID"));
});

test("verifyToken rechaza un token firmado con otro secreto", () => {
  const token = signToken(contextoBase, { secret: SECRET, expiresInSeconds: 60 });

  assert.throws(
    () => verifyToken(token, "otro-secreto-totalmente-distinto-1234567890"),
    esAppError(401, "TOKEN_INVALID"),
  );
});

test("verifyToken rechaza un token expirado", () => {
  const token = signToken(contextoBase, { secret: SECRET, expiresInSeconds: -10 });

  assert.throws(() => verifyToken(token, SECRET), esAppError(401, "TOKEN_EXPIRED"));
});

test("verifyToken rechaza un token mal formado", () => {
  assert.throws(() => verifyToken("solo.dos", SECRET), esAppError(401, "TOKEN_INVALID"));
});

const crearUsuario = async (overrides: Partial<UsuarioSesion> = {}): Promise<UsuarioSesion> => ({
  id: 1,
  matricula: "20260001",
  passwordHash: await hashPassword("Correcta123!"),
  tipo: "EMPLEADO",
  debeCambiarPassword: false,
  activo: true,
  roles: ["CONTROL_ESCOLAR"],
  alumnoId: null,
  empleadoId: 5,
  ...overrides,
});

const repositorioCon = (usuario: UsuarioSesion | null): RepositorioAutenticacion => ({
  buscarPorMatricula: async () => usuario,
});

test("autenticarCredenciales devuelve el usuario cuando las credenciales son validas", async () => {
  const usuario = await crearUsuario();
  const resultado = await autenticarCredenciales(
    { matricula: "20260001", password: "Correcta123!" },
    repositorioCon(usuario),
  );

  assert.equal(resultado.id, usuario.id);
});

test("autenticarCredenciales rechaza una contrasena incorrecta", async () => {
  const usuario = await crearUsuario();

  await assert.rejects(
    autenticarCredenciales({ matricula: "20260001", password: "incorrecta" }, repositorioCon(usuario)),
    esAppError(401, "CREDENCIALES_INVALIDAS"),
  );
});

test("autenticarCredenciales rechaza una matricula inexistente", async () => {
  await assert.rejects(
    autenticarCredenciales({ matricula: "00000000", password: "Correcta123!" }, repositorioCon(null)),
    esAppError(401, "CREDENCIALES_INVALIDAS"),
  );
});

test("autenticarCredenciales rechaza una cuenta inactiva", async () => {
  const usuario = await crearUsuario({ activo: false });

  await assert.rejects(
    autenticarCredenciales({ matricula: "20260001", password: "Correcta123!" }, repositorioCon(usuario)),
    esAppError(403, "CUENTA_INACTIVA"),
  );
});
