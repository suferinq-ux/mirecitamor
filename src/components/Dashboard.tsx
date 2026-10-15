"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Scene3D from "./Scene3D";
import Petals from "./Petals";
import { CATEGORIES, DATES, type Category, type DateIdea } from "@/lib/dates";
import { loadProgress, saveProgress, type Progress } from "@/lib/store";

const pad = (n: number) => String(n).padStart(3, "0");
const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso)
  );

/* ─────────────────────────── Anillo de progreso ─────────────────────────── */
function ProgressRing({ done }: { done: number }) {
  const R = 62;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative h-40 w-40 shrink-0">
      <svg viewBox="0 0 150 150" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff6b9d" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <circle cx="75" cy="75" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <motion.circle
          cx="75"
          cy="75"
          r={R}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - done / 100) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl text-grad">{done}</span>
        <span className="text-[11px] text-rose-100/60">de 100 vividas</span>
      </div>
    </div>
  );
}

/* ─────────────────────────── Explosión de corazones ─────────────────────────── */
function HeartBurst({ trigger }: { trigger: number }) {
  const parts = useMemo(() => {
    if (!trigger) return [];
    const glyphs = ["💖", "💘", "💕", "🩷", "❤️", "✨"];
    return Array.from({ length: 20 }, (_, i) => {
      const angle = (i / 20) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 100 + Math.random() * 160;
      return {
        id: `${trigger}-${i}`,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        glyph: glyphs[i % glyphs.length],
        delay: Math.random() * 0.12
      };
    });
  }, [trigger]);

  if (!trigger) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center">
      {parts.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1.7 }}
          transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
          className="absolute text-3xl"
        >
          {p.glyph}
        </motion.span>
      ))}
    </div>
  );
}

/* ─────────────────────────── Tarjeta de cita ─────────────────────────── */
function DateCardView({
  d,
  done,
  index,
  onOpen
}: {
  d: DateIdea;
  done: boolean;
  index: number;
  onOpen: () => void;
}) {
  const cat = CATEGORIES[d.cat];
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.015, 0.4) }}
      whileHover={{ y: -6, scale: 1.02, rotate: -0.7 }}
      whileTap={{ scale: 0.97 }}
      onClick={onOpen}
      className={`group relative overflow-hidden rounded-3xl border p-5 text-left backdrop-blur-xl transition-colors ${
        done
          ? "border-rose-300/40 bg-rose-400/10"
          : "border-white/10 bg-white/[0.05] hover:border-rose-200/30 hover:bg-white/[0.08]"
      } ${d.special ? "ring-1 ring-amber-300/60 shadow-[0_0_35px_rgba(251,191,36,0.22)]" : ""}`}
    >
      {done && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-rose-500/10 via-transparent to-fuchsia-500/10" />
      )}
      <div className="flex items-start justify-between">
        <span className="font-display text-xs tracking-[0.2em] text-rose-100/40">#{pad(d.id)}</span>
        <span className={`text-lg transition ${done ? "animate-beat" : "opacity-30 group-hover:opacity-70"}`}>
          {done ? "❤️" : "🤍"}
        </span>
      </div>
      <span className="mt-3 block text-4xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-125">
        {d.emoji}
      </span>
      <h3 className="mt-3 font-semibold leading-snug text-rose-50">{d.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-rose-100/60">{d.tip}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className={`chip ${cat.chip}`}>
          {cat.emoji} {cat.label}
        </span>
        {d.special && <span className="text-[10px] font-bold tracking-wider text-amber-200">✨ CITA MÁGICA</span>}
      </div>
    </motion.button>
  );
}

