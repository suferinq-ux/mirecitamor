"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";

/* ───────────────────────── Iconos de línea (SVG) ───────────────────────── */
type IconProps = { className?: string };
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24"
};

export const IconHome = ({ className = "h-5 w-5" }: IconProps) => (
  <svg {...base} className={className}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
);
export const IconHeart = ({ className = "h-5 w-5" }: IconProps) => (
  <svg {...base} className={className}><path d="M12 21s-8-5.3-8-11a4.6 4.6 0 0 1 8-3.1A4.6 4.6 0 0 1 20 10c0 5.7-8 11-8 11z" /></svg>
);
export const IconMail = ({ className = "h-5 w-5" }: IconProps) => (
  <svg {...base} className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
export const IconImage = ({ className = "h-5 w-5" }: IconProps) => (
  <svg {...base} className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
);
export const IconMusic = ({ className = "h-5 w-5" }: IconProps) => (
  <svg {...base} className={className}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
);
export const IconOut = ({ className = "h-5 w-5" }: IconProps) => (
  <svg {...base} className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
);
export const IconPlay = ({ className = "h-5 w-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M8 5v14l11-7z" /></svg>
);
export const IconPause = ({ className = "h-5 w-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
);
export const IconPlus = ({ className = "h-5 w-5" }: IconProps) => (
  <svg {...base} className={className}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconX = ({ className = "h-5 w-5" }: IconProps) => (
  <svg {...base} className={className}><path d="m6 6 12 12M18 6 6 18" /></svg>
);
export const IconSearch = ({ className = "h-5 w-5" }: IconProps) => (
  <svg {...base} className={className}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
export const IconTrash = ({ className = "h-5 w-5" }: IconProps) => (
  <svg {...base} className={className}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
);
export const IconSend = ({ className = "h-5 w-5" }: IconProps) => (
  <svg {...base} className={className}><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4z" /></svg>
);

/* ───────────────────────── Piezas de interfaz ───────────────────────── */
export function Micro({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`micro ${className}`}>{children}</span>;
}

export function Spinner({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Modal({
  onClose,
  children,
  max = "max-w-lg"
}: {
  onClose: () => void;
  children: ReactNode;
  max?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
    >
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-night-950/85 backdrop-blur-sm" />
      <motion.div
        initial={{ y: 48, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 32, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className={`panel-strong relative max-h-[92vh] w-full ${max} overflow-y-auto rounded-b-none sm:rounded-b-2xl`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────────── Tilt 3D con spring ───────────────────────── */
export function Tilt({
  children,
  className = "",
  max = 6
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 180, damping: 22 });
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 180, damping: 22 });

  return (
    <motion.div
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
    >
      {children}
    </motion.div>
  );
}
