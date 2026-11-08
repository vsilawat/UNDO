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
    ...(money?.accounts?.length ? [
      "SANDBOX ACCOUNT REVIEW ORDER (illustrative)",
      `Accounts touched: ${money.accountsTouched ?? 0} of ${money.accounts.length}`,
      `Sandbox balance flagged for review: $${(money.balanceExposed ?? 0).toFixed(2)}`,
      ...money.accounts.map((a) => `${a.priority}. ${a.nickname} (${a.type}) $${a.balance.toFixed(2)} - ${a.priorityReason}${a.touched ? " [FLAGGED]" : ""}`),
      "",
    ] : []),
    ...(money ? [
      "EXAMPLE TRANSACTIONS (demo or Nessie sandbox; not your bank activity)",
      `Example amount flagged for review: $${money.totalAtRisk.toFixed(2)}`,
      `Example review action: ${money.recommendation}`,
      ...money.transactions.filter((item) => item.flagged).map((item) => `- ${item.date}: $${item.amount.toFixed(2)} to ${item.payee} (${item.reason})`),
      "",
    ] : []),
    ...(money?.flow?.length ? [
      "ILLUSTRATIVE FUND FLOW (all hops and timing modeled, not observed)",
      ...money.flow.map((h) => `- ${h.from} -> ${h.to}: $${h.amount.toFixed(2)} via ${h.medium ?? "transfer"}${h.minutesAfter ? ` (+${h.minutesAfter} min)` : ""}${h.final ? " [likely unrecoverable]" : ""}`),
      "",
    ] : []),
    ...(money?.autopays?.some((b) => b.suspicious) ? [
      `RECURRING CHARGES TO VERIFY (sandbox example): $${(money.recurringAtRisk ?? 0).toFixed(2)}/mo`,
      ...money.autopays.filter((b) => b.suspicious).map((b) => `- ${b.payee} $${b.amount.toFixed(2)}/${b.cadence} set up ${b.createdAt} (${b.reason})`),
      "",
    ] : []),
    "TIMELINE",
    ...events.map((event) => `- ${event.time}: ${event.text}`),
    "",
  ].join("\n");
}
