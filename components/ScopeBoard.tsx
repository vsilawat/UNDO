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
    <ul className="border-t border-ink">
      {assets.map((a, i) => (
        <li
          key={a.name}
          className="flex items-center gap-5 border-b border-line py-5"
        >
          <span className="label w-6 shrink-0 text-red">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="flex-1">
            <div className="text-xl font-bold">{a.name}</div>
            <div className="mt-2">
              <StatusChip status={a.status} />
            </div>
          </div>
          {a.status !== "safe" && a.status !== "locked" ? (
            <Button variant="danger" onClick={() => onLock(a.name)}>
              Lock it
            </Button>
          ) : a.status === "locked" ? (
            <span className="label text-ink">🔒 Secured</span>
          ) : (
            <span className="label text-muted">—</span>
          )}
        </li>
      ))}
    </ul>
  );
}
