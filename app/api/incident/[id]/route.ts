import { NextResponse } from "next/server";
import { getRecord } from "@/lib/store";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const record = getRecord((await params).id);
  return record ? NextResponse.json(record.incident) : NextResponse.json({ error: "Incident not found" }, { status: 404 });
}
