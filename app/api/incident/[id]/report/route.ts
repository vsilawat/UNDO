import { getRecord } from "@/lib/store";
import { buildReport } from "@/lib/report";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const record = getRecord((await params).id);
  if (!record) return new Response("Incident not found", { status: 404 });
  return new Response(buildReport(record), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename="undo-incident-${record.incident.id}.txt"` },
  });
}
