import type { Metadata } from "next";
import { Archivo, Space_Mono } from "next/font/google";
import "./globals.css";
import { Clock } from "@/components/Clock";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UNDO — First-hour response protocol",
  description: "Undo the damage in the first hour.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivo.variable} ${spaceMono.variable}`}>
      <body>
        <div className="hazard" />
        <header className="border-b-2 border-ink bg-bg">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
            <span className="text-2xl font-black tracking-tight">
              UNDO<span className="text-red">/</span>
            </span>
            <div className="flex items-center gap-5">
              <span className="label hidden text-muted sm:inline">
                First-hour response protocol
              </span>
              <span className="label flex items-center gap-2 text-red">
                <span className="h-2 w-2 bg-red" />
                <Clock />
              </span>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
