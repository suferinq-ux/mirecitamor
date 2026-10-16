import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { verifySession, SESSION_COOKIE, type SessionPayload } from "@/lib/session";
import { getJSON, setJSON, putBlob, delBlob } from "@/lib/vault-store";

export interface MediaItem {
  id: string;
  kind: "foto" | "musica";
  name: string;
  type: string;
  size: number;
  caption?: string;
  by: string;
  at: string;
}

const MAX_BYTES = 3.5 * 1024 * 1024; // ~4.7 MB en base64, dentro del límite de Vercel

async function session(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySession(token) : null;
}

export async function GET() {
  const s = await session();
  if (!s) return NextResponse.json({ error: "Solo ustedes dos." }, { status: 401 });
  const media = await getJSON<MediaItem[]>("media", []);
  return NextResponse.json([...media].sort((a, b) => b.at.localeCompare(a.at)), {
    headers: { "Cache-Control": "no-store" }
  });
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
  const b = (body ?? {}) as {
    kind?: unknown;
    name?: unknown;
    type?: unknown;
    caption?: unknown;
    data?: unknown;
  };

  const kind = b.kind === "foto" || b.kind === "musica" ? b.kind : null;
  const type = typeof b.type === "string" ? b.type : "";
  const data = typeof b.data === "string" ? b.data : "";
  if (!kind || !data) return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  if (kind === "foto" && !type.startsWith("image/")) {
    return NextResponse.json({ error: "Solo imágenes." }, { status: 400 });
  }
  if (kind === "musica" && !type.startsWith("audio/")) {
    return NextResponse.json({ error: "Solo audio." }, { status: 400 });
  }

  const raw = Buffer.from(data, "base64");
  if (raw.length === 0 || raw.length > MAX_BYTES) {
    return NextResponse.json(
      { error: "Archivo demasiado pesado (máx. 3.5 MB). Las fotos se comprimen solas al subir." },
      { status: 413 }
    );
  }

  const id = randomUUID();
  await putBlob(id, type, data);
  const item: MediaItem = {
    id,
    kind,
    name: typeof b.name === "string" ? b.name.slice(0, 80) : kind === "foto" ? "Fotografía" : "Canción",
    type,
    size: raw.length,
    caption: typeof b.caption === "string" ? b.caption.slice(0, 140) : undefined,
    by: s.n,
    at: new Date().toISOString()
  };
  const media = await getJSON<MediaItem[]>("media", []);
  media.push(item);
  await setJSON("media", media);
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "Solo ustedes dos." }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requerido." }, { status: 400 });
  const media = await getJSON<MediaItem[]>("media", []);
  const target = media.find((m) => m.id === id);
  if (!target) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  if (target.by !== s.n) return NextResponse.json({ error: "No eres el autor." }, { status: 403 });
  await delBlob(id);
  await setJSON(
    "media",
    media.filter((m) => m.id !== id)
  );
  return NextResponse.json({ ok: true });
}
