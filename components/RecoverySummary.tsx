import type { Asset, MoneyResult } from "@/app/_client/types";
import { Button } from "./ui";

const GUIDANCE = [
  {
    h: "Act fast",
    b: "Contact your bank or payment provider immediately if you sent money. Ask whether the payment can be reversed.",
  },
  {
    h: "Say it right",
    b: "Your report gathers the details you entered so you can explain them when you contact your bank.",
  },
  {
    h: "Keep proof",
    b: "Save any messages, receipts, and account notices you still have.",
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
  const secured = assets.filter((a) => a.status === "locked").length;
  const exampleAmount = money?.totalAtRisk ?? 0;

  const checklist = [
    { label: "Message reviewed", done: true },
    { label: "Exposure questions completed", done: true },
    { label: `${secured} account${secured === 1 ? "" : "s"} marked secured by you`, done: secured > 0 },
    { label: "Example transactions reviewed", done: !!money },
    { label: "Incident recorded", done: true },
  ];

  return (
    <div>
      <div className="label mb-4 flex items-center gap-2 text-red">
        <span className="inline-block h-3 w-1.5 bg-red" />
        Status — review complete
      </div>

      <h1 className="text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl">
        Review{" "}
        <span className="inline-block bg-red px-3 pb-1 text-bg">
          complete.
        </span>
      </h1>
      <p className="mt-5 text-lg text-muted">
        Here is what you recorded. Contact your providers to confirm any real account changes.
      </p>

      <div className="mt-8 grid grid-cols-2 border-2 border-ink">
        <div className="border-r border-ink p-6">
          <div className="text-4xl font-black tabular-nums text-red">
            ${exampleAmount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>
          <div className="label mt-1 text-muted">example amount flagged</div>
        </div>
        <div className="p-6">
          <div className="text-4xl font-black tabular-nums">
            {secured}
          </div>
          <div className="label mt-1 text-muted">accounts you marked secured</div>
        </div>
      </div>

      <ul className="mt-6">
        {checklist.map((c, i) => (
          <li
            key={c.label}
            className="flex items-center gap-5 border-b border-line py-3.5"
          >
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center border border-ink text-xs ${c.done ? "bg-ink text-bg" : "text-ink"}`}
            >
              {c.done ? "✓" : ""}
            </span>
            <span className="label w-6 text-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-bold">{c.label}</span>
          </li>
        ))}
      </ul>

      <Button size="lg" className="mt-8 w-full" onClick={onExport}>
        ⬇ Download incident report
      </Button>
      <p className="label mt-3 text-center text-muted">
        Review the example data before sharing this report
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
