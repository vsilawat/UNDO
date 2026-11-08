// Goal-Gradient + Zeigarnik: show progress and what's left so the user is
// pulled toward completion. Serial Position: labels readable at a glance.
export type StepState = "done" | "current" | "upcoming";

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
      <div className="mb-3 flex items-center justify-between text-xs tracking-widest text-muted">
        <span>
          STEP {String(current + 1).padStart(2, "0")}/
          {String(steps.length).padStart(2, "0")}
        </span>
        <span className="text-warn">{steps[current]}</span>
      </div>
      {/* single progress track — one thing to read, not five */}
      <div className="h-1 w-full bg-surface-2">
        <div
          className="h-full bg-warn transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between">
        {steps.map((s, i) => {
          const state: StepState =
            i < current ? "done" : i === current ? "current" : "upcoming";
          return (
            <div key={s} className="flex flex-col items-center gap-1">
              <span
                className={
                  "grid h-5 w-5 place-items-center text-[10px] font-bold " +
                  (state === "done"
                    ? "bg-ok text-[#04120b]"
                    : state === "current"
                      ? "border border-warn text-warn"
                      : "border border-border text-muted")
                }
              >
                {state === "done" ? "✓" : i + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
