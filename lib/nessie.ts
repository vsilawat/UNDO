import type { AccountExposure, Autopay, FlowHop, MoneyResult, MoneyTxn } from "@/app/_client/types";

interface NessieEntry {
  _id?: string;
  amount?: number;
  purchase_date?: string;
  transaction_date?: string;
  description?: string;
  merchant_id?: string;
  medium?: string;
  payee_id?: string;
  payer_id?: string;
  status?: string;
  payee?: string;
  nickname?: string;
  payment_amount?: number;
  creation_date?: string;
  recurring_date?: number;
  type?: string;
  balance?: number;
}

const demoTransactions: Omit<MoneyTxn, "flagged" | "reason">[] = [
  { id: "demo-1", amount: 12.4, payee: "Corner Coffee", date: "2026-11-05" },
  { id: "demo-2", amount: 63, payee: "Grocery Mart", date: "2026-11-06" },
  { id: "demo-3", amount: 4800, payee: "Zelle to new payee", date: "2026-11-07" },
  { id: "demo-4", amount: 199.99, payee: "Gift card reseller", date: "2026-11-07" },
];

const demoBills: Autopay[] = [
  { id: "bill-1", payee: "City Power & Light", amount: 88.5, cadence: "monthly", createdAt: "2026-03-14", suspicious: false },
  { id: "bill-2", payee: "StreamFlix", amount: 15.99, cadence: "monthly", createdAt: "2026-01-02", suspicious: false },
  { id: "bill-3", payee: "SecurePay Services", amount: 49.0, cadence: "monthly", createdAt: "2026-11-07", suspicious: false },
];

type BaseAccount = Omit<AccountExposure, "touched" | "priority" | "priorityReason" | "drainMinutes">;

const demoAccounts: BaseAccount[] = [
  { id: "acct-chk", nickname: "Everyday Checking", type: "Checking", balance: 3420.17 },
  { id: "acct-sav", nickname: "Emergency Savings", type: "Savings", balance: 11250.0 },
  { id: "acct-cc", nickname: "Rewards Card", type: "Credit Card", balance: -842.55 },
];

async function fetchEntries(path: string, key: string): Promise<NessieEntry[]> {
  const base = process.env.NESSIE_BASE_URL || "https://api.nessieisreal.com";
  const url = new URL(path, base);
  url.searchParams.set("key", key);
  const response = await fetch(url, { signal: AbortSignal.timeout(5000), cache: "no-store" });
  if (!response.ok) throw new Error(`Nessie returned ${response.status}`);
  const value: unknown = await response.json();
  if (!Array.isArray(value)) throw new Error("Unexpected Nessie response");
  return value as NessieEntry[];
}

/** Live Nessie transfers out of the account, or [] in demo mode. */
async function getLiveTransfers(): Promise<FlowHop[]> {
  const key = process.env.NESSIE_API_KEY;
  const account = process.env.NESSIE_ACCOUNT_ID;
  if (!key || !account) return [];
  if (!/^[a-zA-Z0-9_-]+$/.test(account)) throw new Error("Invalid Nessie account ID");
  const transfers = await fetchEntries(`/accounts/${account}/transfers`, key);
  // Outbound transfers only: payer is this account.
  return transfers
    .filter((t) => t.payer_id === account)
    .map((t) => ({
      from: "Your account",
      to: t.payee_id || t.description || "Unknown payee",
      amount: Number(t.amount) || 0,
      medium: t.medium || "transfer",
      live: true,
    }));
}

/** Every account the person holds — live Nessie list, or demo accounts. */
async function getAccounts(): Promise<BaseAccount[]> {
  const key = process.env.NESSIE_API_KEY;
  const account = process.env.NESSIE_ACCOUNT_ID;
  if (!key) return demoAccounts.map((a) => ({ ...a }));
  const accounts = await fetchEntries(`/accounts`, key);
  return accounts.map((a, i) => ({
    id: a._id || `acct-${i}`,
    nickname: a.nickname || `Account ${i + 1}`,
    type: a.type || "Account",
    balance: Number(a.balance) || 0,
  }));
}

// How fast cash can actually leave each account type. Higher = drains faster.
const LIQUIDITY: Record<string, number> = {
  Checking: 1, // instant transfers / Zelle
  "Credit Card": 0.8, // fraud charges post fast, up to the limit
  Savings: 0.55, // transfer limits + delays slow a thief down
};
// Rough minutes to fully pull a balance once a thief has access.
const DRAIN_MINUTES: Record<string, number> = {
  Checking: 15,
  "Credit Card": 30,
  Savings: 120,
};

