import { NextResponse } from "next/server";
import { getRecord, note, saveRecord } from "@/lib/store";
import { getTransactions, traceMoney } from "@/lib/nessie";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const record = getRecord((await params).id);
  if (!record) return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  if (!record.money) {
    try {
      record.money = traceMoney(await getTransactions());
      note(record, `Example transaction review completed: $${record.money.totalAtRisk.toFixed(2)} flagged in test data`);
      saveRecord(record);
    } catch {
      return NextResponse.json({ error: "Could not load Nessie transactions" }, { status: 502 });
    }
  }
  return NextResponse.json(record.money);
}
