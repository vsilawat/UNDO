import type { MoneyResult } from "@/app/_client/types";

function money(n: number) {
  const neg = n < 0;
  const s = `$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  return neg ? `−${s}` : s;
}

/**
 * Freeze-order triage queue. UNDO ranks every account by money-at-risk × how
 * fast it can leave (flagged accounts first), so the victim gets an ordered
 * "freeze this first" playbook instead of a flat list. Nessie only supplies the
 * balances — the triage logic is ours.
 */
export function AccountExposure({ money: result }: { money: MoneyResult }) {
  const accounts = result.accounts ?? [];
  if (accounts.length === 0) return null;
  const touched = result.accountsTouched ?? 0;
  const exposed = result.balanceExposed ?? 0;
  const first = accounts[0];

  return (
    <div className="mt-8">
      <div className="label mb-3 flex items-center gap-2 text-red">
        <span className="inline-block h-3 w-1.5 bg-red" />
        Freeze order — triage queue
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-y-2 border-ink py-4">
        <div className="min-w-0">
          <div className="label text-muted">Balance in exposed accounts</div>
          <div className="mt-1 text-3xl font-black tabular-nums text-red sm:text-4xl">
            {money(exposed)}
          </div>
        </div>
        <div className="border-2 border-ink px-4 py-2 text-xs font-bold uppercase tracking-wider">
          {touched} of {accounts.length} touched
        </div>
      </div>

      {/* Headline directive — the one action to take right now. */}
      <div className="mt-4 border-l-4 border-red bg-surface-2 p-4">
        <div className="label text-muted">Do this first</div>
        <div className="mt-1 text-xl font-black">
          Freeze {first.nickname}
        </div>
        <div className="label mt-1 text-muted">
          {first.priorityReason} · ~{first.drainMinutes} min to drain
        </div>
      </div>

      <ol className="mt-2">
        {accounts.map((a) => (
          <li
            key={a.id}
            className={`flex items-center gap-4 border-b border-line py-4 ${
              a.touched ? "bg-surface-2 px-4" : ""
            }`}
          >
            <span
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center border-2 text-base font-black tabular-nums ${
                a.priority === 1 ? "border-red bg-red text-bg" : "border-ink"
              }`}
            >
              {a.priority}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {a.touched && <span className="text-red">⚑</span>}
                <span className="truncate text-lg font-bold">{a.nickname}</span>
              </div>
              <div className="label mt-0.5 text-red">{a.priorityReason}</div>
              <div className="label mt-0.5 text-muted">
                {a.type} · ~{a.drainMinutes} min to drain
              </div>
            </div>
            <div
              className={`shrink-0 font-mono tabular-nums ${
                a.touched ? "text-lg font-bold text-red" : ""
              }`}
            >
              {money(a.balance)}
            </div>
          </li>
        ))}
      </ol>
      <p className="label mt-4 text-muted">
        Ranked by money at risk and how fast it can leave. Demo or Nessie
        sandbox balances — freeze with your bank in this order.
      </p>
    </div>
  );
}
