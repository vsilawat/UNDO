export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  const pct = Math.round((current / (steps.length - 1)) * 100);
  return (
    <div className="mb-10">
      <div className="label flex items-center justify-between text-muted">
        <span className="text-red">
          Step {String(current + 1).padStart(2, "0")}/
          {String(steps.length).padStart(2, "0")} — {steps[current]}
        </span>
        <span>{pct}% complete</span>
      </div>
      <div className="mt-3 h-2 w-full border border-ink bg-surface">
        <div
          className="h-full bg-red transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between">
        {steps.map((s, i) => {
          const done = i < current;
          const cur = i === current;
          return (
            <span
              key={s}
              className={
                "grid h-6 w-6 place-items-center border text-[11px] font-bold " +
                (done
                  ? "border-ink bg-ink text-bg"
                  : cur
                    ? "border-red bg-red text-bg"
                    : "border-line text-muted")
              }
            >
              {done ? "✓" : i + 1}
            </span>
          );
        })}
      </div>
    </div>
  );
}
