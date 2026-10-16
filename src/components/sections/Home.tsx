"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Progress } from "@/lib/progress";
import type { Letter } from "@/app/api/letters/route";
import type { MediaItem } from "@/app/api/media/route";
import { Micro, IconHeart, IconMail, IconImage, IconMusic } from "@/components/ui";

export type SectionId = "inicio" | "citas" | "cartas" | "fotos" | "musica";

export default function Home({
  names,
  days,
  progress,
  onNavigate
}: {
  names: [string, string];
  days: number | null;
  progress: Progress;
  onNavigate: (s: SectionId) => void;
}) {
  const [letters, setLetters] = useState<Letter[] | null>(null);
  const [media, setMedia] = useState<MediaItem[] | null>(null);

  useEffect(() => {
    fetch("/api/letters").then((r) => (r.ok ? r.json() : [])).then(setLetters).catch(() => setLetters([]));
    fetch("/api/media").then((r) => (r.ok ? r.json() : [])).then(setMedia).catch(() => setMedia([]));
  }, []);

  const vividas = Object.keys(progress).length;
  const fotos = media?.filter((m) => m.kind === "foto").length ?? 0;
  const canciones = media?.filter((m) => m.kind === "musica").length ?? 0;

  const stats = [
    { label: "Citas vividas", value: vividas, total: 100, icon: IconHeart, to: "citas" as SectionId },
    { label: "Cartas", value: letters?.length ?? 0, icon: IconMail, to: "cartas" as SectionId },
    { label: "Fotografías", value: fotos, icon: IconImage, to: "fotos" as SectionId },
    { label: "Canciones", value: canciones, icon: IconMusic, to: "musica" as SectionId }
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
      <div>
        <Micro>Nuestro universo privado</Micro>
        <h1 className="mt-4 font-display text-4xl leading-tight text-blush-50 sm:text-6xl">
          Un lugar que solo
          <br />
          <span className="text-grad italic">nosotros dos</span> conocemos
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-blush-200/60">
          Cien citas por vivir, cartas que no caben en los mensajes, fotografías que no subimos a
          ningún otro lado y las canciones que son nuestras. Todo vive aquí, en calma.
        </p>
        <p className="mt-8 font-display text-lg italic text-blush-200/80">
          {names[0]} <span className="text-blush-400">&</span> {names[1]}
          {days !== null && (
            <span className="mt-2 block font-body text-xs not-italic tracking-wide text-blush-300/60">
              {days.toLocaleString("es")} días juntos
            </span>
          )}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button className="btn" onClick={() => onNavigate("citas")}>
            Ver las cien citas
          </button>
          <button className="btn-ghost" onClick={() => onNavigate("cartas")}>
            Escribir una carta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 self-start sm:gap-4">
        {stats.map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            onClick={() => onNavigate(s.to)}
            className="panel group p-5 text-left transition hover:border-blush-400/30 hover:bg-white/[0.05]"
          >
            <s.icon className="h-4 w-4 text-blush-400/70 transition group-hover:text-blush-300" />
            <p className="mt-4 font-display text-3xl text-blush-50">
              {s.value}
              {"total" in s && s.total ? (
                <span className="text-sm text-blush-300/50"> / {s.total}</span>
              ) : null}
            </p>
            <Micro className="mt-1 block">{s.label}</Micro>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
