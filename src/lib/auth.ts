/**
 * Hash de contraseñas con scrypt (Node runtime · rutas API).
 * Formato guardado en env:  scrypt:N:r:p:saltHex:hashHex
 * (se usa ":" como separador porque Next.js expande `$VAR` en archivos .env)
 * Nunca se almacena ni se envía la contraseña en texto plano.
 */
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN, { N: 16384, r: 8, p: 1 });
  return `scrypt:16384:8:1:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [algo, N, r, p, saltHex, hashHex] = stored.split(":");
    if (algo !== "scrypt" || !saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length, {
      N: Number(N),
      r: Number(r),
      p: Number(p)
    });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
