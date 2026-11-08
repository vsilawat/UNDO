import type { Incident, LogEvent, MoneyResult, Asset } from "./types";

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function buildReport(
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
    lines.push(
      `MONEY AT RISK: $${money.totalAtRisk.toFixed(2)} — recommendation: ${money.recommendation}`,
    );
    money.transactions
      .filter((t) => t.flagged)
      .forEach((t) =>
        lines.push(
          `  - ${t.date} ${t.payee} $${t.amount.toFixed(2)} (${t.reason || "flagged"})`,
        ),
      );
    lines.push(``);
  }
  lines.push(`TIMELINE:`);
  events.forEach((e) => lines.push(`  ${fmt(e.time)}  ${e.text}`));
  return lines.join("\n");
}

export function downloadReport(
  incident: Incident,
  events: LogEvent[],
  money: MoneyResult | null,
  assets: Asset[],
) {
  const text = buildReport(incident, events, money, assets);
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `undo-incident-${incident.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export { fmt };
