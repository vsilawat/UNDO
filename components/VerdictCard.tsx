import type { Incident } from "@/app/_client/types";

function band(c: number): "low" | "medium" | "high" {
  if (c < 0.6) return "low";
  if (c < 0.85) return "medium";
  return "high";
}

export function VerdictCard({ incident }: { incident: Incident }) {
  const b = band(incident.confidence);

  const v = !incident.isScam
    ? { line1: "No clear", line2: "scam signs", hl: false }
    : b === "low"
      ? { line1: "Possibly", line2: "a scam", hl: true }
      : { line1: "Likely", line2: "a scam", hl: true };
  const signal = !incident.isScam
    ? "Routine wording"
    : b === "low"
      ? "Uncertain"
      : "Strong signs";

  return (
    <div>
      <div className="label mb-4 flex items-center gap-2 text-red">
        <span className="inline-block h-3 w-1.5 bg-red" />
        Message check — based on wording only
      </div>

      <h1 className="text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl">
        {v.line1}{" "}
        {v.hl ? (
          <span className="inline-block bg-red px-3 pb-1 text-bg">
            {v.line2}.
          </span>
        ) : (
          <span>{v.line2}.</span>
        )}
      </h1>

      <div className="mt-6 flex items-stretch border-y-2 border-ink">
        <div className="border-r border-ink py-4 pr-6">
          <div className="text-2xl font-black">{signal}</div>
          <div className="label text-muted">message signals</div>
        </div>
        <div className="flex-1 py-4 pl-6">
          <div className="text-xl font-bold">
            {incident.isScam ? incident.scamType : "Sender not verified"}
          </div>
          <div className="label mt-1 text-muted">classification</div>
        </div>
      </div>

      {b === "low" && incident.isScam && (
        <p className="mt-6 border-l-4 border-red bg-surface-2 p-4 text-sm">
          This check is uncertain. Don&apos;t reply or click. Contact the
          organization through a number or website you already trust.
        </p>
      )}

      <div className="mt-8">
        <div className="label dashed pb-2 text-muted">The message</div>
        <p className="mt-4 font-mono text-sm leading-relaxed">
          {incident.scrubbedMessage}
        </p>
        <p className="label mt-3 text-muted">
          Common personal details are removed from the saved message
        </p>
      </div>

      {incident.redFlags.length > 0 && (
        <div className="mt-8">
          <div className="label dashed pb-2 text-muted">Why we flagged it</div>
          <ul className="mt-2">
            {incident.redFlags.map((f, i) => (
              <li
                key={i}
                className="flex items-center gap-5 border-b border-line py-4"
              >
                <span className="label w-6 shrink-0 text-red">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-lg font-bold">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <div className="label dashed pb-2 text-muted">What to do now</div>
        <ol className="mt-2">
          {incident.nextSteps.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-5 border-b border-line py-4"
            >
              <span className="label w-6 shrink-0 text-red">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-medium">{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
