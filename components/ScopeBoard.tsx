import type { Asset } from "@/app/_client/types";
import { Card, StatusChip, Button } from "./ui";

export function ScopeBoard({
  assets,
  onLock,
}: {
  assets: Asset[];
  onLock: (name: string) => void;
}) {
  return (
    <Card className="!p-0">
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-border px-4 py-2 text-xs tracking-widest text-muted">
        <span>ASSET</span>
        <span>STATUS</span>
        <span>ACTION</span>
      </div>
      {assets.map((a) => (
        <div
          key={a.name}
          className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-border px-4 py-3 last:border-b-0"
        >
          <span className="font-bold uppercase tracking-wide">
            {a.name.replace(/ /g, "_")}
          </span>
          <StatusChip status={a.status} />
          <span className="justify-self-end">
            {a.status !== "safe" && a.status !== "locked" ? (
              <Button variant="danger" onClick={() => onLock(a.name)}>
                Lock
              </Button>
            ) : a.status === "locked" ? (
              <span className="text-sm text-info">🔒 SECURED</span>
            ) : (
              <span className="text-sm text-muted">—</span>
            )}
          </span>
        </div>
      ))}
    </Card>
  );
}
