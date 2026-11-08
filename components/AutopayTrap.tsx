import type { MoneyResult } from "@/app/_client/types";

function money(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

/**
 * Recurring-bill (autopay) review. Scammers plant small monthly charges that
 * drain an account long after the first hit. We flag bills set up in the
 * incident window to unfamiliar payees — and show the yearly cost if ignored.
 */
export function AutopayTrap({ money: result }: { money: MoneyResult }) {
  const bills = result.autopays ?? [];
  if (bills.length === 0) return null;
  const flagged = bills.filter((b) => b.suspicious);
  const monthly = result.recurringAtRisk ?? 0;

  return (
    <div className="mt-8">
      <div className="label mb-3 flex items-center gap-2 text-red">
        <span className="inline-block h-3 w-1.5 bg-red" />
        Recurring charges — the slow drain
      </div>

      {flagged.length > 0 && (
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-y-2 border-ink py-4">
          <div>
            <div className="label text-muted">Suspicious autopay</div>
            <div className="mt-1 text-3xl font-black tabular-nums text-red sm:text-4xl">
              {money(monthly)}<span className="text-xl">/mo</span>
            </div>
          </div>
          <div className="border-2 border-red px-4 py-2 text-xs font-bold uppercase tracking-wider text-red">
            {money(monthly * 12)}/yr if ignored
          </div>
        </div>
      )}

      <ul className="mt-2">
        {bills.map((b) => (
          <li
            key={b.id}
            className={`flex items-center justify-between gap-4 border-b border-line py-4 ${
              b.suspicious ? "bg-surface-2 px-4" : ""
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {b.suspicious && <span className="text-red">⚑</span>}
                <span className="truncate text-lg font-bold">{b.payee}</span>
              </div>
              {b.reason && <div className="mt-0.5 text-sm text-red">{b.reason}</div>}
              <div className="label mt-1 text-muted">
                {b.cadence} · set up {b.createdAt}
              </div>
            </div>
            <div
              className={`shrink-0 font-mono tabular-nums ${
                b.suspicious ? "text-lg font-bold text-red" : ""
              }`}
            >
              {money(b.amount)}
            </div>
          </li>
        ))}
      </ul>

      {flagged.length > 0 && (
        <p className="label mt-4 text-muted">
          Cancel the flagged autopay with your bank or card provider. UNDO does
          not cancel it for you.
        </p>
      )}
    </div>
  );
}
