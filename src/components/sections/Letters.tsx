"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Letter } from "@/app/api/letters/route";
import { Modal, Micro, Spinner, IconMail, IconPlus, IconSend, IconTrash, IconX } from "@/components/ui";

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

export default function Letters({ me, names }: { me: string; names: [string, string] }) {
  const [letters, setLetters] = useState<Letter[] | null>(null);
  const [writing, setWriting] = useState(false);
  const [reading, setReading] = useState<Letter | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/letters")
      .then((r) => (r.ok ? r.json() : []))
      .then(setLetters)
      .catch(() => setLetters([]));
  }, []);

  useEffect(load, [load]);

  async function send() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/letters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body })
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "No se pudo enviar.");
      return;
    }
    setTitle("");
    setBody("");
    setWriting(false);
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/letters?id=${id}`, { method: "DELETE" });
    setReading(null);
    load();
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Micro>Correspondencia</Micro>
          <h2 className="mt-2 font-display text-3xl text-blush-50 sm:text-4xl">Cartas</h2>
        </div>
        <button className="btn" onClick={() => setWriting(true)}>
          <IconPlus className="h-4 w-4" /> Nueva carta
        </button>
      </div>

      {letters === null ? (
        <div className="mt-16 flex justify-center text-blush-300/50"><Spinner /></div>
      ) : letters.length === 0 ? (
        <div className="panel mt-10 flex flex-col items-center gap-3 p-16 text-center">
          <IconMail className="h-6 w-6 text-blush-400/50" />
          <p className="font-display text-lg text-blush-100/80">Aún no hay cartas</p>
          <p className="max-w-xs text-xs leading-relaxed text-blush-200/50">
            La primera carta es la más difícil y la más guardada. Empieza con un “hoy pensé en ti”.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
          {letters.map((l, i) => (
            <motion.button
              key={l.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4) }}
              onClick={() => setReading(l)}
              className="panel group p-6 text-left transition hover:border-blush-400/30 hover:bg-white/[0.05]"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-blush-400/40 bg-blush-500/10 font-display text-sm text-blush-200">
                  {l.fromName.charAt(0)}
                </span>
                <Micro>{fmt(l.at)}</Micro>
              </div>
              <h3 className="mt-4 font-display text-xl leading-snug text-blush-50">{l.title}</h3>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-blush-200/50">{l.body}</p>
              <Micro className="mt-4 block text-blush-300/60">
                De {l.fromName} · para {names[l.to - 1]}
              </Micro>
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {writing && (
          <Modal onClose={() => setWriting(false)} max="max-w-2xl">
            <div className="p-6 sm:p-10">
              <div className="flex items-center justify-between">
                <Micro>Escribiendo desde el corazón</Micro>
                <button onClick={() => setWriting(false)} className="text-blush-300/60 hover:text-blush-100">
                  <IconX className="h-5 w-5" />
                </button>
              </div>
              <input
                className="input mt-6"
                placeholder="Título de la carta"
                value={title}
                maxLength={80}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="paper mt-4 rounded-xl p-6 sm:p-8">
                <textarea
                  className="min-h-[240px] w-full resize-y bg-transparent font-display text-base leading-relaxed outline-none"
                  placeholder="Hoy pensé en ti…"
                  value={body}
                  maxLength={6000}
                  onChange={(e) => setBody(e.target.value)}
                />
                <p className="mt-4 text-right font-script text-2xl text-blush-600">— {me}</p>
              </div>
              {error && <p className="mt-3 text-xs text-blush-300">{error}</p>}
              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={() => setWriting(false)}>Cancelar</button>
                <button className="btn" disabled={busy || !title.trim() || !body.trim()} onClick={send}>
                  {busy ? <Spinner className="h-4 w-4" /> : <IconSend className="h-4 w-4" />} Enviar
                </button>
              </div>
            </div>
          </Modal>
        )}

        {reading && (
          <Modal onClose={() => setReading(null)} max="max-w-2xl">
            <div className="paper rounded-t-2xl p-8 sm:rounded-2xl sm:p-12">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Micro className="text-blush-600/70">De {reading.fromName} · {fmt(reading.at)}</Micro>
                  <h3 className="mt-3 font-display text-3xl leading-snug">{reading.title}</h3>
                </div>
                <button onClick={() => setReading(null)} className="text-blush-600/50 hover:text-blush-800">
                  <IconX className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-6 whitespace-pre-wrap font-display text-base leading-relaxed">{reading.body}</p>
              <p className="mt-8 text-right font-script text-3xl text-blush-600">— {reading.fromName}</p>
              {reading.fromName === me && (
                <div className="mt-8 flex justify-end border-t border-blush-600/10 pt-4">
                  <button
                    className="inline-flex items-center gap-2 text-xs text-blush-600/60 hover:text-blush-800"
                    onClick={() => remove(reading.id)}
                  >
                    <IconTrash className="h-4 w-4" /> Eliminar carta
                  </button>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
