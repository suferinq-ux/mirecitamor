/**
 * Genera el hash scrypt de una contraseña para guardar en .env / Vercel.
 * Uso:  npm run password        (pregunta la contraseña)
 *       node scripts/gen-hash.mjs MiContraseña
 */
import { createInterface } from "node:readline/promises";
import { randomBytes, scryptSync } from "node:crypto";

const KEYLEN = 64;

function hash(password) {
  const salt = randomBytes(16);
  const out = scryptSync(password, salt, KEYLEN, { N: 16384, r: 8, p: 1 });
  return `scrypt:16384:8:1:${salt.toString("hex")}:${out.toString("hex")}`;
}

const arg = process.argv[2];
if (arg) {
  console.log(hash(arg));
} else {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const pw = await rl.question("Contraseña a hashear: ");
  rl.close();
  if (!pw) {
    console.error("Contraseña vacía.");
    process.exit(1);
  }
  console.log("\nPega esto en PASS_HASH_1 o PASS_HASH_2:\n");
  console.log(hash(pw));
}
