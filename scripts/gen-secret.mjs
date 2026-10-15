/** Genera un secreto aleatorio para SESSION_SECRET. Uso: npm run secret */
import { randomBytes } from "node:crypto";
console.log(randomBytes(32).toString("hex"));
