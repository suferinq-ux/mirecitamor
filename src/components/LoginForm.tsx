"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Scene3D from "./Scene3D";
import Petals from "./Petals";
import { Micro, Spinner } from "./ui";

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
      setErr("Elige quién eres.");
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
      const next = fails + 1;
      setFails(next);
      setErr(data?.error ?? "No se pudo entrar.");
      if (next >= 5) {
        setLockUntil(Date.now() + 60_000);
        setNow(Date.now());
      }
    } catch {
      setErr("Sin conexión con nuestro universo.");
    } finally {
      setLoading(false);
    }
  }

  const initials = `${names[0].trim().charAt(0)}${names[1].trim().charAt(0)}`;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <Scene3D variant="login" />
      <Petals count={7} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="panel-strong relative z-10 w-full max-w-sm p-8 sm:p-10"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-blush-400/40 font-script text-lg text-blush-200">
          {initials}
        </div>
        <Micro className="mt-5 block text-center">Acceso privado</Micro>
        <h1 className="mt-2 text-center font-display text-3xl text-blush-50">Nuestro universo</h1>
        <p className="mt-2 text-center text-xs leading-relaxed text-blush-200/60">
          Dos personas en el mundo tienen esta llave.
        </p>

        <div className="mt-8 space-y-2">
          {names.map((name, i) => {
            const idx = (i + 1) as 1 | 2;
            const active = sel === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSel(idx);
                  setErr(null);
                }}
                className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                  active ? "border-blush-400/50 bg-blush-500/10" : "border-white/10 hover:bg-white/[0.04]"
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] font-display text-sm text-blush-100">
                  {name.trim().charAt(0).toUpperCase() || "·"}
                </span>
                <span className="flex-1">
                  <span className="block text-sm text-blush-50">{name}</span>
                  <Micro className="mt-0.5 block">Entrar como</Micro>
                </span>
                <span className={`h-2 w-2 rounded-full transition ${active ? "bg-blush-400" : "bg-white/10"}`} />
              </button>
            );
          })}
        </div>

        <form onSubmit={submit} className="mt-6">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Contraseña"
              autoComplete="current-password"
              maxLength={128}
              className="input pr-16"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-micro text-blush-300/60 transition hover:text-blush-200"
            >
              {show ? "Ocultar" : "Ver"}
            </button>
          </div>

          {err && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
              className="mt-3 text-center text-xs text-blush-300"
            >
              {err}
            </motion.p>
          )}
          {locked && (
            <p className="mt-3 text-center text-xs text-blush-300/80">Espera {lockSeconds} segundos.</p>
          )}

          <button type="submit" disabled={loading || locked} className="btn mt-4 w-full">
            {loading ? <Spinner className="h-4 w-4" /> : null} Entrar
          </button>
        </form>

        {devMode && (
          <p className="mt-5 text-center text-[10px] text-blush-200/40">
            Desarrollo · contraseña demo: amor123
          </p>
        )}
        <Micro className="mt-5 block text-center text-blush-300/40">Cifrado en el servidor · solo nosotros</Micro>
      </motion.div>
    </main>
  );
}
