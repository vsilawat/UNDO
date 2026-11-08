import type { Incident, LogEvent, MoneyResult, Asset } from "./types";

function assetStatus(asset: Asset): string {
  if (asset.status === "locked") return "user reported securing it outside UNDO";
  if (asset.status === "safe") return "no exposure reported";
  if (asset.status === "compromised") return "reported exposed";
  return "may be at risk";
}

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
    `Message assessment: ${incident.isScam ? "possible scam" : "no clear scam signs found"} (${incident.scamType}; based on wording only)`,
    ``,
    `MESSAGE (common personal details removed):`,
    incident.scrubbedMessage,
    ``,
    `SCOPE OF COMPROMISE:`,
    ...assets.map((a) => `  - ${a.name}: ${assetStatus(a)}`),
    ``,
  ];
  if (money) {
    lines.push(
      `EXAMPLE TRANSACTIONS (demo or Nessie sandbox; not your bank activity):`,
      `Example amount flagged for review: $${money.totalAtRisk.toFixed(2)}`,
      `Example review action: ${money.recommendation}`,
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
