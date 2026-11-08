import type { Asset, MoneyResult } from "@/app/_client/types";
import { Card, Button } from "./ui";

// Peak-End Rule: last screen = what they remember. End on control + relief.
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
    { label: "Exposure checked", done: true },
    { label: `${locked} account${locked === 1 ? "" : "s"} locked`, done: locked > 0 },
    { label: "Money traced", done: !!money },
    { label: "Incident recorded", done: true },
  ];

  return (
    <Card className="overflow-hidden shadow-[0_0_90px_-24px_rgba(74,222,155,0.45)]">
      <div className="text-center">
        <div className="text-5xl">🛡️</div>
        <h1 className="mt-3 text-3xl font-black text-ok">You contained it</h1>
        <p className="mt-1 text-muted">You acted fast. Here&apos;s what you protected.</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface-2 p-5 text-center">
          <div className="text-3xl font-black tabular-nums text-ok">
            ${protectedAmt.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>
          <div className="mt-1 text-xs uppercase tracking-wider text-muted">
            money flagged
          </div>
        </div>
        <div className="rounded-2xl bg-surface-2 p-5 text-center">
          <div className="text-3xl font-black tabular-nums text-info">
            {handled}/{assets.length}
          </div>
          <div className="mt-1 text-xs uppercase tracking-wider text-muted">
            assets handled
          </div>
        </div>
      </div>

      <ul className="mt-6 space-y-2.5">
        {checklist.map((c) => (
          <li key={c.label} className="flex items-center gap-3 text-sm">
            <span
              className={
                "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] " +
                (c.done ? "bg-ok text-[#04120b]" : "bg-surface-2 text-muted")
              }
            >
              {c.done ? "✓" : "•"}
            </span>
            <span className={c.done ? "" : "text-muted"}>{c.label}</span>
          </li>
        ))}
      </ul>

      <Button size="lg" className="mt-6 w-full" onClick={onExport}>
        ⬇ Download incident report
      </Button>
      <p className="mt-2 text-center text-xs text-muted">
        Keep this for your bank and the police report.
      </p>
    </Card>
  );
}
