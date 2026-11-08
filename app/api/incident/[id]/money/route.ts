import { NextResponse } from "next/server";
import { getRecord, note, saveRecord } from "@/lib/store";
import { getAccounts, getBills, getTransactions, traceMoney } from "@/lib/nessie";
import { isScopeAction } from "@/lib/scope";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const record = getRecord((await params).id);
  if (!record) return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  const legacy = !record.reportedActions;
  record.reportedActions ??= record.events
    .map((event) => event.text.replace(/^You reported: /, "").replaceAll(" ", "_"))
    .filter(isScopeAction);
  if (!record.money || legacy) {
    try {
      const sentMoney = record.reportedActions.includes("sent_money");
      const [transactions, bills, accounts] = await Promise.all([
        getTransactions(),
        getBills(),
        getAccounts(),
      ]);
      record.money = traceMoney(transactions, {
        message: record.incident.scrubbedMessage,
        sentMoney,
        bills,
        accounts,
      });
      note(record, `Example transaction candidates calculated: $${record.money.totalAtRisk.toFixed(2)} flagged in test data`);
      saveRecord(record);
    } catch {
      return NextResponse.json({ error: "Could not load Nessie transactions" }, { status: 502 });
    }
  }
  return NextResponse.json(record.money);
}
