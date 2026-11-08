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

export interface FlowHop {
  from: string;
  to: string;
  amount: number;
  medium?: string; // zelle / wire / crypto / gift card
  minutesAfter?: number; // minutes after the first hop
  live?: boolean; // true = real Nessie transfer, false = modeled path
  final?: boolean; // cash-out / unrecoverable endpoint
}

export interface Autopay {
  id: string;
  payee: string;
  amount: number;
  cadence: string; // e.g. "monthly"
  createdAt: string;
  suspicious: boolean;
  reason?: string;
}

export interface AccountExposure {
  id: string;
  nickname: string;
  type: string; // Checking / Savings / Credit Card
  balance: number;
  touched: boolean; // flagged activity hit this account
  priority: number; // 1 = freeze first (triage rank)
  priorityReason: string; // why it sits at this rank
  drainMinutes: number; // est. minutes for the balance to be fully pullable
}

export interface MoneyResult {
  transactions: MoneyTxn[];
  totalAtRisk: number;
  recommendation: "freeze" | "dispute" | "monitor";
  flow?: FlowHop[]; // money-mule / fund-flow chain from the flagged transfer
  flowModeled?: boolean; // the downstream hops are a model, not live data
  autopays?: Autopay[]; // recurring bills — scammer-planted drains flagged
  recurringAtRisk?: number; // monthly $ exposed to suspicious autopays
  accounts?: AccountExposure[]; // every account the person holds
  accountsTouched?: number; // how many have flagged activity
  balanceExposed?: number; // total balance sitting in touched accounts
}

export interface LogEvent {
  time: string;
  text: string;
}

export interface LogResult {
  events: LogEvent[];
}
