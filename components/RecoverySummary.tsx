import type { Asset, MoneyResult } from "@/app/_client/types";
import { Card, Button } from "./ui";

// Peak-End Rule: the last screen is what they'll remember. End on control
// and relief, not a raw log. Zeigarnik: the checklist closes the open loop.
export function RecoverySummary({
  assets,
  money,
  onExport,
}: {
  assets: Asset[];
  money: MoneyResult | null;
  onExport: () => void;
}) {
  const locked = assets.filter((a) => a.status === "locked").length;
  const handled = assets.filter(
    (a) => a.status === "locked" || a.status === "safe",
  ).length;
  const protectedAmt = money?.totalAtRisk ?? 0;

  const checklist = [
    { label: "Threat identified", done: true },
    { label: "Exposure triaged", done: true },
    { label: `${locked} account${locked === 1 ? "" : "s"} locked`, done: locked > 0 },
    { label: "Money traced", done: !!money },
    { label: "Incident recorded", done: true },
  ];

  return (
    <Card>
      <div className="text-center">
        <div className="text-5xl">🛡️</div>
        <h2 className="mt-3 text-2xl font-black uppercase tracking-wide text-ok">
          Contained
        </h2>
        <p className="mt-1 text-muted">
          You acted fast. Here&apos;s what you protected.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="border border-border bg-surface-2 p-4 text-center">
          <div className="text-3xl font-black tabular-nums text-ok">
            ${protectedAmt.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>
          <div className="mt-1 text-xs tracking-widest text-muted">
            MONEY FLAGGED
          </div>
        </div>
        <div className="border border-border bg-surface-2 p-4 text-center">
          <div className="text-3xl font-black tabular-nums text-info">
            {handled}/{assets.length}
          </div>
          <div className="mt-1 text-xs tracking-widest text-muted">
            ASSETS HANDLED
          </div>
        </div>
      </div>

      <ul className="mt-6 space-y-2">
        {checklist.map((c) => (
          <li key={c.label} className="flex items-center gap-3 text-sm">
            <span
              className={
                "grid h-5 w-5 place-items-center text-[11px] " +
                (c.done ? "bg-ok text-[#04120b]" : "border border-border text-muted")
              }
            >
              {c.done ? "✓" : ""}
            </span>
            <span className={c.done ? "" : "text-muted"}>{c.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Button className="w-full" onClick={onExport}>
          ⬇ Download incident report
        </Button>
        <p className="mt-2 text-center text-xs text-muted">
          Keep this for your bank and the police report.
        </p>
      </div>
    </Card>
  );
}
