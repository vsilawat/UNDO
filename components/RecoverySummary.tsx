import type { Asset, MoneyResult } from "@/app/_client/types";
import { Button } from "./ui";

const GUIDANCE = [
  {
    h: "Act fast",
    b: "Banks can recall transfers and freeze cards — but the window is measured in minutes, not days.",
  },
  {
    h: "Say it right",
    b: "Your report has the exact wording that opens a fraud claim, so you don't freeze up on the phone.",
  },
  {
    h: "Keep proof",
    b: "Every step is logged so you know what to screenshot and save before it disappears.",
  },
];

export function RecoverySummary({
  assets,
  money,
  onExport,
}: {
  assets: Asset[];
  money: MoneyResult | null;
  onExport: () => void;
}) {
  const locked = assets.filter((a) => a.status === "locked").length;
  const handled = assets.filter(
    (a) => a.status === "locked" || a.status === "safe",
  ).length;
  const protectedAmt = money?.totalAtRisk ?? 0;

  const checklist = [
    "Threat identified",
    "Exposure checked",
    `${locked} account${locked === 1 ? "" : "s"} locked`,
    "Money traced",
    "Incident recorded",
  ];

  return (
    <div>
      <div className="label mb-4 flex items-center gap-2 text-red">
        <span className="inline-block h-3 w-1.5 bg-red" />
        Status — contained
      </div>

      <h1 className="text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl">
        You{" "}
        <span className="inline-block bg-red px-3 pb-1 text-bg">
          contained it.
        </span>
      </h1>
      <p className="mt-5 text-lg text-muted">
        You acted fast. Here&apos;s what you protected.
      </p>

      <div className="mt-8 grid grid-cols-2 border-2 border-ink">
        <div className="border-r border-ink p-6">
          <div className="text-4xl font-black tabular-nums text-red">
            ${protectedAmt.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>
          <div className="label mt-1 text-muted">money flagged</div>
        </div>
        <div className="p-6">
          <div className="text-4xl font-black tabular-nums">
            {handled}/{assets.length}
          </div>
          <div className="label mt-1 text-muted">assets handled</div>
        </div>
      </div>

      <ul className="mt-6">
        {checklist.map((c, i) => (
          <li
            key={c}
            className="flex items-center gap-5 border-b border-line py-3.5"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center border border-ink bg-ink text-xs text-bg">
              ✓
            </span>
            <span className="label w-6 text-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-bold">{c}</span>
          </li>
        ))}
      </ul>

      <Button size="lg" className="mt-8 w-full" onClick={onExport}>
        ⬇ Download incident report
      </Button>
      <p className="label mt-3 text-center text-muted">
        Keep this for your bank and the police report
      </p>

      <div className="mt-10 grid border-2 border-ink sm:grid-cols-3">
        {GUIDANCE.map((g, i) => (
          <div
            key={g.h}
            className={`p-6 ${i < GUIDANCE.length - 1 ? "border-b border-ink sm:border-b-0 sm:border-r" : ""}`}
          >
            <div className="label text-red">{g.h}</div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{g.b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
