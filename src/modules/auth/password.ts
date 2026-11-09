import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

/**
 * Hash de contrasenas con scrypt (incluido en Node, sin dependencias externas).
 * El formato almacenado es autocontenido para poder migrar los parametros en el
 * futuro sin invalidar los hashes existentes:
 *
 *   scrypt$N$r$p$<sal_base64url>$<hash_base64url>
 */

const SCHEME = "scrypt";
const COST = 16_384; // N
const BLOCK_SIZE = 8; // r
const PARALLELISM = 1; // p
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const MAX_MEMORY = 64 * 1024 * 1024;

const deriveKey = (
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await deriveKey(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELISM,
    maxmem: MAX_MEMORY,
  });

  return [
    SCHEME,
    COST,
    BLOCK_SIZE,
    PARALLELISM,
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join("$");
};

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const parts = stored.split("$");

  if (parts.length !== 6 || parts[0] !== SCHEME) {
    return false;
  }

  const cost = Number.parseInt(parts[1] ?? "", 10);
  const blockSize = Number.parseInt(parts[2] ?? "", 10);
  const parallelism = Number.parseInt(parts[3] ?? "", 10);

  if (!Number.isInteger(cost) || !Number.isInteger(blockSize) || !Number.isInteger(parallelism)) {
    return false;
  }

  const salt = Buffer.from(parts[4] ?? "", "base64url");
  const expected = Buffer.from(parts[5] ?? "", "base64url");

  if (salt.length === 0 || expected.length === 0) {
    return false;
  }

  const derived = await deriveKey(password, salt, expected.length, {
    N: cost,
    r: blockSize,
    p: parallelism,
    maxmem: MAX_MEMORY,
  });

  if (derived.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(derived, expected);
};

/**
 * Hash de relleno valido con el que se compara una contrasena aunque la
 * matricula no exista. Iguala el tiempo de respuesta y evita revelar que
 * matriculas estan registradas (enumeracion de usuarios).
 */
export const DUMMY_PASSWORD_HASH = [
  SCHEME,
  COST,
  BLOCK_SIZE,
  PARALLELISM,
  Buffer.alloc(SALT_LENGTH, 1).toString("base64url"),
  Buffer.alloc(KEY_LENGTH, 1).toString("base64url"),
].join("$");
