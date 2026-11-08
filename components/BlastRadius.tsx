import type { MoneyResult } from "@/app/_client/types";

const REC = {
  freeze: "Freeze the account",
  dispute: "Dispute these charges",
  monitor: "Monitor",
};

export function BlastRadius({ money }: { money: MoneyResult }) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-y-2 border-ink py-4">
        <div className="min-w-0">
          <div className="label text-muted">Example amount flagged</div>
          <div className="mt-1 text-4xl font-black tabular-nums text-red sm:text-5xl">
            ${money.totalAtRisk.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="border-2 border-red px-4 py-2 text-xs font-bold uppercase tracking-wider text-red">
          Example action: {REC[money.recommendation]}
        </div>
      </div>

      <ul className="mt-2">
        {money.transactions.map((t) => (
          <li
            key={t.id}
            className={`flex items-center justify-between gap-4 border-b border-line py-4 ${t.flagged ? "bg-surface-2 px-4" : ""}`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {t.flagged && <span className="text-red">⚑</span>}
                <span className="truncate text-lg font-bold">{t.payee}</span>
              </div>
              {t.reason && <div className="mt-0.5 text-sm text-red">{t.reason}</div>}
              <div className="label mt-1 text-muted">{t.date}</div>
            </div>
            <div
              className={`shrink-0 font-mono tabular-nums ${t.flagged ? "text-lg font-bold text-red" : ""}`}
            >
              ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </li>
        ))}
      </ul>
      <p className="label mt-4 text-muted">
        Example or sandbox transactions only. These are not your bank activity.
      </p>
    </div>
  );
}
