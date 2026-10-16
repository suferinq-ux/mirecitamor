"use client";

import { useMemo } from "react";

const GLYPHS = ["❀", "✿"];

interface Petal {
  left: number;
  delay: number;
  duration: number;
  size: number;
  glyph: string;
  opacity: number;
}

/** Lluvia muy sutil de pétalos, casi imperceptible: textura, no ruido. */
export default function Petals({ count = 8 }: { count?: number }) {
  const petals = useMemo<Petal[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 89 + 17) % 100,
        delay: -((i * 4.3) % 26),
        duration: 22 + ((i * 3.1) % 14),
        size: 9 + ((i * 5) % 8),
        glyph: GLYPHS[i % GLYPHS.length],
        opacity: 0.08 + ((i * 11) % 14) / 100
      })),
    [count]
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-blush-300">
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
