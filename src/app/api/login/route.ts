import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth";
import { signSession, SESSION_COOKIE, SESSION_DAYS } from "@/lib/session";

/** Límite de intentos por IP (memoria de la instancia serverless). */
const attempts = new Map<string, { count: number; reset: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 5 * 60 * 1000;

function limited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.reset < now) {
    attempts.set(ip, { count: 0, reset: now + WINDOW_MS });
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function registerFail(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.reset < now) {
    attempts.set(ip, { count: 1, reset: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos, mi amor. ⏳" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }
  const { user, password } = body as { user?: unknown; password?: unknown };
  const userIndex = user === 1 || user === "1" ? 1 : user === 2 || user === "2" ? 2 : 0;
  if (!userIndex || typeof password !== "string" || password.length < 1 || password.length > 128) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }

  const storedHash =
    userIndex === 1 ? process.env.PASS_HASH_1 : process.env.PASS_HASH_2;
  if (!storedHash) {
    return NextResponse.json(
      { error: "Este universo aún no tiene llaves configuradas. 💫" },
      { status: 500 }
    );
  }

  if (!verifyPassword(password, storedHash)) {
    registerFail(ip);
    return NextResponse.json(
      { error: "Contraseña incorrecta. Inténtalo de nuevo, corazón. 💔" },
      { status: 401 }
    );
  }

  const names = [
    process.env.NEXT_PUBLIC_NAME_1 || "Mi Amor",
    process.env.NEXT_PUBLIC_NAME_2 || "Mi Vida"
  ];
  const name = names[userIndex - 1];

  const token = await signSession({
    u: userIndex,
    n: name,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  });

  const res = NextResponse.json({ ok: true, name });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60
  });
  return res;
}
