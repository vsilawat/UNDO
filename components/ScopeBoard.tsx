import type { Asset } from "@/app/_client/types";
import { StatusChip, Button } from "./ui";

export function ScopeBoard({
  assets,
  onLock,
}: {
  assets: Asset[];
  onLock: (name: string) => void;
}) {
  return (
    <div className="space-y-3">
      {assets.map((a) => (
        <div
          key={a.name}
          className="card flex items-center justify-between gap-3 p-4"
        >
          <div className="min-w-0">
            <div className="font-semibold">{a.name}</div>
            <div className="mt-1.5">
              <StatusChip status={a.status} />
            </div>
          </div>
          {a.status !== "safe" && a.status !== "locked" ? (
            <Button variant="danger" onClick={() => onLock(a.name)}>
              Lock it
            </Button>
          ) : a.status === "locked" ? (
            <span className="shrink-0 text-sm font-medium text-info">
              🔒 Secured
            </span>
          ) : (
            <span className="shrink-0 text-sm text-muted">—</span>
          )}
        </div>
      ))}
    </div>
  );
}
