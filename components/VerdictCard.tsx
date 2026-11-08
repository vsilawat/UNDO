import type { Incident } from "@/app/_client/types";
import { Card } from "./ui";

function confidenceBand(c: number): "low" | "medium" | "high" {
  if (c < 0.6) return "low";
  if (c < 0.85) return "medium";
  return "high";
}

// Segmented meter: ▮▮▮▮▮▮▮▮▯▯ style, 10 cells.
function Meter({ pct, color }: { pct: number; color: string }) {
  const filled = Math.round(pct / 10);
  return (
    <span className="tracking-tight">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className={i < filled ? color : "text-border"}>
          ▮
        </span>
      ))}
    </span>
  );
}

export function VerdictCard({ incident }: { incident: Incident }) {
  const pct = Math.round(incident.confidence * 100);
  const band = confidenceBand(incident.confidence);

  const header = !incident.isScam
    ? { tag: "CLEAR", tone: "text-ok", meter: "text-ok", level: "NO THREAT" }
    : band === "low"
      ? { tag: "UNVERIFIED", tone: "text-warn", meter: "text-warn", level: "ELEVATED" }
      : { tag: "CRIT", tone: "text-crit", meter: "text-crit", level: "CONFIRMED THREAT" };

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="text-xs tracking-widest text-muted">THREAT</span>
        <span
          className={`border px-2 py-0.5 text-xs font-bold tracking-widest ${header.tone} border-current`}
        >
          {header.tag}
        </span>
      </div>

      <div className="mt-3 font-bold">
        <div className="text-xs tracking-widest text-muted">{header.level}</div>
        <div className={`mt-1 text-xl uppercase ${header.tone}`}>
          &gt; {incident.isScam ? incident.scamType.replace(/ /g, "_") : "none"}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-sm">
        <span className="text-muted">confidence</span>
        <span className="font-bold">{incident.confidence.toFixed(2)}</span>
        <Meter pct={pct} color={header.meter} />
      </div>

      {band === "low" && incident.isScam && (
        <p className="mt-3 border border-warn/30 bg-warn/10 p-3 text-sm text-warn">
          ⚠ LOW CONFIDENCE — treat as hostile. Do not reply, do not click. Call
          your bank directly.
        </p>
      )}

      <div className="mt-4 border border-border bg-surface-2 p-3 text-sm">
        <span className="text-xs tracking-widest text-muted">
          PAYLOAD (scrubbed)
        </span>
        <p className="mt-1 text-muted">{incident.scrubbedMessage}</p>
        <p className="mt-1 text-xs text-info">
          // PII stripped before analysis — privacy by design
        </p>
      </div>

      {incident.redFlags.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs tracking-widest text-muted">INDICATORS</h3>
          <ul className="mt-2 space-y-1.5">
            {incident.redFlags.map((f, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-crit">▲</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-xs tracking-widest text-muted">RESPONSE</h3>
        <ol className="mt-2 space-y-1.5">
          {incident.nextSteps.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="font-bold text-warn">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}
