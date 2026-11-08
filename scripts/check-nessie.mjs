import { readFileSync } from "node:fs";

let contents;
try {
  contents = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
} catch {
  console.error("No .env.local found in the UNDO folder.");
  process.exit(1);
}

const key = contents.split(/\r?\n/)
  .find((line) => line.startsWith("NESSIE_API_KEY="))
  ?.slice("NESSIE_API_KEY=".length).trim();
if (!key) {
  console.error("NESSIE_API_KEY is empty in .env.local.");
  process.exit(1);
}

async function get(path) {
  const url = new URL(path, "https://api.nessieisreal.com");
  url.searchParams.set("key", key);
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Nessie returned HTTP ${response.status}`);
  const value = await response.json();
  if (!Array.isArray(value)) throw new Error("Nessie returned an unexpected response");
  return value;
}

try {
  const customers = await get("/customers");
  console.log(`Nessie connection works. Customers: ${customers.length}`);
  for (const customer of customers) {
    const id = customer._id;
    if (typeof id !== "string") continue;
    const accounts = await get(`/customers/${encodeURIComponent(id)}/accounts`);
    console.log(`Customer ${id}: ${accounts.length} account(s)`);
    for (const account of accounts) {
      if (typeof account._id === "string") console.log(`  Account ID: ${account._id}`);
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Nessie connection failed");
  process.exitCode = 1;
}
