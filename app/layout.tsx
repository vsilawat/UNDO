import type { Metadata } from "next";
import "./globals.css";

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
          <header className="border-b border-border bg-surface/60 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-brand-ink font-black">
                U
              </span>
              <div className="leading-tight">
                <div className="font-bold tracking-wide">UNDO</div>
                <div className="text-xs text-muted">
                  Incident command for scam victims
                </div>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
