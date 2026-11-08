import type { Asset, AssetStatus, ScopeAction } from "@/app/_client/types";

export const initialAssets = (): Asset[] => [
  { name: "Email account", status: "safe" },
  { name: "Phone number", status: "safe" },
  { name: "Bank account", status: "safe" },
  { name: "Passwords", status: "safe" },
];

const rank: Record<AssetStatus, number> = { safe: 0, at_risk: 1, compromised: 2, locked: 3 };
const effects: Record<ScopeAction, Partial<Record<Asset["name"], AssetStatus>>> = {
  clicked_link: { "Email account": "at_risk", "Phone number": "at_risk" },
  shared_code: { "Phone number": "compromised", "Email account": "at_risk" },
  shared_password: { "Passwords": "compromised", "Email account": "compromised", "Bank account": "at_risk" },
  sent_money: { "Bank account": "compromised" },
};

export const isScopeAction = (value: unknown): value is ScopeAction =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(effects, value);

export function applyScope(assets: Asset[], action: ScopeAction): Asset[] {
  const changes = effects[action];
  return assets.map((asset) => {
    const next = changes[asset.name];
    return next && rank[next] > rank[asset.status] ? { ...asset, status: next } : { ...asset };
  });
}
