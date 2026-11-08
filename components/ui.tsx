import type { ReactNode, ButtonHTMLAttributes } from "react";
import type { AssetStatus } from "@/app/_client/types";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`card p-6 ${className}`}>{children}</div>;
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
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed";
  const sizing = size === "lg" ? "px-7 py-4 text-base" : "px-5 py-3 text-sm";
  const styles = {
    primary:
      "bg-gradient-to-b from-[#ff6474] to-[#ff3b4d] text-white shadow-[0_8px_24px_-8px_rgba(255,77,94,0.7)] hover:brightness-110",
    ghost: "border border-border bg-elevated text-text hover:border-muted",
    danger:
      "bg-gradient-to-b from-[#ff6474] to-[#ff3b4d] text-white shadow-[0_8px_24px_-8px_rgba(255,77,94,0.7)] hover:brightness-110",
  }[variant];
  return <button className={`${base} ${sizing} ${styles} ${className}`} {...props} />;
}

const STATUS_META: Record<
  AssetStatus,
  { label: string; dot: string; chip: string }
> = {
  safe: { label: "Safe", dot: "bg-ok", chip: "text-ok bg-ok/10 border-ok/20" },
  at_risk: {
    label: "At risk",
    dot: "bg-warn",
    chip: "text-warn bg-warn/10 border-warn/20",
  },
  compromised: {
    label: "Compromised",
    dot: "bg-crit",
    chip: "text-crit bg-crit/10 border-crit/25",
  },
  locked: {
    label: "Locked",
    dot: "bg-info",
    chip: "text-info bg-info/10 border-info/20",
  },
};

export function StatusChip({ status }: { status: AssetStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${m.chip}`}
    >
      <span className={`h-2 w-2 rounded-full ${m.dot}`} />
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
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-elevated text-xs font-bold text-warn">
        {n}
      </span>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {sub && <p className="text-sm text-muted">{sub}</p>}
      </div>
    </div>
  );
}
