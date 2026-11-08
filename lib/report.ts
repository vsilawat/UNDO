import type { RecordData } from "./store";

export function buildReport(record: RecordData): string {
  const { incident, assets, events, money } = record;
  return [
    "UNDO INCIDENT REPORT",
    `Incident ID: ${incident.id}`,
    `Opened: ${incident.createdAt}`,
    `Scam type: ${incident.scamType}`,
    `Confidence: ${Math.round(incident.confidence * 100)}%`,
    "",
    "MESSAGE (personal details removed)",
    incident.scrubbedMessage,
    "",
    "SCOPE",
    ...assets.map((asset) => `- ${asset.name}: ${asset.status}`),
    "",
    ...(money ? [
      `MONEY AT RISK: $${money.totalAtRisk.toFixed(2)}`,
      `Recommendation: ${money.recommendation}`,
      ...money.transactions.filter((item) => item.flagged).map((item) => `- ${item.date}: $${item.amount.toFixed(2)} to ${item.payee} (${item.reason})`),
      "",
    ] : []),
    "TIMELINE",
    ...events.map((event) => `- ${event.time}: ${event.text}`),
    "",
  ].join("\n");
}
