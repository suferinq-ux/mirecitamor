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

export const metadata: Metadata = {
  title: "Nuestro Universo · 100 Citas",
  description:
    "Un rincón secreto del internet que solo existe para dos personas: nuestras 100 citas.",
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
