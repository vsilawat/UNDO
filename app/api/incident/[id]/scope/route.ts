import { NextResponse } from "next/server";
import { getRecord, note, saveRecord } from "@/lib/store";
import { applyScope, isScopeAction } from "@/lib/scope";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const record = getRecord((await params).id);
  return record ? NextResponse.json({ assets: record.assets }) : NextResponse.json({ error: "Incident not found" }, { status: 404 });
}

export async function PATCH(request: Request, { params }: Context) {
  const record = getRecord((await params).id);
  if (!record) return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const action = (body as { action?: unknown } | null)?.action;
  if (!isScopeAction(action)) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  record.assets = applyScope(record.assets, action);
  note(record, `You reported: ${action.replaceAll("_", " ")}`);
  saveRecord(record);
  return NextResponse.json({ assets: record.assets });
}
