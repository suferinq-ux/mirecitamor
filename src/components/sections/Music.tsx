"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MediaItem } from "@/app/api/media/route";
import { toBase64 } from "./Gallery";
import { Micro, Spinner, IconMusic, IconPause, IconPlay, IconPlus, IconTrash } from "@/components/ui";

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

export default function Music({ me }: { me: string }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<MediaItem | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetch("/api/media")
      .then((r) => (r.ok ? r.json() : []))
      .then((m: MediaItem[]) => setItems(m.filter((x) => x.kind === "musica")))
      .catch(() => setItems([]));
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onPause);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onPause);
    };
  }, []);

  function play(item: MediaItem) {
    const a = audioRef.current;
    if (!a) return;
    if (current?.id === item.id) {
      if (a.paused) void a.play();
      else a.pause();
      return;
    }
    setCurrent(item);
    a.src = `/api/media/${item.id}`;
    void a.play();
  }

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    if (file.size > 3.5 * 1024 * 1024) {
      setError("Máximo 3.5 MB por canción (un MP3 de ~3 minutos a 128 kbps entra).");
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    try {
      const data = await toBase64(file);
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "musica",
          name: file.name.replace(/\.[^.]+$/, "").slice(0, 60) || "Canción",
          type: file.type || "audio/mpeg",
          data
        })
      });
      if (!res.ok) setError((await res.json().catch(() => ({}))).error ?? "No se pudo subir.");
      else load();
    } catch {
      setError("No se pudo procesar el audio.");
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(item: MediaItem) {
    if (current?.id === item.id) {
      audioRef.current?.pause();
      setCurrent(null);
    }
    await fetch(`/api/media?id=${item.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className={current ? "pb-24" : ""}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Micro>Banda sonora</Micro>
          <h2 className="mt-2 font-display text-3xl text-blush-50 sm:text-4xl">Nuestras canciones</h2>
        </div>
        <button className="btn" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Spinner className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />} Subir
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
      </div>
      {error && <p className="mt-4 text-xs text-blush-300">{error}</p>}

      {items === null ? (
        <div className="mt-16 flex justify-center text-blush-300/50"><Spinner /></div>
      ) : items.length === 0 ? (
        <div className="panel mt-10 flex flex-col items-center gap-3 p-16 text-center">
          <IconMusic className="h-6 w-6 text-blush-400/50" />
          <p className="font-display text-lg text-blush-100/80">Silencio, por ahora</p>
          <p className="max-w-xs text-xs leading-relaxed text-blush-200/50">
            Sube la canción del primer baile, la del carretera, la que suena cuando nadie más escucha.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-2">
          {items.map((m, i) => {
            const active = current?.id === m.id;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                className={`panel flex items-center gap-4 p-4 transition ${active ? "border-blush-400/40 bg-blush-500/[0.07]" : "hover:bg-white/[0.04]"}`}
              >
                <button
                  onClick={() => play(m)}
                  aria-label={active && playing ? "Pausar" : "Reproducir"}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blush-400/40 text-blush-200 transition hover:bg-blush-500/20"
                >
                  {active && playing ? <IconPause className="h-4 w-4" /> : <IconPlay className="h-4 w-4" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-blush-50">{m.name}</p>
                  <Micro>{m.by} · {fmt(m.at)} · {(m.size / 1024 / 1024).toFixed(1)} MB</Micro>
                </div>
                {m.by === me && (
                  <button
                    className="shrink-0 text-blush-300/40 transition hover:text-blush-200"
                    onClick={() => remove(m)}
                    aria-label="Eliminar"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="panel-strong fixed inset-x-0 bottom-16 z-40 mx-auto flex max-w-xl items-center gap-4 rounded-none border-x-0 p-4 lg:bottom-6 lg:rounded-2xl lg:border-x"
          >
            <button
              onClick={() => play(current)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush-500 text-white transition hover:bg-blush-400"
              aria-label={playing ? "Pausar" : "Reproducir"}
            >
              {playing ? <IconPause className="h-4 w-4" /> : <IconPlay className="h-4 w-4" />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-blush-50">{current.name}</p>
              <Micro>Sonando ahora</Micro>
            </div>
            <button
              className="btn-ghost !px-3"
              onClick={() => {
                audioRef.current?.pause();
                setCurrent(null);
              }}
            >
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
