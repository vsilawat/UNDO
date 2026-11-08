// Goal-Gradient + Zeigarnik: visible progress pulls the user to finish.
export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  const pct = Math.round((current / (steps.length - 1)) * 100);
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-semibold text-text">{steps[current]}</span>
        <span className="text-muted">
          Step {current + 1} of {steps.length}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-warn to-crit transition-all duration-500"
          style={{ width: `${Math.max(pct, 6)}%` }}
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
                "grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold transition " +
                (done
                  ? "bg-ok text-[#04120b]"
                  : cur
                    ? "bg-gradient-to-b from-[#ff6474] to-[#ff3b4d] text-white shadow-[0_4px_12px_-4px_rgba(255,77,94,0.8)]"
                    : "bg-surface-2 text-muted")
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
