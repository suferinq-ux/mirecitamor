/**
 * Bóveda server-side (solo rutas API): JSON + blobs binarios.
 * Niveles: Vercel KV / Upstash Redis → archivo local (dev) → memoria.
 */
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";

const PREFIX = "amor100:";
const DIR = path.join(process.cwd(), "data", "vault");
const UPLOADS = path.join(process.cwd(), "data", "uploads");

let redis: Redis | null | undefined;
const memJson = new Map<string, unknown>();
const memBlob = new Map<string, { type: string; data: string }>();

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

const safeId = (id: string) => /^[a-zA-Z0-9-]{1,64}$/.test(id);

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  const r = getRedis();
  if (r) {
    try {
      const v = await r.get<T>(PREFIX + key);
      if (v !== null && v !== undefined) return v;
    } catch {
      /* siguiente nivel */
    }
    return fallback;
  }
  try {
    const raw = await readFile(path.join(DIR, `${key}.json`), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    /* no existe */
  }
  return (memJson.get(key) as T) ?? fallback;
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  const r = getRedis();
  if (r) {
    try {
      await r.set(PREFIX + key, value);
      return;
    } catch {
      /* siguiente nivel */
    }
  }
  try {
    await mkdir(DIR, { recursive: true });
    await writeFile(path.join(DIR, `${key}.json`), JSON.stringify(value, null, 2), "utf8");
    return;
  } catch {
    /* solo lectura */
  }
  memJson.set(key, value);
}

export async function putBlob(id: string, type: string, base64: string): Promise<void> {
  if (!safeId(id)) throw new Error("id inválido");
  const r = getRedis();
  if (r) {
    try {
      await r.set(PREFIX + "blob:" + id, { type, data: base64 });
      return;
    } catch {
      /* siguiente nivel */
    }
  }
  try {
    await mkdir(UPLOADS, { recursive: true });
    await writeFile(path.join(UPLOADS, id), Buffer.from(base64, "base64"));
    await writeFile(path.join(UPLOADS, `${id}.type`), type, "utf8");
    return;
  } catch {
    /* solo lectura */
  }
  memBlob.set(id, { type, data: base64 });
}

export async function getBlob(id: string): Promise<{ type: string; buf: Buffer } | null> {
  if (!safeId(id)) return null;
  const r = getRedis();
  if (r) {
    try {
      const v = await r.get<{ type: string; data: string }>(PREFIX + "blob:" + id);
      if (v && typeof v.data === "string") return { type: v.type, buf: Buffer.from(v.data, "base64") };
      return null;
    } catch {
      /* siguiente nivel */
    }
  }
  try {
    const buf = await readFile(path.join(UPLOADS, id));
    const type = await readFile(path.join(UPLOADS, `${id}.type`), "utf8");
    return { type, buf };
  } catch {
    /* no existe */
  }
  const m = memBlob.get(id);
  return m ? { type: m.type, buf: Buffer.from(m.data, "base64") } : null;
}

export async function delBlob(id: string): Promise<void> {
  if (!safeId(id)) return;
  const r = getRedis();
  if (r) {
    try {
      await r.del(PREFIX + "blob:" + id);
      return;
    } catch {
      /* siguiente nivel */
    }
  }
  try {
    await unlink(path.join(UPLOADS, id));
    await unlink(path.join(UPLOADS, `${id}.type`));
    return;
  } catch {
    /* no existe */
  }
  memBlob.delete(id);
}
