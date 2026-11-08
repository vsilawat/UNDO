import type { MoneyResult } from "@/app/_client/types";
import { Card } from "./ui";

const REC = {
  freeze: { label: "Freeze the account", tw: "text-crit bg-crit/10 border-crit/25" },
  dispute: { label: "Dispute these charges", tw: "text-warn bg-warn/10 border-warn/25" },
  monitor: { label: "Monitor", tw: "text-ok bg-ok/10 border-ok/25" },
};

export function BlastRadius({ money }: { money: MoneyResult }) {
  const rec = REC[money.recommendation];
  return (
    <Card className="!p-0">
      <div className="flex flex-wrap items-end justify-between gap-3 p-6">
        <div>
          <div className="text-sm text-muted">Total at risk</div>
          <div className="mt-0.5 text-4xl font-black tabular-nums text-crit">
            ${money.totalAtRisk.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className={`rounded-full border px-4 py-2 text-sm font-semibold ${rec.tw}`}>
          {rec.label}
        </div>
      </div>

      <div className="divide-y divide-border border-t border-border">
        {money.transactions.map((t) => (
          <div
            key={t.id}
            className={`flex items-center justify-between gap-3 px-6 py-3.5 ${t.flagged ? "bg-crit/[0.06]" : ""}`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {t.flagged && <span className="text-crit">⚑</span>}
                <span className="truncate font-medium">{t.payee}</span>
              </div>
              {t.reason && <div className="mt-0.5 text-xs text-crit">{t.reason}</div>}
              <div className="mono mt-0.5 text-xs text-muted">{t.date}</div>
            </div>
            <div
              className={`mono shrink-0 tabular-nums ${t.flagged ? "font-bold text-crit" : "text-text"}`}
            >
              ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>
      <p className="px-6 py-3 text-xs text-info">
        Traced via Nessie account data. Flagged rows match the scam pattern.
      </p>
    </Card>
  );
}
