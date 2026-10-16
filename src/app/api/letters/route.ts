import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { verifySession, SESSION_COOKIE, type SessionPayload } from "@/lib/session";
import { getJSON, setJSON } from "@/lib/vault-store";

export interface Letter {
  id: string;
  from: number;
  fromName: string;
  to: number;
  title: string;
  body: string;
  at: string;
}

async function session(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySession(token) : null;
}

export async function GET() {
  const s = await session();
  if (!s) return NextResponse.json({ error: "Solo ustedes dos." }, { status: 401 });
  const letters = await getJSON<Letter[]>("letters", []);
  return NextResponse.json(
    [...letters].sort((a, b) => b.at.localeCompare(a.at)),
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "Solo ustedes dos." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  const b = (body ?? {}) as { title?: unknown; body?: unknown };
  const title = typeof b.title === "string" ? b.title.trim().slice(0, 80) : "";
  const text = typeof b.body === "string" ? b.body.trim().slice(0, 6000) : "";
  if (!title || !text) {
    return NextResponse.json({ error: "Título y texto son necesarios." }, { status: 400 });
  }

  const letter: Letter = {
    id: randomUUID(),
    from: s.u,
    fromName: s.n,
    to: s.u === 1 ? 2 : 1,
    title,
    body: text,
    at: new Date().toISOString()
  };
  const letters = await getJSON<Letter[]>("letters", []);
  letters.push(letter);
  await setJSON("letters", letters);
  return NextResponse.json(letter, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "Solo ustedes dos." }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requerido." }, { status: 400 });
  const letters = await getJSON<Letter[]>("letters", []);
  const next = letters.filter((l) => !(l.id === id && l.from === s.u));
  if (next.length === letters.length) {
    return NextResponse.json({ error: "No encontrada." }, { status: 404 });
  }
  await setJSON("letters", next);
  return NextResponse.json({ ok: true });
}
