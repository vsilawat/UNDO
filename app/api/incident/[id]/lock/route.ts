import { NextResponse } from "next/server";
import { getRecord, note, saveRecord } from "@/lib/store";

export const runtime = "nodejs";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const record = getRecord((await params).id);
  if (!record) return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const name = (body as { name?: unknown } | null)?.name;
  if (typeof name !== "string") return NextResponse.json({ error: "Invalid asset" }, { status: 400 });
  const asset = record.assets.find((item) => item.name === name);
  if (!asset) return NextResponse.json({ error: "Unknown asset" }, { status: 400 });
  if (asset.status !== "locked") {
    asset.status = "locked";
    note(record, `You reported securing ${name} outside UNDO`);
    saveRecord(record);
  }
  return NextResponse.json({ assets: record.assets });
}
