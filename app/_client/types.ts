// Shared frontend types — mirror the API contract in "Agentic Web Tasks.md".
// Backend owns the real shapes; keep these in sync with /app/api responses.

export type AssetStatus = "safe" | "at_risk" | "compromised" | "locked";
export type ScopeAction =
  | "clicked_link"
  | "shared_code"
  | "sent_money"
  | "shared_password";

export interface Incident {
  id: string;
  createdAt: string;
  scrubbedMessage: string;
  scamType: string;
  confidence: number; // 0..1
  isScam: boolean;
  redFlags: string[];
  nextSteps: string[];
}

export interface Asset {
  name: string;
  status: AssetStatus;
}

export interface ScopeResult {
  assets: Asset[];
}

export interface MoneyTxn {
  id: string;
  amount: number;
  payee: string;
  date: string;
  flagged: boolean;
  reason?: string;
}

export interface MoneyResult {
  transactions: MoneyTxn[];
  totalAtRisk: number;
  recommendation: "freeze" | "dispute" | "monitor";
}

export interface LogEvent {
  time: string;
  text: string;
}

export interface LogResult {
  events: LogEvent[];
}
