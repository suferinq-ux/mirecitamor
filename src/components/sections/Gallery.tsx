"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MediaItem } from "@/app/api/media/route";
import { Modal, Micro, Spinner, IconImage, IconPlus, IconTrash, IconX } from "@/components/ui";

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

/** Comprime imágenes en el navegador antes de subir (máx. 1600px, JPEG 0.82). */
function compressImage(file: File): Promise<{ data: string; type: string; size: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 1600;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas"));
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) return reject(new Error("blob"));
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = String(reader.result);
            resolve({ data: dataUrl.split(",")[1], type: "image/jpeg", size: blob.size });
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        0.82
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("imagen"));
    };
    img.src = url;
  });
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Gallery({ me }: { me: string }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [open, setOpen] = useState<MediaItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetch("/api/media")
      .then((r) => (r.ok ? r.json() : []))
      .then((m: MediaItem[]) => setItems(m.filter((x) => x.kind === "foto")))
      .catch(() => setItems([]));
  }, []);

  useEffect(load, [load]);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const { data, type, size } = await compressImage(file);
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "foto",
          name: file.name.replace(/\.[^.]+$/, "").slice(0, 60) || "Fotografía",
          type,
          data
        })
      });
      if (!res.ok) {
        setError((await res.json().catch(() => ({}))).error ?? "No se pudo subir.");
      } else {
        void size;
        load();
      }
    } catch {
      setError("No se pudo procesar la imagen.");
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(id: string) {
    await fetch(`/api/media?id=${id}`, { method: "DELETE" });
    setOpen(null);
    load();
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Micro>Memoria visual</Micro>
          <h2 className="mt-2 font-display text-3xl text-blush-50 sm:text-4xl">Fotografías</h2>
        </div>
        <button className="btn" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Spinner className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />} Subir
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
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
          <IconImage className="h-6 w-6 text-blush-400/50" />
          <p className="font-display text-lg text-blush-100/80">El álbum está vacío</p>
          <p className="max-w-xs text-xs leading-relaxed text-blush-200/50">
            Las fotos que suban aquí no viven en ninguna nube ajena: solo en la nuestra.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
          {items.map((m, i) => (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              onClick={() => setOpen(m)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.06]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/media/${m.id}`}
                alt={m.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-night-950/85 via-transparent to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                <p className="truncate text-xs text-blush-50">{m.name}</p>
                <Micro>{m.by} · {fmt(m.at)}</Micro>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <Modal onClose={() => setOpen(null)} max="max-w-3xl">
            <div className="relative bg-night-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/media/${open.id}`} alt={open.name} className="max-h-[70vh] w-full object-contain" />
              <div className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="truncate font-display text-lg text-blush-50">{open.name}</p>
                  <Micro>{open.by} · {fmt(open.at)} · {(open.size / 1024).toFixed(0)} KB</Micro>
                </div>
                <div className="flex shrink-0 gap-2">
                  {open.by === me && (
                    <button className="btn-ghost !px-3" onClick={() => remove(open.id)} aria-label="Eliminar">
                      <IconTrash className="h-4 w-4" />
                    </button>
                  )}
                  <button className="btn-ghost !px-3" onClick={() => setOpen(null)} aria-label="Cerrar">
                    <IconX className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/** base64 helper reutilizable para audio (sin compresión). */
export { toBase64 };
