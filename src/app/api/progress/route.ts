import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { sanitizeProgress, type Progress } from "@/lib/progress";
import { loadServer, saveServer } from "@/lib/progress-store";

async function authed(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return (await verifySession(token)) !== null;
}

export async function GET() {
  if (!(await authed())) {
    return NextResponse.json({ error: "Solo ustedes dos. 💞" }, { status: 401 });
  }
  const progress = await loadServer();
  return NextResponse.json(progress, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
  });
}

export async function PUT(req: NextRequest) {
  if (!(await authed())) {
    return NextResponse.json({ error: "Solo ustedes dos. 💞" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  const progress: Progress | null = sanitizeProgress(body);
  if (!progress) {
    return NextResponse.json({ error: "Progreso inválido." }, { status: 400 });
  }
  await saveServer(progress);
  return NextResponse.json({ ok: true });
}
