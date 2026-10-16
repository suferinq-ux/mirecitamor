"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Scene3D from "./Scene3D";
import Petals from "./Petals";
import { CATEGORIES, DATES, type Category, type DateIdea } from "@/lib/dates";
import { loadProgress, saveProgress, loadRemote, saveRemote } from "@/lib/store";
import type { Progress } from "@/lib/progress";

const pad = (n: number) => String(n).padStart(3, "0");
const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso)
  );

/** Normaliza para buscar sin importar acentos ni mayúsculas. */
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

/** Resalta la coincidencia del buscador dentro del texto. */
function highlight(text: string, q: string): ReactNode {
  const nq = norm(q.trim());
  if (!nq) return text;
  const i = norm(text).indexOf(nq);
  if (i < 0) return text;
  const len = q.trim().length;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + len)}</mark>
      {text.slice(i + len)}
    </>
  );
}

/* ─────────────────────────── Anillo de progreso ─────────────────────────── */
function ProgressRing({ done }: { done: number }) {
  const R = 62;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative h-36 w-36 shrink-0 sm:h-40 sm:w-40">
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
  q,
  onOpen
}: {
  d: DateIdea;
  done: boolean;
  index: number;
  q: string;
  onOpen: () => void;
}) {
  const cat = CATEGORIES[d.cat];
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 26, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.012, 0.35) }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onOpen}
      className={`group relative overflow-hidden rounded-[1.75rem] border p-5 text-left backdrop-blur-xl transition-colors duration-300 ${
        done ? "border-rose-300/50" : "border-white/10 hover:border-rose-200/40"
      } ${d.special ? "ring-1 ring-amber-300/60 shadow-[0_0_35px_rgba(251,191,36,0.22)]" : ""}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${cat.tint} opacity-80 transition-opacity duration-300 group-hover:opacity-100`}
      />
      <span className="shine" aria-hidden />
      {done && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-rose-500/10 via-transparent to-fuchsia-500/10" />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <span className="flex h-8 min-w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 px-2 font-display text-[11px] tracking-widest text-rose-100/80">
            {pad(d.id)}
          </span>
          <span className={`text-lg transition ${done ? "animate-beat" : "opacity-35 group-hover:opacity-70"}`}>
            {done ? "❤️" : "🤍"}
          </span>
        </div>

        <div className="mt-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-4xl shadow-inner transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:shadow-glow-sm">
          {d.emoji}
        </div>

        <h3 className="mt-3 font-display text-lg leading-snug text-rose-50">{highlight(d.title, q)}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm italic leading-relaxed text-rose-100/65">
          “{highlight(d.tip, q)}”
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className={`chip ${cat.chip}`}>
            {cat.emoji} {cat.label}
          </span>
          {done ? (
            <span className="-rotate-3 rounded-md border-2 border-rose-300/60 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-rose-200">
              Vivida ✓
            </span>
          ) : d.special ? (
            <span className="animate-pulse text-[10px] font-bold tracking-wider text-amber-200">✨ CITA MÁGICA</span>
          ) : null}
        </div>
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
        className="glass-strong relative w-full max-w-lg overflow-hidden p-6 shadow-glow sm:p-8"
      >
        <div className="flex items-start justify-between">
          <span className="font-display text-xs tracking-[0.25em] text-rose-100/40">CITA #{pad(d.id)}</span>
          <button onClick={onClose} className="rounded-full px-2 text-rose-100/50 transition hover:text-rose-50">✕</button>
        </div>

        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, -4, 4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mt-4 text-center text-6xl drop-shadow-[0_0_30px_rgba(255,107,157,0.6)] sm:text-7xl"
        >
          {d.emoji}
        </motion.div>
        <h2 className="mt-4 text-center font-display text-2xl text-rose-50 sm:text-3xl">{d.title}</h2>
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
        className="glass-strong relative w-full max-w-md overflow-hidden p-6 text-center shadow-glow sm:p-8"
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
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<DateIdea | null>(null);
  const [randomOpen, setRandomOpen] = useState(false);
  const [burst, setBurst] = useState(0);
  const progressRef = useRef<Progress>({});

  useEffect(() => {
    const local = loadProgress();
    progressRef.current = local;
    setProgress(local);
    setMounted(true);
    // El servidor es la fuente de la verdad: combina y sincroniza.
    (async () => {
      const remote = await loadRemote();
      if (!remote) return;
      const merged: Progress = { ...local, ...remote };
      progressRef.current = merged;
      setProgress(merged);
      saveProgress(merged);
      if (Object.keys(merged).length !== Object.keys(remote).length) {
        void saveRemote(merged);
      }
    })();
  }, []);

  const update = (fn: (p: Progress) => Progress) => {
    const next = fn(progressRef.current);
    progressRef.current = next;
    setProgress(next);
    saveProgress(next);
    void saveRemote(next);
  };

  const toggle = (d: DateIdea) => {
    const wasDone = !!progressRef.current[d.id];
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
    if (q.trim()) {
      const hay = norm(`${d.id} ${d.title} ${d.tip} ${CATEGORIES[d.cat].label}`);
      if (!hay.includes(norm(q.trim()))) return false;
    }
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
          <span className="font-script text-xl text-grad sm:text-2xl">Nuestras 100 citas</span>
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
          className="glass mt-6 flex flex-col items-center gap-6 p-6 sm:mt-8 sm:p-8 md:flex-row md:gap-10 md:p-10"
        >
          <ProgressRing done={doneCount} />
          <div className="flex-1 text-center md:text-left">
            <p className="font-script text-2xl text-grad sm:text-3xl">
              {names[0]} & {names[1]}
            </p>
            <h1 className="mt-1 font-display text-3xl leading-tight text-rose-50 sm:text-5xl">
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

        {/* Buscador y filtros */}
        <div className="mt-6 space-y-4 sm:mt-8">
          <div className="glass flex items-center gap-3 rounded-full px-5 py-3 transition focus-within:border-rose-300/50 focus-within:shadow-glow-sm">
            <span aria-hidden className="text-lg">🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Busca un antojo… “playa”, “pizza”, “plastilina”"
              className="w-full bg-transparent text-base text-rose-50 placeholder-rose-200/40 outline-none"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                aria-label="Limpiar búsqueda"
                className="text-rose-100/60 transition hover:text-rose-50"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {(["todas", "pendientes", "vividas"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition ${
                  status === s
                    ? "bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-glow-sm"
                    : "border border-white/10 text-rose-100/70 hover:bg-white/10"
                }`}
              >
                {s === "todas" ? "💫 Todas" : s === "pendientes" ? "🤍 Pendientes" : "❤️ Vividas"}
              </button>
            ))}
            <span className="mx-1 hidden h-5 w-px shrink-0 bg-white/15 sm:block" />
            <button
              onClick={() => setCat("todas")}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
                cat === "todas" ? "bg-white/20 text-white" : "text-rose-100/60 hover:bg-white/10"
              }`}
            >
              ✨ Todo
            </button>
            {(Object.keys(CATEGORIES) as Category[]).map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
                  cat === c ? "bg-white/20 text-white" : "text-rose-100/60 hover:bg-white/10"
                }`}
              >
                {CATEGORIES[c].emoji} {CATEGORIES[c].label}
                <span className="ml-1 text-[10px] opacity-60">
                  {DATES.filter((d) => d.cat === c).length}
                </span>
              </button>
            ))}
          </div>

          <p className="text-xs text-rose-100/50">
            {list.length} {list.length === 1 ? "cita encontrada" : "citas encontradas"}
            {q.trim() && (
              <>
                {" "}para “<span className="text-rose-200">{q.trim()}</span>”
              </>
            )}{" "}
            · toca una tarjeta para abrirla 💌
          </p>
        </div>

        {/* Grid de citas */}
        <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((d, i) => (
              <DateCardView
                key={d.id}
                d={d}
                index={i}
                q={q}
                done={!!progress[d.id]}
                onOpen={() => setSelected(d)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
        {list.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <span className="animate-floaty text-6xl">🥺</span>
            <p className="font-script text-3xl text-grad sm:text-4xl">No encontré nada, mi amor…</p>
            <p className="max-w-xs text-sm text-rose-100/60">
              Prueba con otra palabra, o limpia la búsqueda y los filtros para ver las 100 otra vez.
            </p>
            <button
              onClick={() => {
                setQ("");
                setCat("todas");
                setStatus("todas");
              }}
              className="btn-love mt-2"
            >
              Limpiar todo ✨
            </button>
          </div>
        )}

        {/* Momentos vividos */}
        {moments.length > 0 && (
          <section className="mt-16">
            <h2 className="font-script text-3xl text-grad sm:text-4xl">Nuestros momentos vividos</h2>
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
