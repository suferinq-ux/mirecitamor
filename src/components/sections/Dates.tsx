"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CATEGORIES, DATES, type Category, type DateIdea } from "@/lib/dates";
import type { Progress } from "@/lib/progress";
import { Modal, Micro, Tilt, IconHeart, IconSearch, IconX } from "@/components/ui";

const pad = (n: number) => String(n).padStart(3, "0");
const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso)
  );

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

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

/* ─────────────────────────── Modal de una cita ─────────────────────────── */
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
    <Modal onClose={onClose} max="max-w-xl">
      <div className="p-6 sm:p-10">
        <div className="flex items-start justify-between">
          <Micro>
            Cita {pad(d.id)} · {cat.label}
          </Micro>
          <button onClick={onClose} className="text-blush-300/60 hover:text-blush-100">
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="mt-8 text-center text-6xl"
        >
          {d.emoji}
        </motion.div>
        <h3 className="mt-6 text-center font-display text-3xl leading-snug text-blush-50">{d.title}</h3>
        <p className="mx-auto mt-3 max-w-sm text-center text-sm italic leading-relaxed text-blush-200/60">
          “{d.tip}”
        </p>

        {doneAt && (
          <p className="mt-5 text-center">
            <span className="chip border-blush-400/40 text-blush-200">
              <IconHeart className="h-3 w-3" /> Vivida el {fmtDate(doneAt)}
            </span>
          </p>
        )}

        <label className="micro mt-8 block">Nota privada</label>
        <textarea
          value={note}
          onChange={(e) => onNote(e.target.value)}
          maxLength={500}
          rows={3}
          disabled={!doneAt}
          placeholder={doneAt ? "Un detalle que no quieras olvidar…" : "Se desbloquea al vivir la cita"}
          className="input mt-2 resize-none text-sm disabled:opacity-40"
        />

        <button onClick={onToggle} className="btn mt-6 w-full">
          {doneAt ? "Marcar como pendiente" : "Marcar como vivida"}
        </button>
      </div>
    </Modal>
  );
}

