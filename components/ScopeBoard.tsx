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
    <div className="grid gap-3 sm:grid-cols-2">
      {assets.map((a) => (
        <Card key={a.name} className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{a.name}</div>
            <div className="mt-1">
              <StatusChip status={a.status} />
            </div>
          </div>
          {a.status !== "safe" && a.status !== "locked" && (
            <Button variant="danger" onClick={() => onLock(a.name)}>
              Lock it
            </Button>
          )}
          {a.status === "locked" && (
            <span className="text-sm text-locked">🔒 Secured</span>
          )}
        </Card>
      ))}
    </div>
  );
}
