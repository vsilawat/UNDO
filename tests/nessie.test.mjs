import assert from "node:assert/strict";
import test from "node:test";
import { traceMoney } from "../lib/nessie.ts";

const transactions = [
  { id: "zelle", amount: 4800, payee: "Zelle to new payee", date: "2026-11-07" },
  { id: "gift", amount: 199.99, payee: "Gift card reseller", date: "2026-11-07" },
  { id: "coffee", amount: 12.4, payee: "Corner Coffee", date: "2026-11-05" },
];

test("does not suggest losses before a payment is reported", () => {
  const result = traceMoney(transactions, {
    message: "Your package was delivered",
    sentMoney: false,
    bills: [
      { id: "old", payee: "Groceries", amount: 20, cadence: "monthly", createdAt: "2026-10-01", suspicious: false },
      { id: "new", payee: "Payment Services", amount: 49, cadence: "monthly", createdAt: "2026-11-07", suspicious: false },
    ],
    accounts: [{ id: "checking", nickname: "Checking", type: "Checking", balance: 3420 }],
  });
  assert.equal(result.totalAtRisk, 0);
  assert.equal(result.recommendation, "monitor");
  assert.equal(result.recurringAtRisk, 0);
  assert.equal(result.accountsTouched, 0);
  assert.equal(result.balanceExposed, 0);
  assert.deepEqual(result.accounts, []);
  assert.ok(result.transactions.every((transaction) => !transaction.flagged));
});

test("matches a payment channel mentioned in the message", () => {
  const result = traceMoney(transactions, { message: "Pay with gift cards", sentMoney: true });
  assert.deepEqual(result.transactions.filter((transaction) => transaction.flagged).map((transaction) => transaction.id), ["gift"]);
  assert.equal(result.totalAtRisk, 199.99);
});

test("offers review candidates when a payment was reported without a named channel", () => {
  const result = traceMoney(transactions, { message: "Your bank account is locked", sentMoney: true });
  assert.deepEqual(result.transactions.filter((transaction) => transaction.flagged).map((transaction) => transaction.id), ["zelle", "gift"]);
});
