import type { Metadata, Viewport } from "next";
import { Playfair_Display, Dancing_Script, Nunito } from "next/font/google";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});
const script = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap"
});
const body = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const n1 = process.env.NEXT_PUBLIC_NAME_1 || "Mi Amor";
const n2 = process.env.NEXT_PUBLIC_NAME_2 || "Mi Vida";

export const metadata: Metadata = {
  title: `${n1} ❤ ${n2} · Nuestro Universo`,
  description: `El rincón más secreto del internet: solo existe para ${n1} y ${n2} y sus 100 citas.`,
  robots: { index: false, follow: false }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#150425"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body
        className={`${display.variable} ${script.variable} ${body.variable} font-body bg-night-900 text-rose-50 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
