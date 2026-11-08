"use client";
import { useEffect, useState } from "react";
import type { Asset, MoneyResult } from "@/app/_client/types";
import { Button } from "./ui";

/** Count up to `target` once, for the final-screen reveal. */
function useCountUp(target: number, ms = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target <= 0) return setValue(0);
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / ms, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

const GUIDANCE = [
  {
    h: "Act fast",
    b: "Contact your bank or payment provider immediately if you sent money. Ask whether the payment can be reversed.",
  },
  {
    h: "Say it right",
    b: "Your report gathers the details you entered so you can explain them when you contact your bank.",
  },
  {
    h: "Keep proof",
    b: "Save any messages, receipts, and account notices you still have.",
  },
];

export function RecoverySummary({
  assets,
  money,
  onExport,
}: {
  assets: Asset[];
  money: MoneyResult | null;
  onExport: () => void;
}) {
  const secured = assets.filter((a) => a.status === "locked").length;
  const exampleAmount = money?.totalAtRisk ?? 0;

  // Damage prevented = money UNDO put within reach of recovery if the plan is
  // acted on: balance in exposed accounts (freeze), flagged transfers (dispute),
  // and a year of suspicious autopay (cancel). Honest framing: "if you act now".
  const balanceExposed = money?.balanceExposed ?? 0;
  const recurringYear = Math.round((money?.recurringAtRisk ?? 0) * 12 * 100) / 100;
  const damagePrevented = Math.round(balanceExposed + exampleAmount + recurringYear);
  const prevented = useCountUp(damagePrevented);

  const checklist = [
    { label: "Message reviewed", done: true },
    { label: "Exposure questions completed", done: true },
    { label: `${secured} account${secured === 1 ? "" : "s"} marked secured by you`, done: secured > 0 },
    { label: "Example transactions reviewed", done: !!money },
    { label: "Incident recorded", done: true },
  ];

  return (
    <div>
      <div className="label mb-4 flex items-center gap-2 text-red">
        <span className="inline-block h-3 w-1.5 bg-red" />
        Status — review complete
      </div>

      <h1 className="text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl">
        Review{" "}
        <span className="inline-block bg-red px-3 pb-1 text-bg">
          complete.
        </span>
      </h1>
      <p className="mt-5 text-lg text-muted">
        Here is what you recorded. Contact your providers to confirm any real account changes.
      </p>

      {damagePrevented > 0 && (
        <div className="mt-8 border-2 border-ink bg-ink p-6 text-bg">
          <div className="label text-bg/70">Damage within reach of recovery</div>
          <div className="mt-1 text-5xl font-black tabular-nums sm:text-6xl">
            ${prevented.toLocaleString()}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {balanceExposed > 0 && (
              <span className="label text-bg/70">
                ${balanceExposed.toLocaleString()} to freeze
              </span>
            )}
            {exampleAmount > 0 && (
              <span className="label text-bg/70">
                ${exampleAmount.toLocaleString()} to dispute
              </span>
            )}
            {recurringYear > 0 && (
              <span className="label text-bg/70">
                ${recurringYear.toLocaleString()}/yr autopay to cancel
              </span>
            )}
          </div>
          <p className="label mt-3 text-bg/60">
            If you act on the freeze order now. Demo or sandbox figures.
          </p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 border-2 border-ink">
        <div className="border-r border-ink p-6">
          <div className="text-4xl font-black tabular-nums text-red">
            ${exampleAmount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>
          <div className="label mt-1 text-muted">example amount flagged</div>
        </div>
        <div className="p-6">
          <div className="text-4xl font-black tabular-nums">
            {secured}
          </div>
          <div className="label mt-1 text-muted">accounts you marked secured</div>
        </div>
      </div>

      <ul className="mt-6">
        {checklist.map((c, i) => (
          <li
            key={c.label}
            className="flex items-center gap-5 border-b border-line py-3.5"
          >
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center border border-ink text-xs ${c.done ? "bg-ink text-bg" : "text-ink"}`}
            >
              {c.done ? "✓" : ""}
            </span>
            <span className="label w-6 text-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-bold">{c.label}</span>
          </li>
        ))}
      </ul>

      <Button size="lg" className="mt-8 w-full" onClick={onExport}>
        ⬇ Download incident report
      </Button>
      <p className="label mt-3 text-center text-muted">
        Review the example data before sharing this report
      </p>

      <div className="mt-10 grid border-2 border-ink sm:grid-cols-3">
        {GUIDANCE.map((g, i) => (
          <div
            key={g.h}
            className={`p-6 ${i < GUIDANCE.length - 1 ? "border-b border-ink sm:border-b-0 sm:border-r" : ""}`}
          >
            <div className="label text-red">{g.h}</div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{g.b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
