import type { LogEvent, Incident, MoneyResult, Asset } from "@/app/_client/types";
import { downloadReport, fmt } from "@/app/_client/report";
import { Button } from "./ui";

export function IncidentLog({
  incident,
  events,
  money,
  assets,
  showExport = true,
}: {
  incident: Incident;
  events: LogEvent[];
  money: MoneyResult | null;
  assets: Asset[];
  showExport?: boolean;
}) {
  return (
    <div className="border border-ink bg-surface p-5">
      <div className="label dashed flex items-center justify-between pb-2 text-muted">
        <span>Event log</span>
        {showExport && (
          <button
            onClick={() => downloadReport(incident, events, money, assets)}
            className="text-red hover:underline"
          >
            ⬇ Export report
          </button>
        )}
      </div>
      <ol className="mt-3 space-y-2 font-mono text-sm">
        {events.map((e, i) => (
          <li key={i} className="flex gap-3">
            <span className="shrink-0 tabular-nums text-red">{fmt(e.time)}</span>
            <span className="text-line">│</span>
            <span>{e.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
