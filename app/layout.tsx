import type { Metadata } from "next";
import "./globals.css";
import { Clock } from "@/components/Clock";

export const metadata: Metadata = {
  title: "UNDO — Undo the damage in the first hour",
  description: "Incident command for scam victims.",
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
          <header className="sticky top-0 z-10 border-b border-border/70 bg-bg/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-b from-[#ff6474] to-[#ff3b4d] font-black text-white shadow-[0_6px_16px_-6px_rgba(255,77,94,0.8)]">
                  U
                </span>
                <span className="text-[15px] font-bold tracking-tight">UNDO</span>
                <span className="ml-1 flex items-center gap-1.5 rounded-full border border-crit/25 bg-crit/10 px-2.5 py-1">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-crit" />
                  <span className="text-[11px] font-semibold tracking-wide text-crit">
                    LIVE
                  </span>
                </span>
              </div>
              <div className="mono flex items-center gap-2 text-xs text-muted">
                <span className="hidden sm:inline">elapsed</span>
                <Clock />
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
