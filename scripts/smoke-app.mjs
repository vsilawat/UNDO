const origin = process.env.UNDO_URL || "http://localhost:3000";

async function json(path, init) {
  const response = await fetch(new URL(path, origin), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new Error(`${init?.method || "GET"} ${path} returned HTTP ${response.status}`);
  return response.json();
}

try {
  const incident = await json("/api/incident", {
    method: "POST",
    body: JSON.stringify({ message: "IRS FINAL NOTICE: Pay with gift cards within 24 hours." }),
  });
  const path = `/api/incident/${encodeURIComponent(incident.id)}`;
  const before = await json(`${path}/money`);
  if (before.totalAtRisk !== 0) throw new Error("Expected $0 before a payment is reported");

  await json(`${path}/scope`, {
    method: "PATCH",
    body: JSON.stringify({ action: "sent_money" }),
  });
  const after = await json(`${path}/money`);
  if (after.transactions.length !== 3) throw new Error(`Expected 3 Nessie payments, got ${after.transactions.length}`);
  if (!after.transactions.some((item) => item.payee === "UNDO demo gift card reseller" && item.flagged))
    throw new Error("The Nessie gift card payment was not flagged");
  if (after.transactions.some((item) => item.payee.includes("Zelle") && item.flagged))
    throw new Error("The unrelated Zelle payment was flagged");
  if (after.totalAtRisk !== 200) throw new Error(`Expected $200 flagged, got $${after.totalAtRisk}`);

  const log = await json(`${path}/log`);
  if (!log.events.some((event) => event.text === "You reported: sent money"))
    throw new Error("The payment report is missing from the incident log");
  const report = await fetch(new URL(`${path}/report`, origin));
  if (!report.ok || !(await report.text()).includes("UNDO demo gift card reseller"))
    throw new Error("The exported report is missing the Nessie payment");

  console.log("PASS: app created an incident and read 3 Nessie sandbox payments.");
  console.log("PASS: $0 flagged before reporting payment; $200 gift card payment flagged afterward.");
  console.log("PASS: unrelated Zelle payment stayed unflagged; log and report include the case.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "App check failed");
  process.exitCode = 1;
}
