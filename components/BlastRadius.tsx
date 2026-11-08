import type { MoneyResult } from "@/app/_client/types";
import { Card } from "./ui";

const REC_META = {
  freeze: { label: "FREEZE ACCOUNT", color: "text-crit", border: "border-crit" },
  dispute: { label: "DISPUTE CHARGES", color: "text-warn", border: "border-warn" },
  monitor: { label: "MONITOR", color: "text-ok", border: "border-ok" },
};

export function BlastRadius({ money }: { money: MoneyResult }) {
  const rec = REC_META[money.recommendation];
  return (
    <Card>
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-3">
        <div>
          <div className="text-xs tracking-widest text-muted">TOTAL AT RISK</div>
          <div className="text-3xl font-black text-crit tabular-nums">
            ${money.totalAtRisk.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className={`border px-3 py-1 text-sm font-bold tracking-widest ${rec.color} ${rec.border}`}>
          {rec.label}
        </div>
      </div>

      <table className="mt-3 w-full text-sm">
        <thead className="text-left text-xs tracking-widest text-muted">
          <tr>
            <th className="py-2">PAYEE</th>
            <th className="py-2">DATE</th>
            <th className="py-2 text-right">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {money.transactions.map((t) => (
            <tr
              key={t.id}
              className={`border-t border-border ${t.flagged ? "bg-crit/10" : ""}`}
            >
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  {t.flagged && <span className="text-crit">⚑</span>}
                  <span className="font-medium">{t.payee}</span>
                </div>
                {t.reason && (
                  <div className="mt-0.5 text-xs text-crit">// {t.reason}</div>
                )}
              </td>
              <td className="py-2.5 tabular-nums text-muted">{t.date}</td>
              <td className="py-2.5 text-right tabular-nums">
                ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-info">
        // traced via Nessie account data — flagged rows match scam pattern
      </p>
    </Card>
  );
}
