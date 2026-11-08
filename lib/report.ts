import type { RecordData } from "./store";

function assetStatus(status: string): string {
  if (status === "locked") return "user reported securing it outside UNDO";
  if (status === "safe") return "no exposure reported";
  if (status === "compromised") return "reported exposed";
  return "may be at risk";
}

export function buildReport(record: RecordData): string {
  const { incident, assets, events, money } = record;
  return [
    "UNDO INCIDENT REPORT",
    `Incident ID: ${incident.id}`,
    `Opened: ${incident.createdAt}`,
    `Message assessment: ${incident.isScam ? "possible scam" : "no clear scam signs found"} (${incident.scamType}; based on wording only)`,
    "",
    "MESSAGE (common personal details removed)",
    incident.scrubbedMessage,
    "",
    "SCOPE",
    ...assets.map((asset) => `- ${asset.name}: ${assetStatus(asset.status)}`),
    "",
    ...(money ? [
      "EXAMPLE TRANSACTIONS (demo or Nessie sandbox; not your bank activity)",
      `Example amount flagged for review: $${money.totalAtRisk.toFixed(2)}`,
      `Example review action: ${money.recommendation}`,
      ...money.transactions.filter((item) => item.flagged).map((item) => `- ${item.date}: $${item.amount.toFixed(2)} to ${item.payee} (${item.reason})`),
      "",
    ] : []),
    "TIMELINE",
    ...events.map((event) => `- ${event.time}: ${event.text}`),
    "",
  ].join("\n");
}
