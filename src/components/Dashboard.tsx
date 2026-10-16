"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Scene3D from "./Scene3D";
import Petals from "./Petals";
import { loadProgress, saveProgress, loadRemote, saveRemote } from "@/lib/store";
import type { Progress } from "@/lib/progress";
import type { DateIdea } from "@/lib/dates";
import Home from "./sections/Home";
import Dates from "./sections/Dates";
import Letters from "./sections/Letters";
import Gallery from "./sections/Gallery";
import Music from "./sections/Music";
import { Micro, IconHome, IconHeart, IconMail, IconImage, IconMusic, IconOut } from "./ui";

type SectionId = "inicio" | "citas" | "cartas" | "fotos" | "musica";

const NAV: { id: SectionId; label: string; icon: (p: { className?: string }) => React.ReactNode }[] = [
  { id: "inicio", label: "Inicio", icon: IconHome },
  { id: "citas", label: "Citas", icon: IconHeart },
  { id: "cartas", label: "Cartas", icon: IconMail },
  { id: "fotos", label: "Fotos", icon: IconImage },
  { id: "musica", label: "Música", icon: IconMusic }
];

interface Props {
  userName: string;
  names: [string, string];
  anniversary: string | null;
}

export default function Dashboard({ userName, names, anniversary }: Props) {
  const [section, setSection] = useState<SectionId>("inicio");
  const [progress, setProgress] = useState<Progress>({});
  const progressRef = useRef<Progress>({});

  useEffect(() => {
    const local = loadProgress();
    progressRef.current = local;
    setProgress(local);
    (async () => {
      const remote = await loadRemote();
      if (!remote) return;
      const merged: Progress = { ...local, ...remote };
      progressRef.current = merged;
      setProgress(merged);
      saveProgress(merged);
      if (Object.keys(merged).length !== Object.keys(remote).length) void saveRemote(merged);
    })();
  }, []);

  const update = (fn: (p: Progress) => Progress) => {
    const next = fn(progressRef.current);
    progressRef.current = next;
    setProgress(next);
    saveProgress(next);
    void saveRemote(next);
  };

  const toggle = (d: DateIdea) =>
    update((p) => {
      const next = { ...p };
      if (next[d.id]) delete next[d.id];
      else next[d.id] = { at: new Date().toISOString(), by: userName };
      return next;
    });

  const setNote = (d: DateIdea, note: string) =>
    update((p) => ({
      ...p,
      [d.id]: { at: p[d.id]?.at ?? new Date().toISOString(), by: p[d.id]?.by ?? userName, note }
    }));

  const days = useMemo(() => {
    if (!anniversary) return null;
    const t = new Date(`${anniversary}T00:00:00`).getTime();
    if (Number.isNaN(t)) return null;
    return Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
  }, [anniversary]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" }).catch(() => undefined);
    window.location.assign("/");
  }

  const initials = `${names[0].trim().charAt(0)}${names[1].trim().charAt(0)}`;

  return (
    <div className="relative min-h-screen">
      <Scene3D variant="panel" />
      <Petals count={6} />

      {/* Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-white/[0.06] bg-night-900/70 p-6 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-blush-400/40 font-script text-base text-blush-200">
            {initials}
          </span>
          <div>
            <Micro>Nuestro universo</Micro>
            <p className="mt-0.5 text-xs text-blush-200/60">
              {names[0]} & {names[1]}
            </p>
          </div>
        </div>

        <nav className="mt-10 space-y-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition ${
                section === n.id
                  ? "bg-white/[0.07] text-white"
                  : "text-blush-200/60 hover:bg-white/[0.04] hover:text-blush-100"
              }`}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex-1" />
        <Micro>Sesión de {userName}</Micro>
        <button onClick={logout} className="btn-ghost mt-3 w-full justify-start !py-2 text-xs">
          <IconOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </aside>

      {/* Barra superior móvil */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-white/[0.06] bg-night-900/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-blush-400/40 font-script text-sm text-blush-200">
            {initials}
          </span>
          <Micro>Nuestro universo</Micro>
        </div>
        <button
          onClick={logout}
          className="text-blush-200/60 transition hover:text-blush-100"
          aria-label="Cerrar sesión"
        >
          <IconOut className="h-5 w-5" />
        </button>
      </header>

      {/* Navegación inferior móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/[0.06] bg-night-900/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setSection(n.id)}
            className={`flex flex-col items-center gap-1 py-2.5 transition ${
              section === n.id ? "text-blush-300" : "text-blush-200/40"
            }`}
          >
            <n.icon className="h-5 w-5" />
            <span className="text-[9px] font-semibold uppercase tracking-micro">{n.label}</span>
          </button>
        ))}
      </nav>

      {/* Contenido */}
      <main className="relative z-10 lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 pb-28 pt-20 sm:px-8 lg:pb-16 lg:pt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {section === "inicio" && (
                <Home names={names} days={days} progress={progress} onNavigate={setSection} />
              )}
              {section === "citas" && <Dates progress={progress} onToggle={toggle} onNote={setNote} />}
              {section === "cartas" && <Letters me={userName} names={names} />}
              {section === "fotos" && <Gallery me={userName} />}
              {section === "musica" && <Music me={userName} />}
            </motion.div>
          </AnimatePresence>

          <footer className="mt-24 border-t border-white/[0.05] pt-8 text-center">
            <Micro>
              Hecho a mano por {names[0]}, para {names[1]}
            </Micro>
            <p className="mt-2 font-script text-xl text-blush-300/60">nuestro universo, solo nuestro</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
