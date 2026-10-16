/** Tipos y saneado compartidos entre cliente y servidor. */

export interface DoneEntry {
  at: string; // fecha ISO en que la vivieron
  note?: string;
  by?: string;
}

export type Progress = Record<number, DoneEntry>;

/** Valida y recorta cualquier JSON entrante a un Progress seguro. */
export function sanitizeProgress(input: unknown): Progress | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return null;
  const out: Progress = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    const id = Number(k);
    if (!Number.isInteger(id) || id < 1 || id > 100) continue;
    if (typeof v !== "object" || v === null) continue;
    const e = v as Record<string, unknown>;
    if (typeof e.at !== "string" || e.at.length === 0 || e.at.length > 40) continue;
    const entry: DoneEntry = { at: e.at };
    if (typeof e.note === "string") entry.note = e.note.slice(0, 500);
    if (typeof e.by === "string") entry.by = e.by.slice(0, 40);
    out[id] = entry;
  }
  return out;
}
