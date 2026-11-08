import type { Incident } from "@/app/_client/types";
import { Card } from "./ui";

function confidenceBand(c: number): "low" | "medium" | "high" {
  if (c < 0.6) return "low";
  if (c < 0.85) return "medium";
  return "high";
}

export function VerdictCard({ incident }: { incident: Incident }) {
  const pct = Math.round(incident.confidence * 100);
  const band = confidenceBand(incident.confidence);

  // Honest confidence: don't shout "SCAM" when the model is unsure.
  const header = !incident.isScam
    ? { tag: "Looks legitimate", tone: "text-safe", bar: "bg-safe" }
    : band === "low"
      ? { tag: "I'm not sure — be careful", tone: "text-risk", bar: "bg-risk" }
      : { tag: `Likely scam · ${incident.scamType}`, tone: "text-danger", bar: "bg-danger" };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={`text-xl font-black ${header.tone}`}>{header.tag}</h2>
        <span className="text-sm text-muted">Confidence {pct}%</span>
      </div>

      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className={`h-full ${header.bar} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {band === "low" && incident.isScam && (
        <p className="mt-3 rounded-lg border border-risk/30 bg-risk/10 p-3 text-sm text-risk">
          We can&apos;t be certain. When unsure, treat it as a scam: don&apos;t
          reply, don&apos;t click, call your bank directly.
        </p>
      )}

      <div className="mt-4 rounded-lg border border-border bg-surface-2 p-3 text-sm text-muted">
        <span className="font-semibold text-text">Message reviewed:</span>{" "}
        {incident.scrubbedMessage}
        <div className="mt-1 text-xs">
          Personal details were removed before analysis (privacy by design).
        </div>
      </div>

      {incident.redFlags.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-muted">Red flags</h3>
          <ul className="mt-2 space-y-1.5">
            {incident.redFlags.map((f, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-danger">▲</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-sm font-bold text-muted">What to do now</h3>
        <ol className="mt-2 space-y-1.5">
          {incident.nextSteps.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="font-bold text-brand">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}