/* ─────────────────────────── Ruleta ─────────────────────────── */
function Roulette({
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
    const iv = setInterval(() => setIdx(Math.floor(Math.random() * DATES.length)), 80);
    const to = setTimeout(() => {
      clearInterval(iv);
      const pool = pendingIds.length ? DATES.filter((d) => pendingIds.includes(d.id)) : DATES;
      const c = pool[Math.floor(Math.random() * pool.length)];
      setChosen(c);
      setIdx(DATES.findIndex((d) => d.id === c.id));
      setPhase("result");
    }, 2200);
    return () => {
      clearInterval(iv);
      clearTimeout(to);
    };
  }, [phase, pendingIds]);

  const shown = phase === "result" && chosen ? chosen : DATES[idx] ?? DATES[0];

  return (
    <Modal onClose={onClose} max="max-w-md">
      <div className="p-8 text-center sm:p-10">
        <Micro>El destino decide</Micro>
        <div className="mt-8 flex h-40 flex-col items-center justify-center [perspective:800px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase === "spin" ? `s-${idx}` : "r"}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: phase === "spin" ? 0.09 : 0.4 }}
              className="flex flex-col items-center"
            >
              <span className="text-6xl">{shown.emoji}</span>
              <span className="mt-4 max-w-[240px] font-display text-xl leading-snug text-blush-50">
                {shown.title}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="mt-4 text-xs text-blush-200/50">
          {phase === "spin" ? "Girando entre las pendientes…" : "Esta es la siguiente."}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          {phase === "result" ? (
            <>
              <button className="btn" onClick={() => chosen && onPick(chosen)}>
                Ver cita
              </button>
              <button className="btn-ghost" onClick={() => setPhase("spin")}>
                Girar de nuevo
              </button>
            </>
          ) : (
            <button className="btn-ghost" onClick={onClose}>
              Cancelar
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ─────────────────────────── Apartado Citas ─────────────────────────── */
export default function Dates({
  progress,
  onToggle,
  onNote
}: {
  progress: Progress;
  onToggle: (d: DateIdea) => void;
  onNote: (d: DateIdea, v: string) => void;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"todas" | "pendientes" | "vividas">("todas");
  const [cat, setCat] = useState<"todas" | Category>("todas");
  const [selected, setSelected] = useState<DateIdea | null>(null);
  const [roulette, setRoulette] = useState(false);

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

  const pendingIds = DATES.filter((d) => !progress[d.id]).map((d) => d.id);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Micro>El plan completo</Micro>
          <h2 className="mt-2 font-display text-3xl text-blush-50 sm:text-4xl">Las cien citas</h2>
        </div>
        <button className="btn-ghost" onClick={() => setRoulette(true)}>
          <IconHeart className="h-4 w-4" /> Sorpréndeme
        </button>
      </div>

      <div className="mt-8 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 transition focus-within:border-blush-400/40">
        <IconSearch className="h-4 w-4 shrink-0 text-blush-300/50" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar entre las cien… playa, pizza, plastilina"
          className="w-full bg-transparent text-sm text-blush-50 placeholder-blush-200/30 outline-none"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="text-blush-300/60 hover:text-blush-100"
            aria-label="Limpiar búsqueda"
          >
            <IconX className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {(["todas", "pendientes", "vividas"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs capitalize transition ${
              status === s
                ? "bg-blush-500 text-white"
                : "border border-white/10 text-blush-200/60 hover:bg-white/[0.05]"
            }`}
          >
            {s}
          </button>
        ))}
        <span className="mx-1 hidden h-4 w-px shrink-0 bg-white/10 sm:block" />
        <button
          onClick={() => setCat("todas")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition ${
            cat === "todas" ? "bg-white/15 text-white" : "text-blush-200/50 hover:bg-white/[0.05]"
          }`}
        >
          Todo
        </button>
        {(Object.keys(CATEGORIES) as Category[]).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition ${
              cat === c ? "bg-white/15 text-white" : "text-blush-200/50 hover:bg-white/[0.05]"
            }`}
          >
            {CATEGORIES[c].label}
            <span className="ml-1 opacity-50">{DATES.filter((d) => d.cat === c).length}</span>
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs text-blush-200/40">
        {list.length} {list.length === 1 ? "cita" : "citas"}
        {q.trim() && <> para “{q.trim()}”</>}
      </p>

      {list.length === 0 ? (
        <div className="panel mt-10 flex flex-col items-center gap-3 p-16 text-center">
          <IconSearch className="h-6 w-6 text-blush-400/50" />
          <p className="font-display text-lg text-blush-100/80">Nada por aquí</p>
          <button
            className="btn-ghost mt-2"
            onClick={() => {
              setQ("");
              setCat("todas");
              setStatus("todas");
            }}
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <motion.div layout className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((d, i) => {
              const done = !!progress[d.id];
              const catMeta = CATEGORIES[d.cat];
              return (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.012, 0.3) }}
                >
                  <Tilt className="h-full">
                    <button
                      onClick={() => setSelected(d)}
                      className={`group panel relative h-full w-full overflow-hidden p-5 text-left transition ${
                        done
                          ? "border-blush-400/30 bg-blush-500/[0.06]"
                          : "hover:border-blush-400/25 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="shine" aria-hidden />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between">
                          <Micro>{pad(d.id)}</Micro>
                          <IconHeart
                            className={`h-4 w-4 transition ${
                              done
                                ? "text-blush-400"
                                : "text-blush-300/25 group-hover:text-blush-300/50"
                            }`}
                          />
                        </div>
                        <div className="mt-5 flex items-start gap-4">
                          <span className="text-3xl leading-none">{d.emoji}</span>
                          <div className="min-w-0">
                            <h3 className="font-display text-base leading-snug text-blush-50">
                              {highlight(d.title, q)}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-blush-200/50">
                              {highlight(d.tip, q)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-5 flex items-center justify-between">
                          <Micro className="text-blush-300/50">{catMeta.label}</Micro>
                          {done ? (
                            <span className="text-[10px] font-semibold uppercase tracking-micro text-blush-300">
                              Vivida
                            </span>
                          ) : d.special ? (
                            <span className="text-[10px] font-semibold uppercase tracking-micro text-amber-200/80">
                              Especial
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  </Tilt>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {selected && (
          <DateModal
            key={selected.id}
            d={selected}
            note={progress[selected.id]?.note ?? ""}
            doneAt={progress[selected.id]?.at}
            onClose={() => setSelected(null)}
            onToggle={() => onToggle(selected)}
            onNote={(v) => onNote(selected, v)}
          />
        )}
        {roulette && (
          <Roulette
            key="roulette"
            pendingIds={pendingIds}
            onClose={() => setRoulette(false)}
            onPick={(d) => {
              setRoulette(false);
              setSelected(d);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
