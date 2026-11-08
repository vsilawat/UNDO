import type { ReactNode, ButtonHTMLAttributes } from "react";
import type { AssetStatus } from "@/app/_client/types";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface p-5 ${className}`}
    >
      {children}
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-base font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-brand text-brand-ink hover:brightness-110",
    ghost: "border border-border bg-surface-2 text-text hover:border-brand",
    danger: "bg-danger text-[#2a0a0a] hover:brightness-110",
  }[variant];
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

const STATUS_META: Record<AssetStatus, { label: string; color: string }> = {
  safe: { label: "Safe", color: "text-safe border-safe/40 bg-safe/10" },
  at_risk: { label: "At risk", color: "text-risk border-risk/40 bg-risk/10" },
  compromised: {
    label: "Compromised",
    color: "text-danger border-danger/40 bg-danger/10",
  },
  locked: { label: "Locked", color: "text-locked border-locked/40 bg-locked/10" },
};

export function StatusChip({ status }: { status: AssetStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${m.color}`}
    >
      {m.label}
    </span>
  );
}

export function SectionTitle({
  n,
  title,
  sub,
}: {
  n: number;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-bold text-brand">
        {n}
      </span>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {sub && <p className="text-sm text-muted">{sub}</p>}
      </div>
    </div>
  );
}
