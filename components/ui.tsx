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
      className={`tac-card border border-border bg-surface p-5 ${className}`}
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
    "inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-warn text-brand-ink hover:brightness-110",
    ghost: "border border-border bg-surface-2 text-text hover:border-warn",
    danger:
      "bg-crit text-[#1a0000] hover:brightness-110 shadow-[0_0_12px_rgba(255,59,59,0.4)]",
  }[variant];
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

const STATUS_META: Record<
  AssetStatus,
  { label: string; dot: string; text: string }
> = {
  safe: { label: "SAFE", dot: "bg-ok", text: "text-ok" },
  at_risk: { label: "AT_RISK", dot: "bg-warn", text: "text-warn" },
  compromised: { label: "COMPROMISED", dot: "bg-crit", text: "text-crit" },
  locked: { label: "LOCKED", dot: "bg-info", text: "text-info" },
};

export function StatusChip({ status }: { status: AssetStatus }) {
  const m = STATUS_META[status];
  const glow =
    status === "compromised"
      ? "shadow-[0_0_8px_2px_rgba(255,59,59,0.6)]"
      : status === "at_risk"
        ? "shadow-[0_0_8px_1px_rgba(255,176,32,0.5)]"
        : "";
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-bold ${m.text}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${m.dot} ${glow}`} />
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
      <span className="grid h-6 w-6 shrink-0 place-items-center border border-warn/50 text-xs font-bold text-warn">
        {String(n).padStart(2, "0")}
      </span>
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </div>
    </div>
  );
}
