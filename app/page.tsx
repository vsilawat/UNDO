"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./_client/api";
import { Button, Card } from "@/components/ui";

const SAMPLES = [
  "URGENT: Your bank account is locked. Verify now at http://secure-bank-verify.co or call 800-555-0199. Reply with the code we texted you.",
  "IRS FINAL NOTICE: You owe $2,340 in back taxes. Pay with gift cards within 24h or a warrant will be issued.",
  "Your package was delivered to the front porch. Thanks for shopping with us.",
];
const LABELS = ["BANK_SCAM", "IRS_SCAM", "LEGIT_MSG"];

export default function IntakePage() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const open = async () => {
    if (!msg.trim() || loading) return;
    setLoading(true);
    try {
      const incident = await api.createIncident(msg.trim());
      router.push(`/incident/${incident.id}`);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="text-xs tracking-widest text-crit">● INTAKE</div>
        <h1 className="mt-1 text-2xl font-black uppercase tracking-wide">
          Report an incident
        </h1>
        <p className="mt-1 text-sm text-muted">
          Paste the suspicious message. We classify the threat and help you undo
          the damage — fast.
        </p>
      </div>

      <Card>
        <label className="mb-2 block text-xs tracking-widest text-muted">
          SUSPICIOUS PAYLOAD — text / email / DM
        </label>
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={6}
          placeholder="> paste here…"
          className="w-full resize-none border border-border bg-surface-2 p-4 font-mono text-sm text-text placeholder:text-muted focus:border-warn focus:outline-none"
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-info">
            // PII stripped before analysis
          </span>
          <Button onClick={open} disabled={!msg.trim() || loading}>
            {loading ? "Analyzing…" : "Open incident →"}
          </Button>
        </div>
      </Card>

      <div className="mt-6">
        <div className="mb-2 text-xs tracking-widest text-muted">
          LOAD SAMPLE:
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((s, i) => (
            <button
              key={i}
              onClick={() => setMsg(s)}
              className="border border-border bg-surface px-3 py-2 font-mono text-xs text-muted hover:border-warn hover:text-text"
            >
              {LABELS[i]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
