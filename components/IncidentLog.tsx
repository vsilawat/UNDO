import type { LogEvent, Incident, MoneyResult, Asset } from "@/app/_client/types";
import { downloadReport, fmt } from "@/app/_client/report";
import { Card, Button } from "./ui";

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
    <Card>
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-xs font-bold tracking-widest text-muted">EVENT LOG</h3>
        {showExport && (
          <Button
            variant="ghost"
            onClick={() => downloadReport(incident, events, money, assets)}
          >
            ⬇ Export report
          </Button>
        )}
      </div>
      <ol className="space-y-2 font-mono text-sm">
        {events.map((e, i) => (
          <li key={i} className="flex gap-3">
            <span className="shrink-0 tabular-nums text-info">{fmt(e.time)}</span>
            <span className="text-border">│</span>
            <span>{e.text}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
