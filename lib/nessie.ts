import type { MoneyResult, MoneyTxn } from "@/app/_client/types";

interface NessieEntry {
  _id?: string;
  amount?: number;
  purchase_date?: string;
  transaction_date?: string;
  description?: string;
  merchant_id?: string;
  medium?: string;
  payee_id?: string;
}

const demoTransactions: Omit<MoneyTxn, "flagged" | "reason">[] = [
  { id: "demo-1", amount: 12.4, payee: "Corner Coffee", date: "2026-11-05" },
  { id: "demo-2", amount: 63, payee: "Grocery Mart", date: "2026-11-06" },
  { id: "demo-3", amount: 4800, payee: "Zelle to new payee", date: "2026-11-07" },
  { id: "demo-4", amount: 199.99, payee: "Gift card reseller", date: "2026-11-07" },
];

async function fetchEntries(path: string, key: string): Promise<NessieEntry[]> {
  const base = process.env.NESSIE_BASE_URL || "https://api.reimaginebanking.com";
  const url = new URL(path, base);
  url.searchParams.set("key", key);
  const response = await fetch(url, { signal: AbortSignal.timeout(5000), cache: "no-store" });
  if (!response.ok) throw new Error(`Nessie returned ${response.status}`);
  const value: unknown = await response.json();
  if (!Array.isArray(value)) throw new Error("Unexpected Nessie response");
  return value as NessieEntry[];
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

export function traceMoney(transactions: Omit<MoneyTxn, "flagged" | "reason">[]): MoneyResult {
  const traced: MoneyTxn[] = transactions.map((transaction) => {
    const suspicious = /gift\s?card|wire|crypto|zelle|venmo|unknown payee/i.test(transaction.payee);
    const flagged = transaction.amount >= 100 && suspicious;
    return {
      ...transaction,
      flagged,
      ...(flagged ? { reason: "Payment channel and amount match common scam patterns; verify with your bank" } : {}),
    };
  });
  const totalAtRisk = Math.round(traced.reduce((sum, item) => sum + (item.flagged ? item.amount : 0), 0) * 100) / 100;
  return {
    transactions: traced,
    totalAtRisk,
    recommendation: totalAtRisk >= 1000 ? "freeze" : totalAtRisk > 0 ? "dispute" : "monitor",
  };
}
