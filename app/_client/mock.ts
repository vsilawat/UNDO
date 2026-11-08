// In-browser mock backend. Lets the frontend run with zero backend.
// Flip NEXT_PUBLIC_USE_MOCK=false once /app/api is live.
import type {
  Incident,
  ScopeAction,
  ScopeResult,
  MoneyResult,
  LogResult,
  Asset,
  LogEvent,
} from "./types";

interface Store {
  incident: Incident;
  assets: Asset[];
  log: LogEvent[];
}

const db = new Map<string, Store>();

function now() {
  return new Date().toISOString();
}

function classify(message: string): Omit<Incident, "id" | "createdAt"> {
  const m = message.toLowerCase();
  const scrubbedMessage = message
    .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "[phone]")
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/\b\d{6,}\b/g, "[number]");

  const legit =
    m.includes("your package was delivered") ||
    m.includes("appointment is confirmed");

  if (legit) {
    return {
      scrubbedMessage,
      scamType: "none",
      confidence: 0.72,
      isScam: false,
      redFlags: [],
      nextSteps: ["No action needed. Message looks legitimate."],
    };
  }

  const flags: string[] = [];
  if (/gift ?card|wire|zelle|venmo|bitcoin|crypto/.test(m))
    flags.push("Asks to move money through hard-to-reverse channels");
  if (/verify|confirm|suspend|locked|unusual activity/.test(m))
    flags.push("Fake urgency about your account");
  if (/warrant|arrest|lawsuit|back tax|final notice|24h|24 hours|immediately|within \d+/.test(m))
    flags.push("Threats and a countdown to pressure you");
  if (/code|otp|password|ssn|social security/.test(m))
    flags.push("Requests a code or credential no real company asks for");
  if (/https?:\/\/|bit\.ly|tinyurl|click here/.test(m))
    flags.push("Pushes you to a suspicious link");

  const confidence = Math.min(0.5 + flags.length * 0.15, 0.97);
  const lowConfidence = flags.length <= 1;

  const scamType = /irs|ssn|social security/.test(m)
    ? "Government impersonation"
    : /bank|account|card/.test(m)
      ? "Bank impersonation"
      : /package|delivery|usps|fedex/.test(m)
        ? "Delivery scam"
        : "Phishing";

  return {
    scrubbedMessage,
    scamType,
    confidence: lowConfidence ? 0.55 : confidence,
    isScam: !lowConfidence,
    redFlags: flags.length ? flags : ["Some wording is suspicious, but unclear"],
    nextSteps: [
      "Do not reply or click any links.",
      "Call your bank using the number on the back of your card.",
      "If you shared anything, start the scope check below.",
    ],
  };
}

export async function createIncident(message: string): Promise<Incident> {
  const id = Math.random().toString(36).slice(2, 8);
  const createdAt = now();
  const incident: Incident = { id, createdAt, ...classify(message) };
  db.set(id, {
    incident,
    assets: [
      { name: "Email account", status: "safe" },
      { name: "Phone number", status: "safe" },
      { name: "Bank account", status: "safe" },
      { name: "Passwords", status: "safe" },
    ],
    log: [{ time: createdAt, text: `Incident opened — ${incident.scamType}` }],
  });
  return incident;
}

export async function getIncident(id: string): Promise<Incident> {
  const s = db.get(id);
  if (!s) throw new Error("Incident not found");
  return s.incident;
}

const ACTION_EFFECTS: Record<ScopeAction, { asset: string; status: Asset["status"]; label: string }> = {
  clicked_link: { asset: "Email account", status: "at_risk", label: "Clicked a link" },
  shared_code: { asset: "Phone number", status: "compromised", label: "Shared a verification code" },
  shared_password: { asset: "Passwords", status: "compromised", label: "Shared a password" },
  sent_money: { asset: "Bank account", status: "compromised", label: "Sent money" },
};

export async function patchScope(id: string, action: ScopeAction): Promise<ScopeResult> {
  const s = db.get(id);
  if (!s) throw new Error("Incident not found");
  const eff = ACTION_EFFECTS[action];
  const a = s.assets.find((x) => x.name === eff.asset);
  if (a && a.status !== "locked") a.status = eff.status;
  s.log.push({ time: now(), text: `You reported: ${eff.label} → ${eff.asset} ${eff.status}` });
  return { assets: s.assets };
}

export async function lockAsset(id: string, name: string): Promise<ScopeResult> {
  const s = db.get(id);
  if (!s) throw new Error("Incident not found");
  const a = s.assets.find((x) => x.name === name);
  if (a) a.status = "locked";
  s.log.push({ time: now(), text: `${name} locked` });
  return { assets: s.assets };
}

export async function getScope(id: string): Promise<ScopeResult> {
  const s = db.get(id);
  if (!s) throw new Error("Incident not found");
  return { assets: s.assets };
}

export async function getMoney(id: string): Promise<MoneyResult> {
  const s = db.get(id);
  if (!s) throw new Error("Incident not found");
  const transactions = [
    { id: "t1", amount: 12.4, payee: "Corner Coffee", date: "2026-11-05", flagged: false },
    { id: "t2", amount: 63.0, payee: "Grocery Mart", date: "2026-11-06", flagged: false },
    { id: "t3", amount: 4800, payee: "Unknown — Zelle to new payee", date: "2026-11-07", flagged: true, reason: "Large transfer to a payee added minutes ago" },
    { id: "t4", amount: 199.99, payee: "Gift card reseller", date: "2026-11-07", flagged: true, reason: "Gift card purchase matches scam instructions" },
  ];
  const totalAtRisk = transactions.filter((t) => t.flagged).reduce((n, t) => n + t.amount, 0);
  return { transactions, totalAtRisk, recommendation: "freeze" };
}

export async function getLog(id: string): Promise<LogResult> {
  const s = db.get(id);
  if (!s) throw new Error("Incident not found");
  return { events: [...s.log] };
}
