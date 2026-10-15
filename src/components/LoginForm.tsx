"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Scene3D from "./Scene3D";
import Petals from "./Petals";

interface Props {
  names: [string, string];
  devMode: boolean;
}

export default function LoginForm({ names, devMode }: Props) {
  const [sel, setSel] = useState<1 | 2 | null>(null);
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fails, setFails] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  const locked = now < lockUntil;
  const lockSeconds = Math.max(0, Math.ceil((lockUntil - now) / 1000));

  useEffect(() => {
    if (!locked) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [locked]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (locked || loading) return;
    if (!sel) {
      setErr("Primero elige quién eres, corazón. 💭");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: sel, password: pass })
      });
      if (res.ok) {
        window.location.assign("/amor");
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      const nextFails = fails + 1;
      setFails(nextFails);
      setErr(data?.error ?? "Algo salió mal, mi amor.");
      if (nextFails >= 5) {
        setLockUntil(Date.now() + 60_000);
        setNow(Date.now());
      }
    } catch {
      setErr("No pude conectar con nuestro universo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <Scene3D variant="login" />
      <Petals count={16} />

      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong relative z-10 w-full max-w-md p-8 shadow-glow sm:p-10"
      >
        <motion.div
          aria-hidden
          className="mx-auto -mt-16 mb-4 w-fit text-6xl drop-shadow-[0_0_25px_rgba(255,107,157,0.8)]"
          animate={{ scale: [1, 1.12, 0.98, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          💞
        </motion.div>

        <h1 className="font-script text-center text-5xl text-grad">
          Nuestro universo secreto
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-rose-100/70">
          En todo el internet, solo existen dos llaves para entrar aquí…
          <br />y las tenemos tú y yo.
        </p>

        <div className="mt-5 flex items-center justify-center gap-4 font-script text-4xl">
          <span className="text-grad">{names[0].trim().charAt(0) || "J"}</span>
          <motion.span
            className="text-rose-400"
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            ♥
          </motion.span>
          <span className="text-grad">{names[1].trim().charAt(0) || "M"}</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {names.map((name, i) => {
            const idx = (i + 1) as 1 | 2;
            const active = sel === idx;
            return (
              <motion.button
                key={idx}
                type="button"
                whileHover={{ y: -4, scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSel(idx);
                  setErr(null);
                }}
                className={`group flex flex-col items-center gap-2 rounded-3xl border p-4 transition ${
                  active
                    ? "border-rose-300/60 bg-rose-400/15 shadow-glow-sm"
                    : "border-white/10 bg-white/[0.04] hover:border-rose-200/30 hover:bg-white/[0.08]"
                }`}
              >
                <span
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white transition group-hover:animate-beat ${
                    active
                      ? "bg-gradient-to-br from-rose-400 to-fuchsia-500"
                      : "bg-gradient-to-br from-white/15 to-white/5"
                  }`}
                >
                  {name.trim().charAt(0).toUpperCase() || "❤"}
                </span>
                <span className="font-display text-sm text-rose-50/90">{name}</span>
                <span className="text-[11px] text-rose-100/50">
                  {active ? "¡Hola, mi amor! ✨" : "Toca si eres tú"}
                </span>
              </motion.button>
            );
          })}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Nuestra contraseña secreta…"
              autoComplete="current-password"
              maxLength={128}
              className="input-love pr-12"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-lg opacity-70 transition hover:opacity-100"
            >
              {show ? "🙈" : "👀"}
            </button>
          </div>

          {err && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, x: [0, -8, 8, -6, 6, 0] }}
              transition={{ duration: 0.45 }}
              className="text-center text-sm text-rose-300"
            >
              {err}
            </motion.p>
          )}
          {locked && (
            <p className="text-center text-sm text-amber-200">
              Espera {lockSeconds}s para volver a intentar… respira, te amo. ⏳
            </p>
          )}

          <button type="submit" disabled={loading || locked} className="btn-love w-full">
            {loading ? "Abriendo la puerta…" : "Abrir nuestro mundo 🔐"}
          </button>
        </form>

        {devMode && (
          <p className="mt-4 text-center text-[11px] text-rose-200/50">
            Modo desarrollo · contraseña demo: <code>amor123</code>
          </p>
        )}
        <p className="mt-4 text-center text-[11px] text-rose-200/40">
          Cifrado y privado · hecho solo para nosotros
        </p>
      </motion.div>
    </main>
  );
}
