/**
 * Sesiones firmadas con HMAC-SHA256 (Web Crypto → compatible con Edge y Node).
 * La cookie viaja como:  <payload base64url>.<firma hex>
 */

export interface SessionPayload {
  /** índice de usuario: 1 | 2 */
  u: number;
  /** nombre visible */
  n: string;
  /** expiración en ms epoch */
  exp: number;
}

const COOKIE = "amor_session";
export const SESSION_COOKIE = COOKIE;
export const SESSION_DAYS = 7;

const enc = new TextEncoder();

function secret(): string {
  return process.env.SESSION_SECRET || "dev-secret-no-usar-en-produccion";
}

let keyPromise: Promise<CryptoKey> | null = null;
function getKey(): Promise<CryptoKey> {
  if (!keyPromise) {
    keyPromise = crypto.subtle.importKey(
      "raw",
      enc.encode(secret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
  }
  return keyPromise;
}

function b64urlEncode(input: string): string {
  const bytes = enc.encode(input);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Comparación en tiempo constante para evitar timing attacks. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const body = b64urlEncode(JSON.stringify(payload));
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return `${body}.${toHex(sig)}`;
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const key = await getKey();
    const expected = await crypto.subtle.sign("HMAC", key, enc.encode(body));
    if (!safeEqual(toHex(expected), sig)) return null;
    const payload = JSON.parse(b64urlDecode(body)) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    if (payload.u !== 1 && payload.u !== 2) return null;
    return payload;
  } catch {
    return null;
  }
}
