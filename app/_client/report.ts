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
    const recurringYear = Math.round((money.recurringAtRisk ?? 0) * 12 * 100) / 100;
    const damagePrevented = Math.round((money.balanceExposed ?? 0) + money.totalAtRisk + recurringYear);
    if (damagePrevented > 0) {
      lines.push(
        `DAMAGE WITHIN REACH OF RECOVERY (if you act on the freeze order now): $${damagePrevented.toLocaleString()}`,
        `  = $${(money.balanceExposed ?? 0).toFixed(2)} to freeze + $${money.totalAtRisk.toFixed(2)} to dispute + $${recurringYear.toFixed(2)}/yr autopay to cancel`,
        ``,
      );
    }
    if (money.accounts?.length) {
      lines.push(
        `FREEZE ORDER — TRIAGE QUEUE (demo or Nessie sandbox balances):`,
        `Accounts touched: ${money.accountsTouched ?? 0} of ${money.accounts.length}`,
        `Balance in exposed accounts: $${(money.balanceExposed ?? 0).toFixed(2)}`,
        ...money.accounts.map(
          (a) => `  ${a.priority}. ${a.nickname} (${a.type}) $${a.balance.toFixed(2)} — ${a.priorityReason}; ~${a.drainMinutes} min to drain${a.touched ? " [FLAGGED]" : ""}`,
        ),
        ``,
      );
    }
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
    if (money.flow?.length) {
      lines.push(
        `FUND-FLOW TRACE (${money.flowModeled ? "downstream hops modeled, not live" : "first hops live"}):`,
        ...money.flow.map(
          (h) =>
            `  - ${h.from} → ${h.to}  $${h.amount.toFixed(2)} via ${h.medium ?? "transfer"}${h.minutesAfter ? ` (+${h.minutesAfter} min)` : ""}${h.final ? " [likely unrecoverable]" : ""}`,
        ),
        ``,
      );
    }
    if (money.autopays?.some((b) => b.suspicious)) {
      lines.push(
        `RECURRING CHARGES (suspicious autopay): $${(money.recurringAtRisk ?? 0).toFixed(2)}/mo`,
        ...money.autopays
          .filter((b) => b.suspicious)
          .map((b) => `  - ${b.payee} $${b.amount.toFixed(2)}/${b.cadence} set up ${b.createdAt} (${b.reason || "flagged"})`),
        ``,
      );
    }
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