/* ─────────────────────────── Modal de cita ─────────────────────────── */
function DateModal({
  d,
  note,
  doneAt,
  onClose,
  onToggle,
  onNote
}: {
  d: DateIdea;
  note: string;
  doneAt?: string;
  onClose: () => void;
  onToggle: () => void;
  onNote: (v: string) => void;
}) {
  const cat = CATEGORIES[d.cat];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-night-900/85 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.85, y: 60, opacity: 0, rotateX: 12 }}
        animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="glass-strong relative w-full max-w-lg overflow-hidden p-8 shadow-glow"
      >
        <div className="flex items-start justify-between">
          <span className="font-display text-xs tracking-[0.25em] text-rose-100/40">CITA #{pad(d.id)}</span>
          <button onClick={onClose} className="rounded-full px-2 text-rose-100/50 transition hover:text-rose-50">✕</button>
        </div>

        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, -4, 4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mt-4 text-center text-7xl drop-shadow-[0_0_30px_rgba(255,107,157,0.6)]"
        >
          {d.emoji}
        </motion.div>
        <h2 className="mt-4 text-center font-display text-3xl text-rose-50">{d.title}</h2>
        <p className="mt-2 text-center italic leading-relaxed text-rose-100/70">“{d.tip}”</p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className={`chip ${cat.chip}`}>
            {cat.emoji} {cat.label}
          </span>
          {doneAt && (
            <span className="chip border-rose-300/40 from-rose-400/25 to-fuchsia-500/25 text-rose-100">
              ❤️ Vivida el {fmtDate(doneAt)}
            </span>
          )}
          {d.special && <span className="chip border-amber-300/40 from-amber-400/20 to-yellow-500/20 text-amber-100">✨ Cita mágica</span>}
        </div>

        <label className="mt-6 block text-xs font-semibold uppercase tracking-wider text-rose-100/60">
          Nuestra nota secreta
        </label>
        <textarea
          value={note}
          onChange={(e) => onNote(e.target.value)}
          maxLength={500}
          rows={3}
          disabled={!doneAt}
          placeholder={doneAt ? "Escribe aquí el recuerdo de esta cita…" : "Márcala como vivida para escribir su recuerdo…"}
          className="input-love mt-2 resize-none text-sm disabled:opacity-40"
        />

        <div className="mt-6 flex gap-3">
          <button onClick={onToggle} className="btn-love flex-1">
            {doneAt ? "Ya la vivimos ❤️ · desmarcar" : "Marcar como vivida 💖"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────── Ruleta sorpresa ─────────────────────────── */
function RandomModal({
  pendingIds,
  onClose,
  onPick
}: {
  pendingIds: number[];
  onClose: () => void;
  onPick: (d: DateIdea) => void;
}) {
  const [phase, setPhase] = useState<"spin" | "result">("spin");
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<DateIdea | null>(null);

  useEffect(() => {
    if (phase !== "spin") return;
    const iv = setInterval(() => setIdx(Math.floor(Math.random() * DATES.length)), 75);
    const to = setTimeout(() => {
      clearInterval(iv);
      const pool = pendingIds.length
        ? DATES.filter((d) => pendingIds.includes(d.id))
        : DATES;
      const c = pool[Math.floor(Math.random() * pool.length)];
      setChosen(c);
      setIdx(DATES.findIndex((d) => d.id === c.id));
      setPhase("result");
    }, 2300);
    return () => {
      clearInterval(iv);
      clearTimeout(to);
    };
  }, [phase, pendingIds]);

  const current = DATES[idx];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-night-900/85 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.85, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="glass-strong relative w-full max-w-md overflow-hidden p-8 text-center shadow-glow"
      >
        <p className="font-script text-3xl text-grad">El destino dice…</p>

        <div className="mt-6 flex h-44 flex-col items-center justify-center [perspective:800px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase === "spin" ? `spin-${idx}` : "result"}
              initial={{ rotateY: 90, scale: 0.6, opacity: 0 }}
              animate={{ rotateY: 0, scale: 1, opacity: 1 }}
              exit={{ rotateY: -90, scale: 0.6, opacity: 0 }}
              transition={{ duration: phase === "spin" ? 0.09 : 0.45 }}
              className="flex flex-col items-center"
            >
              <span className="text-7xl drop-shadow-[0_0_30px_rgba(255,107,157,0.6)]">
                {(phase === "result" ? chosen : current)?.emoji}
              </span>
              <span className="mt-3 max-w-xs font-display text-xl leading-snug text-rose-50">
                {(phase === "result" ? chosen : current)?.title}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-2 text-sm text-rose-100/60">
          {phase === "spin" ? "Girando entre nuestras 100 promesas… 💫" : "¡Nuestra próxima aventura está elegida!"}
        </p>

        <div className="mt-6 flex gap-3">
          {phase === "result" ? (
            <>
              <button onClick={() => chosen && onPick(chosen)} className="btn-love flex-1">
                Ver esta cita 💫
              </button>
              <button onClick={() => setPhase("spin")} className="rounded-full border border-white/15 px-5 py-3 text-sm text-rose-100/80 transition hover:bg-white/10">
                Girar de nuevo
              </button>
            </>
          ) : (
            <button onClick={onClose} className="mx-auto rounded-full border border-white/15 px-5 py-3 text-sm text-rose-100/80 transition hover:bg-white/10">
              Cancelar
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────── Panel principal ─────────────────────────── */
interface Props {
  userIndex: number;
  userName: string;
  names: [string, string];
  anniversary: string | null;
}

export default function Dashboard({ userName, names, anniversary }: Props) {
  const [progress, setProgress] = useState<Progress>({});
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"todas" | "pendientes" | "vividas">("todas");
  const [cat, setCat] = useState<"todas" | Category>("todas");
  const [selected, setSelected] = useState<DateIdea | null>(null);
  const [randomOpen, setRandomOpen] = useState(false);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    setProgress(loadProgress());
    setMounted(true);
  }, []);

  const update = (fn: (p: Progress) => Progress) =>
    setProgress((prev) => {
      const next = fn(prev);
      saveProgress(next);
      return next;
    });

  const toggle = (d: DateIdea) => {
    const wasDone = !!progress[d.id];
    update((p) => {
      const next = { ...p };
      if (next[d.id]) delete next[d.id];
      else next[d.id] = { at: new Date().toISOString(), by: userName };
      return next;
    });
    if (!wasDone) setBurst((b) => b + 1);
  };

  const setNote = (d: DateIdea, note: string) =>
    update((p) => ({
      ...p,
      [d.id]: { at: p[d.id]?.at ?? new Date().toISOString(), by: p[d.id]?.by ?? userName, note }
    }));

  const doneCount = mounted ? Object.keys(progress).length : 0;
  const pendingIds = DATES.filter((d) => !progress[d.id]).map((d) => d.id);

  const list = DATES.filter((d) => {
    const done = !!progress[d.id];
    if (status === "vividas" && !done) return false;
    if (status === "pendientes" && done) return false;
    if (cat !== "todas" && d.cat !== cat) return false;
    return true;
  });

  const moments = mounted
    ? Object.entries(progress)
        .map(([id, e]) => ({ d: DATES[Number(id) - 1], e }))
        .filter((x) => x.d)
        .sort((a, b) => b.e.at.localeCompare(a.e.at))
    : [];

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

  return (
    <div className="relative min-h-screen">
      <Scene3D variant="panel" />
      <Petals count={10} />

      <header className="sticky top-0 z-30 border-b border-white/5 bg-night-900/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
          <span className="font-script text-2xl text-grad">Nuestras 100 citas</span>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-rose-100/70 sm:block">
              {names[0]} <span className="text-rose-400">❤</span> {names[1]}
            </span>
            <button
              onClick={logout}
              className="rounded-full border border-white/15 px-4 py-1.5 text-xs text-rose-100/80 transition hover:border-rose-300/40 hover:bg-rose-400/10"
            >
              Salir 
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="glass mt-8 flex flex-col items-center gap-8 p-8 md:flex-row md:p-10"
        >
          <ProgressRing done={doneCount} />
          <div className="flex-1 text-center md:text-left">
            <p className="font-script text-3xl text-grad">
              {names[0]} & {names[1]}
            </p>
            <h1 className="mt-1 font-display text-4xl leading-tight text-rose-50 sm:text-5xl">
              Nuestro universo de citas
            </h1>
            <p className="mt-3 leading-relaxed text-rose-100/70">
              Cien promesas escritas bajo las mismas estrellas. Cada tarjeta que marques
              como vivida se convierte en un recuerdo guardado para siempre en este rincón secreto.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
              <button onClick={() => setRandomOpen(true)} className="btn-love">
                Sorpréndeme 💫
              </button>
              {days !== null && (
                <span className="chip border-rose-300/30 from-rose-400/20 to-fuchsia-500/20 text-rose-100">
                  💞 {days} días juntos
                </span>
              )}
              <span className="chip border-white/15 from-white/10 to-white/5 text-rose-100/80">
                👋 Hola, {userName}
              </span>
            </div>
          </div>
        </motion.section>

        {/* Filtros */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {(["todas", "pendientes", "vividas"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${
                status === s
                  ? "bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-glow-sm"
                  : "border border-white/10 text-rose-100/70 hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-white/15 sm:block" />
          <button
            onClick={() => setCat("todas")}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              cat === "todas" ? "bg-white/20 text-white" : "text-rose-100/60 hover:bg-white/10"
            }`}
          >
            ✨ Todo
          </button>
          {(Object.keys(CATEGORIES) as Category[]).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                cat === c ? "bg-white/20 text-white" : "text-rose-100/60 hover:bg-white/10"
              }`}
            >
              {CATEGORIES[c].emoji} {CATEGORIES[c].label}
            </button>
          ))}
        </div>

        {/* Grid de citas */}
        <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((d, i) => (
              <DateCardView
                key={d.id}
                d={d}
                index={i}
                done={!!progress[d.id]}
                onOpen={() => setSelected(d)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
        {list.length === 0 && (
          <p className="mt-16 text-center text-rose-100/60">
            Nada por aquí… ¡vivan más citas, tortolitos! 🕊️
          </p>
        )}

        {/* Momentos vividos */}
        {moments.length > 0 && (
          <section className="mt-16">
            <h2 className="font-script text-4xl text-grad">Nuestros momentos vividos</h2>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-4">
              {moments.map(({ d, e }) => (
                <button
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className="glass min-w-[230px] shrink-0 p-4 text-left transition hover:border-rose-300/40 hover:bg-rose-400/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{d.emoji}</span>
                    <span className="text-xs text-rose-100/50">{fmtDate(e.at)}</span>
                  </div>
                  <p className="mt-2 font-semibold leading-snug text-rose-50">{d.title}</p>
                  {e.note && <p className="mt-1 line-clamp-2 text-xs italic text-rose-100/60">“{e.note}”</p>}
                </button>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-20 text-center text-xs text-rose-100/40">
          Hecho con amor infinito, solo para {names[0]} y {names[1]} · {new Date().getFullYear()} 💞
          <span className="mt-2 block font-script text-lg text-rose-200/60">
            Hecho a mano por {names[0]}, porque {names[1]} se merece el universo entero. 💌
          </span>
        </footer>
      </main>

      <AnimatePresence>
        {selected && (
          <DateModal
            key={selected.id}
            d={selected}
            note={progress[selected.id]?.note ?? ""}
            doneAt={progress[selected.id]?.at}
            onClose={() => setSelected(null)}
            onToggle={() => toggle(selected)}
            onNote={(v) => setNote(selected, v)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {randomOpen && (
          <RandomModal
            key="random"
            pendingIds={pendingIds}
            onClose={() => setRandomOpen(false)}
            onPick={(d) => {
              setRandomOpen(false);
              setSelected(d);
            }}
          />
        )}
      </AnimatePresence>

      <HeartBurst trigger={burst} />
    </div>
  );
}
