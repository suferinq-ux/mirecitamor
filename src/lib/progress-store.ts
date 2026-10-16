/**
 * Almacenamiento server-side del progreso (solo servidor / rutas API).
 * Orden de preferencia:
 *  1. Vercel KV / Upstash Redis (si hay variables de entorno) → persistente en producción.
 *  2. Archivo data/progress.json (desarrollo local) → sobrevive recargas y reinicios.
 *  3. Memoria de la instancia (último recurso).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type { Progress } from "./progress";

const KEY = "amor100:progress";
const FILE = path.join(process.cwd(), "data", "progress.json");

let redis: Redis | null | undefined;
let memory: Progress = {};

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

export async function loadServer(): Promise<Progress> {
  const r = getRedis();
  if (r) {
    try {
      const v = await r.get<Progress>(KEY);
      if (v && typeof v === "object") return v;
    } catch {
      /* cae al siguiente nivel */
    }
    return {};
  }
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Progress;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    /* aún no existe el archivo */
  }
  return memory;
}

export async function saveServer(p: Progress): Promise<void> {
  const r = getRedis();
  if (r) {
    try {
      await r.set(KEY, p);
      return;
    } catch {
      /* cae al siguiente nivel */
    }
  }
  try {
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(p, null, 2), "utf8");
    return;
  } catch {
    /* filesystem de solo lectura (serverless sin KV) */
  }
  memory = p;
}
