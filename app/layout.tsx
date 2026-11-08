import type { Metadata } from "next";
import "./globals.css";
import { Clock } from "@/components/Clock";

export const metadata: Metadata = {
  title: "UNDO — Incident command for scam victims",
  description: "Undo the damage in the first hour.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-dvh">
          <header className="border-b border-border bg-surface/70 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2">
                  <span className="live-dot h-2.5 w-2.5 rounded-full bg-crit shadow-[0_0_8px_2px_rgba(255,59,59,0.7)]" />
                  <span className="font-bold tracking-widest text-crit">LIVE</span>
                </span>
                <span className="font-bold tracking-widest">
                  UNDO<span className="text-muted">//INCIDENT</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span className="hidden sm:inline">ELAPSED</span>
                <Clock />
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
