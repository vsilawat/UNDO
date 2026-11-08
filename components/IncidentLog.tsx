import type { LogEvent, Incident, MoneyResult, Asset } from "@/app/_client/types";
import { Card, Button } from "./ui";

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return iso;
  }
}

function buildReport(
  incident: Incident,
  events: LogEvent[],
  money: MoneyResult | null,
  assets: Asset[],
): string {
  const lines = [
    `UNDO INCIDENT REPORT`,
    `Incident ID: ${incident.id}`,
    `Opened: ${incident.createdAt}`,
    `Scam type: ${incident.scamType} (confidence ${Math.round(incident.confidence * 100)}%)`,
    ``,
    `MESSAGE (personal details removed):`,
    incident.scrubbedMessage,
    ``,
    `SCOPE OF COMPROMISE:`,
    ...assets.map((a) => `  - ${a.name}: ${a.status}`),
    ``,
  ];
  if (money) {
    lines.push(`MONEY AT RISK: $${money.totalAtRisk.toFixed(2)} — recommendation: ${money.recommendation}`);
    money.transactions.filter((t) => t.flagged).forEach((t) =>
      lines.push(`  - ${t.date} ${t.payee} $${t.amount.toFixed(2)} (${t.reason || "flagged"})`),
    );
    lines.push(``);
  }
  lines.push(`TIMELINE:`);
  events.forEach((e) => lines.push(`  ${fmt(e.time)}  ${e.text}`));
  return lines.join("\n");
}

export function IncidentLog({
  incident,
  events,
  money,
  assets,
}: {
  incident: Incident;
  events: LogEvent[];
  money: MoneyResult | null;
  assets: Asset[];
}) {
  const download = () => {
    const text = buildReport(incident, events, money, assets);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `undo-incident-${incident.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-xs font-bold tracking-widest text-muted">
          EVENT LOG
        </h3>
        <Button variant="ghost" onClick={download}>
          ⬇ Export report
        </Button>
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
