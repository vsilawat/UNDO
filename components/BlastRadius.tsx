import type { MoneyResult } from "@/app/_client/types";
import { Card } from "./ui";

const REC_META = {
  freeze: { label: "Freeze the account now", color: "text-danger" },
  dispute: { label: "Dispute these charges", color: "text-risk" },
  monitor: { label: "Monitor — no money moved yet", color: "text-safe" },
};

export function BlastRadius({ money }: { money: MoneyResult }) {
  const rec = REC_META[money.recommendation];
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm text-muted">Total at risk</div>
          <div className="text-3xl font-black text-danger">
            ${money.totalAtRisk.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className={`font-bold ${rec.color}`}>{rec.label}</div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-muted">
            <tr>
              <th className="p-3">Payee</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {money.transactions.map((t) => (
              <tr
                key={t.id}
                className={`border-t border-border ${t.flagged ? "bg-danger/10" : ""}`}
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {t.flagged && <span className="text-danger">⚑</span>}
                    <span className="font-medium">{t.payee}</span>
                  </div>
                  {t.reason && (
                    <div className="mt-0.5 text-xs text-danger">{t.reason}</div>
                  )}
                </td>
                <td className="p-3 text-muted">{t.date}</td>
                <td className="p-3 text-right font-mono">
                  ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">
        Traced via Nessie account data. Flagged rows match the scam pattern.
      </p>
    </Card>
  );
}
