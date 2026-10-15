"use client";

/** Progreso guardado localmente en cada dispositivo (privado, sin servidores). */

export interface DoneEntry {
  at: string; // ISO date
  note?: string;
  by?: string;
}

export type Progress = Record<number, DoneEntry>;

const KEY = "amor100:v1";

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Progress;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    /* almacenamiento no disponible: se ignora en silencio */
  }
}
