import type { Incident } from "@/app/_client/types";

function band(c: number): "low" | "medium" | "high" {
  if (c < 0.6) return "low";
  if (c < 0.85) return "medium";
  return "high";
}

function Ring({ pct, color }: { pct: number; color: string }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - pct / 100);
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-border)" strokeWidth="10" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={off}
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.22,1,.36,1)" }}
      />
    </svg>
  );
}

export function VerdictCard({ incident }: { incident: Incident }) {
  const pct = Math.round(incident.confidence * 100);
  const b = band(incident.confidence);

  const theme = !incident.isScam
    ? { label: "Looks legitimate", color: "var(--color-ok)", tw: "text-ok", glow: "shadow-[0_0_80px_-20px_rgba(74,222,155,0.5)]" }
    : b === "low"
      ? { label: "Possibly a scam", color: "var(--color-warn)", tw: "text-warn", glow: "shadow-[0_0_80px_-20px_rgba(255,193,77,0.5)]" }
      : { label: "This is a scam", color: "var(--color-crit)", tw: "text-crit", glow: "shadow-[0_0_80px_-20px_rgba(255,77,94,0.6)]" };

  return (
    <div className={`card overflow-hidden ${theme.glow}`}>
      {/* hero */}
      <div className="flex items-center gap-6 p-6">
        <div className="relative grid place-items-center">
          <Ring pct={pct} color={theme.color} />
          <div className="absolute text-center">
            <div className={`text-2xl font-black ${theme.tw}`}>{pct}%</div>
            <div className="text-[10px] uppercase tracking-wider text-muted">sure</div>
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted">
            Verdict
          </div>
          <h1 className={`mt-1 text-3xl font-black leading-tight ${theme.tw}`}>
            {theme.label}
          </h1>
          {incident.isScam && (
            <div className="mt-1 text-sm text-muted">{incident.scamType}</div>
          )}
        </div>
      </div>

      <div className="space-y-5 border-t border-border p-6">
        {b === "low" && incident.isScam && (
          <div className="rounded-xl border border-warn/25 bg-warn/10 p-3 text-sm text-warn">
            We&apos;re not fully sure — so treat it as a scam. Don&apos;t reply or
            click. Call your bank directly.
          </div>
        )}

        <div className="rounded-xl bg-surface-2 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">
            The message
          </div>
          <p className="mono mt-1.5 text-sm leading-relaxed text-text/90">
            {incident.scrubbedMessage}
          </p>
          <p className="mt-2 text-xs text-info">
            Personal details removed before analysis — privacy by design.
          </p>
        </div>

        {incident.redFlags.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Why we flagged it
            </div>
            <div className="flex flex-wrap gap-2">
              {incident.redFlags.map((f, i) => (
                <span
                  key={i}
                  className="rounded-full border border-crit/25 bg-crit/10 px-3 py-1.5 text-xs text-crit"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            What to do now
          </div>
          <ol className="space-y-2">
            {incident.nextSteps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-elevated text-[11px] font-bold text-warn">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
