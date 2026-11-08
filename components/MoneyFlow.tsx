import type { MoneyResult } from "@/app/_client/types";

function money(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

/**
 * Money-mule graph: how the flagged transfer moves out of reach. The first
 * hop(s) are live when a Nessie account is wired; downstream hops are a model
 * of a typical laundering path and are labeled as such — never shown as real.
 */
export function MoneyFlow({ money: result }: { money: MoneyResult }) {
  const flow = result.flow ?? [];
  if (flow.length === 0) return null;

  const nodes = [flow[0].from, ...flow.map((h) => h.to)];
  return (
    <div className="mt-8">
      <div className="label mb-3 flex items-center gap-2 text-red">
        <span className="inline-block h-3 w-1.5 bg-red" />
        Illustrative fund flow — what could happen next
      </div>

      <div className="border-2 border-ink">
        {flow.map((hop, i) => {
          const isLast = i === flow.length - 1;
          return (
            <div key={i} className="relative">
              {/* node */}
              <div className="flex items-center gap-3 px-4 py-3">
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center border-2 text-xs font-black tabular-nums ${
                    i === 0 ? "border-ink" : "border-red text-red"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-lg font-bold">{nodes[i]}</div>
                </div>
              </div>

              {/* edge */}
              <div className="flex items-stretch">
                <div className="flex w-7 shrink-0 justify-center pl-4">
                  <span className="w-0.5 bg-red" />
                </div>
                <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1 px-3 pb-3 pl-6">
                  <span className="font-mono text-base font-bold tabular-nums text-red">
                    {money(hop.amount)}
                  </span>
                  <span className="label text-muted">via {hop.medium}</span>
                  {hop.live ? (
                    <span className="border border-ink px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      live
                    </span>
                  ) : (
                    <span className="border border-red px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red">
                      modeled
                    </span>
                  )}
                  {hop.final && (
                    <span className="label font-bold text-red">
                      ⚑ example cash-out
                    </span>
                  )}
                </div>
              </div>

              {/* final node */}
              {isLast && (
                <div className="flex items-center gap-3 border-t-2 border-ink bg-surface-2 px-4 py-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center border-2 border-red text-xs font-black tabular-nums text-red">
                    {flow.length + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-lg font-bold text-red">
                      {nodes[nodes.length - 1]}
                    </div>
                    <div className="label text-muted">exit point</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="label text-muted">
          This entire path is a modeled illustration, not observed transfers.
        </p>
      </div>
    </div>
  );
}