/**
 * Triage engine (UNDO's own logic — Nessie just supplies balances). Ranks every
 * account by money-at-risk × how fast it can leave, flagged accounts first, so
 * the victim gets an ordered "freeze this first" playbook instead of a flat list.
 */
function summarizeAccounts(
  accounts: BaseAccount[],
  hasFlaggedActivity: boolean,
): { accounts: AccountExposure[]; accountsTouched: number; balanceExposed: number } {
  const active = process.env.NESSIE_ACCOUNT_ID;
  const scored = accounts.map((a) => {
    const touched = hasFlaggedActivity && (active ? a.id === active : a.type === "Checking");
    const stealable = Math.max(a.balance, 0); // can't pull cash from a card you owe on
    const liquidity = LIQUIDITY[a.type] ?? 0.7;
    const riskScore = stealable * liquidity + (touched ? 1e9 : 0);
    return { base: a, touched, stealable, liquidity, riskScore };
  });

  // Highest risk first = freeze order.
  scored.sort((x, y) => y.riskScore - x.riskScore);

  const ranked: AccountExposure[] = scored.map((s, i) => {
    const reason = s.touched
      ? "Flagged activity — freeze first"
      : s.stealable <= 0
        ? "No cash to pull — lowest urgency"
        : s.liquidity >= 1
          ? "Highest liquid balance — drains fastest"
          : s.liquidity >= 0.8
            ? "Fraud charges can post quickly"
            : "Large balance but slower for a thief to move";
    return {
      ...s.base,
      touched: s.touched,
      priority: i + 1,
      priorityReason: reason,
      drainMinutes: DRAIN_MINUTES[s.base.type] ?? 60,
    };
  });

  const touchedList = ranked.filter((a) => a.touched);
  const balanceExposed =
    Math.round(touchedList.reduce((n, a) => n + Math.max(a.balance, 0), 0) * 100) / 100;
  return { accounts: ranked, accountsTouched: touchedList.length, balanceExposed };
}

/** Live Nessie recurring bills, or deterministic demo bills. */
async function getBills(): Promise<Autopay[]> {
  const key = process.env.NESSIE_API_KEY;
  const account = process.env.NESSIE_ACCOUNT_ID;
  if (!key || !account) return demoBills.map((b) => ({ ...b }));
  if (!/^[a-zA-Z0-9_-]+$/.test(account)) throw new Error("Invalid Nessie account ID");
  const bills = await fetchEntries(`/accounts/${account}/bills`, key);
  return bills.map((b, i) => ({
    id: b._id || `bill-${i}`,
    payee: b.payee || b.nickname || "Unknown payee",
    amount: Number(b.payment_amount) || 0,
    cadence: b.recurring_date ? "monthly" : "one-time",
    createdAt: b.creation_date || "Unknown date",
    suspicious: false,
  }));
}

/**
 * Flag autopays a scammer may have planted: created in the incident window
 * (most recent setup) with an unfamiliar or payment-processor-style payee.
 * Heuristic + transparent reason; never auto-cancels anything.
 */
function detectAutopays(bills: Autopay[]): { autopays: Autopay[]; recurringAtRisk: number } {
  if (bills.length === 0) return { autopays: [], recurringAtRisk: 0 };
  const newest = bills.reduce((a, b) => (b.createdAt > a.createdAt ? b : a)).createdAt;
  const vaguePayee = /secure|pay|service|verify|support|protect|billing/i;
  const flagged = bills.map((b) => {
    const recent = b.createdAt === newest && bills.length > 1;
    const vague = vaguePayee.test(b.payee);
    const suspicious = recent && vague;
    return suspicious
      ? { ...b, suspicious, reason: "Recurring charge set up during the incident window to an unfamiliar payee" }
      : { ...b, suspicious: false };
  });
  const recurringAtRisk =
    Math.round(flagged.filter((b) => b.suspicious).reduce((n, b) => n + b.amount, 0) * 100) / 100;
  return { autopays: flagged, recurringAtRisk };
}

/** Use the configured sandbox account, or deterministic demo transactions. */
export async function getTransactions(): Promise<Omit<MoneyTxn, "flagged" | "reason">[]> {
  const key = process.env.NESSIE_API_KEY;
  const account = process.env.NESSIE_ACCOUNT_ID;
  if (!key || !account) return demoTransactions.map((item) => ({ ...item }));
  if (!/^[a-zA-Z0-9_-]+$/.test(account)) throw new Error("Invalid Nessie account ID");

  const [purchases, withdrawals] = await Promise.all([
    fetchEntries(`/accounts/${account}/purchases`, key),
    fetchEntries(`/accounts/${account}/withdrawals`, key),
  ]);
  return [...purchases, ...withdrawals].map((entry, index) => ({
    id: entry._id || `nessie-${index}`,
    amount: Number(entry.amount) || 0,
    payee: entry.description || entry.merchant_id || entry.payee_id || entry.medium || "Unknown payee",
    date: entry.purchase_date || entry.transaction_date || "Unknown date",
  }));
}

