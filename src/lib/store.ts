"use client";

/**
 * Progreso de las 100 citas.
 * - Copia local (localStorage) para pintar al instante y modo sin conexión.
 * - Copia real en el servidor (/api/progress): sobrevive recargas, navegadores,
 *   ventanas privadas y dispositivos, y se sincroniza entre los dos.
 */
import type { Progress } from "./progress";
import { sanitizeProgress } from "./progress";

const KEY = "amor100:v1";

export type { Progress, DoneEntry } from "./progress";

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return sanitizeProgress(parsed) ?? {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    /* almacenamiento no disponible: el servidor sigue siendo la fuente real */
  }
}

export async function loadRemote(): Promise<Progress | null> {
  try {
    const res = await fetch("/api/progress", { cache: "no-store" });
    if (!res.ok) return null;
    return sanitizeProgress(await res.json());
  } catch {
    return null;
  }
}

export async function saveRemote(progress: Progress): Promise<void> {
  try {
    await fetch("/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(progress)
    });
  } catch {
    /* sin conexión: la copia local se sincronizará al volver */
  }
}
