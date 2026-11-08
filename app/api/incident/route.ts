import { NextResponse } from "next/server";
import { classify } from "@/lib/classify";
import { scrub } from "@/lib/scrub";
import { createRecord } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const message = (body as { message?: unknown } | null)?.message;
  if (typeof message !== "string" || !message.trim() || message.length > 10000)
    return NextResponse.json({ error: "Message must be 1–10000 characters" }, { status: 400 });
  const scrubbedMessage = scrub(message.trim());
  const record = createRecord({ scrubbedMessage, ...classify(scrubbedMessage) });
  return NextResponse.json(record.incident, { status: 201 });
}
