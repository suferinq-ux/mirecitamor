import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { getBlob } from "@/lib/vault-store";

/** Sirve fotos y música privados (la cookie de sesión viaja con la petición). */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const s = token ? await verifySession(token) : null;
  if (!s) return NextResponse.json({ error: "Solo ustedes dos." }, { status: 401 });

  const { id } = await ctx.params;
  const blob = await getBlob(id);
  if (!blob) return NextResponse.json({ error: "No encontrado." }, { status: 404 });

  return new NextResponse(new Uint8Array(blob.buf), {
    headers: {
      "Content-Type": blob.type || "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
      "Content-Length": String(blob.buf.length),
      "X-Content-Type-Options": "nosniff"
    }
  });
}