const paymentChannels = [
  /gift\s?cards?/i,
  /\b(?:zelle|venmo|cash\s?app)\b/i,
  /\bwire\b/i,
  /\b(?:bitcoin|crypto)\b/i,
];

function channelOf(text: string): string {
  if (/gift\s?cards?/i.test(text)) return "gift card";
  if (/\bzelle\b/i.test(text)) return "zelle";
  if (/\bvenmo\b/i.test(text)) return "venmo";
  if (/cash\s?app/i.test(text)) return "cash app";
  if (/\bwire\b/i.test(text)) return "wire";
  if (/\b(?:bitcoin|crypto)\b/i.test(text)) return "crypto";
  return "transfer";
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Money-mule chain for the largest flagged transfer. Live Nessie transfers
 * (when provided) seed the first hops; downstream hops are a MODEL of how such
 * funds typically move, flagged `live: false` so the UI never claims them as real.
 */
function buildFlow(
  flagged: MoneyTxn[],
  liveTransfers: FlowHop[],
): { flow: FlowHop[]; modeled: boolean } {
  if (!flagged.length) return { flow: [], modeled: false };
  const origin = flagged.reduce((a, b) => (b.amount > a.amount ? b : a));
  const medium = channelOf(origin.payee);

  if (liveTransfers.length) {
    // Real outbound transfers are the ground truth for the first hops.
    const flow = liveTransfers.map((hop, i) => ({ ...hop, minutesAfter: i === 0 ? 0 : i * 6 }));
    return { flow, modeled: false };
  }

  // Demo mode: one modeled laundering path, clearly labeled as a model.
  const flow: FlowHop[] = [
    { from: "Your account", to: origin.payee, amount: round2(origin.amount), medium, minutesAfter: 0, live: false },
    { from: origin.payee, to: "Pass-through account", amount: round2(origin.amount * 0.92), medium: "internal transfer", minutesAfter: 7, live: false },
    { from: "Pass-through account", to: "Crypto cash-out", amount: round2(origin.amount * 0.82), medium: "crypto", minutesAfter: 19, live: false, final: true },
  ];
  return { flow, modeled: true };
}

export function traceMoney(
  transactions: Omit<MoneyTxn, "flagged" | "reason">[],
  context: {
    message: string;
    sentMoney: boolean;
    liveTransfers?: FlowHop[];
    bills?: Autopay[];
    accounts?: BaseAccount[];
  },
): MoneyResult {
  const mentionedChannels = paymentChannels.filter((pattern) => pattern.test(context.message));
  const traced: MoneyTxn[] = transactions.map((transaction) => {
    const suspicious = paymentChannels.some((pattern) => pattern.test(transaction.payee));
    const matchesMessage = mentionedChannels.some((pattern) => pattern.test(transaction.payee));
    const flagged = context.sentMoney && transaction.amount >= 100 &&
      (mentionedChannels.length ? matchesMessage : suspicious);
    return {
      ...transaction,
      flagged,
      ...(flagged ? { reason: matchesMessage
        ? "Payment channel matches the message; verify this example with your bank"
        : "You reported sending money; review this example payment with your bank" } : {}),
    };
  });
  const totalAtRisk = Math.round(traced.reduce((sum, item) => sum + (item.flagged ? item.amount : 0), 0) * 100) / 100;
  const flaggedTxns = traced.filter((t) => t.flagged);
  const { flow, modeled } = buildFlow(flaggedTxns, context.liveTransfers ?? []);
  const { autopays, recurringAtRisk } = detectAutopays(context.bills ?? []);
  const hasFlagged = flaggedTxns.length > 0 || recurringAtRisk > 0;
  const { accounts, accountsTouched, balanceExposed } = summarizeAccounts(
    context.accounts ?? [],
    hasFlagged,
  );
  return {
    transactions: traced,
    totalAtRisk,
    recommendation: totalAtRisk >= 1000 ? "freeze" : totalAtRisk > 0 ? "dispute" : "monitor",
    flow,
    flowModeled: modeled,
    autopays,
    recurringAtRisk,
    accounts,
    accountsTouched,
    balanceExposed,
  };
}

export { getLiveTransfers, getBills, getAccounts };
