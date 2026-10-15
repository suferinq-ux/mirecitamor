"use client";

import { useMemo } from "react";

const GLYPHS = ["💗", "🌸", "", "🩷", "✧"];

interface Petal {
  left: number;
  delay: number;
  duration: number;
  size: number;
  glyph: string;
  opacity: number;
}

/** Lluvia suave de pétalos y corazoncitos (CSS puro). */
export default function Petals({ count = 14 }: { count?: number }) {
  const petals = useMemo<Petal[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 97 + 13) % 100,
        delay: -((i * 3.7) % 18),
        duration: 12 + ((i * 2.3) % 10),
        size: 12 + ((i * 7) % 14),
        glyph: GLYPHS[i % GLYPHS.length],
        opacity: 0.25 + ((i * 13) % 40) / 100
      })),
    [count]
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }}
        >
          {p.glyph}
        </span>
      ))}
    </div>
  );
}
