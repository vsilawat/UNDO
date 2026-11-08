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
    <div className={`border border-ink bg-surface ${className}`}>{children}</div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  size?: "md" | "lg";
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed border-2";
  const sizing = size === "lg" ? "px-7 py-4 text-sm" : "px-5 py-3 text-xs";
  const styles = {
    primary: "border-red bg-red text-bg hover:bg-red-dark hover:border-red-dark",
    danger: "border-red bg-red text-bg hover:bg-red-dark hover:border-red-dark",
    ghost: "border-ink bg-transparent text-ink hover:bg-ink hover:text-bg",
  }[variant];
  return <button className={`${base} ${sizing} ${styles} ${className}`} {...props} />;
}

const STATUS_META: Record<AssetStatus, { label: string; tw: string }> = {
  safe: { label: "Safe", tw: "text-ok border-ok" },
  at_risk: { label: "At risk", tw: "text-warn border-warn" },
  compromised: { label: "Compromised", tw: "text-red border-red" },
  locked: { label: "Locked", tw: "text-ink border-ink" },
};

export function StatusChip({ status }: { status: AssetStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`label inline-flex items-center border px-2.5 py-1 ${m.tw}`}
    >
      {m.label}
    </span>
  );
}

export function SectionTitle({
  title,
  sub,
}: {
  n?: number;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mb-4">
      <div className="label dashed pb-2 text-muted">{title}</div>
      {sub && <p className="mt-2 text-sm text-muted">{sub}</p>}
    </div>
  );
}
