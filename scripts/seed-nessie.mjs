import { readFileSync, writeFileSync } from "node:fs";

const envPath = new URL("../.env.local", import.meta.url);
let env;
try {
  env = readFileSync(envPath, "utf8");
} catch {
  console.error("No .env.local found in the UNDO folder.");
  process.exit(1);
}
const key = env.split(/\r?\n/)
  .find((line) => line.startsWith("NESSIE_API_KEY="))
  ?.slice("NESSIE_API_KEY=".length).trim();
if (!key) {
  console.error("NESSIE_API_KEY is empty in .env.local.");
  process.exit(1);
}

async function request(path, method = "GET", body) {
  const url = new URL(path, "https://api.nessieisreal.com");
  url.searchParams.set("key", key);
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`${method} ${path} returned HTTP ${response.status}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

const entries = [
  { amount: 4800, description: "UNDO demo Zelle to new payee" },
  { amount: 200, description: "UNDO demo gift card reseller" },
  { amount: 12, description: "UNDO demo Corner Coffee" },
];

try {
  let customers = await request("/customers");
  if (!Array.isArray(customers)) throw new Error("Unexpected customer list from Nessie");
  let customer = customers.find((item) => item.first_name === "Undo" && item.last_name === "Demo");
  if (!customer) {
    const created = await request("/customers", "POST", {
      first_name: "Undo",
      last_name: "Demo",
      address: { street_number: "1", street_name: "Demo Lane", city: "Atlanta", state: "GA", zip: "30303" },
    });
    customer = created?.objectCreated;
    if (!customer?._id) {
      customers = await request("/customers");
      customer = customers.find((item) => item.first_name === "Undo" && item.last_name === "Demo");
    }
    if (!customer?._id) throw new Error("Customer was created but its ID could not be found; rerun this script");
    console.log("Created UNDO demo customer.");
  }

  const customerId = customer._id;
  let accounts = await request(`/customers/${encodeURIComponent(customerId)}/accounts`);
  if (!Array.isArray(accounts)) throw new Error("Unexpected account list from Nessie");
  let account = accounts.find((item) => item.nickname === "UNDO Demo Checking v2");
  if (!account) {
    const created = await request(`/customers/${encodeURIComponent(customerId)}/accounts`, "POST", {
      type: "Checking", nickname: "UNDO Demo Checking v2", rewards: 0, balance: 6000,
    });
    account = created?.objectCreated;
    if (!account?._id) {
      accounts = await request(`/customers/${encodeURIComponent(customerId)}/accounts`);
      account = accounts.find((item) => item.nickname === "UNDO Demo Checking v2");
    }
    if (!account?._id) throw new Error("Account was created but its ID could not be found; rerun this script");
    console.log("Created UNDO demo checking account.");
  }

  const accountId = account._id;
  const updated = env.split(/\r?\n/).filter((line) => line && !line.startsWith("NESSIE_ACCOUNT_ID="));
  updated.push(`NESSIE_ACCOUNT_ID=${accountId}`);
  writeFileSync(envPath, `${updated.join("\n")}\n`, { mode: 0o600 });
  const path = `/accounts/${encodeURIComponent(accountId)}/withdrawals`;
  const existing = await request(path);
  if (!Array.isArray(existing)) throw new Error("Unexpected withdrawal list from Nessie");
  for (const entry of entries) {
    if (existing.some((item) => item.description === entry.description)) continue;
    await request(path, "POST", {
      medium: "balance", status: "completed", amount: entry.amount, description: entry.description,
      transaction_date: new Date().toISOString().slice(0, 10),
    });
    console.log(`Created sample payment: ${entry.description}.`);
  }

  const verified = await request(path);
  console.log(`Nessie account ${accountId} is configured with ${verified.length} withdrawal(s).`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Nessie setup failed");
  process.exitCode = 1;
}
