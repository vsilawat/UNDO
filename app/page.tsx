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
const LABELS = ["Bank scam", "IRS scam", "Legit message"];

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
    <div className="animate-rise mx-auto max-w-xl">
      <div className="mb-7 text-center">
        <h1 className="text-4xl font-black leading-tight tracking-tight">
          Think you got scammed?
        </h1>
        <p className="mt-3 text-lg text-muted">
          Paste the message. We&apos;ll tell you what it is and walk you through
          undoing the damage — step by step.
        </p>
      </div>

      <Card className="!p-5">
        <label className="mb-2 block text-sm font-medium text-muted">
          Paste the suspicious text, email, or DM
        </label>
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={6}
          placeholder="Paste it here…"
          className="mono w-full resize-none rounded-xl border border-border bg-surface-2 p-4 text-sm leading-relaxed text-text placeholder:text-muted/70 focus:border-info focus:outline-none"
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-info">
            Personal details are stripped before anything is analyzed.
          </span>
          <Button size="lg" onClick={open} disabled={!msg.trim() || loading}>
            {loading ? "Analyzing…" : "Check it →"}
          </Button>
        </div>
      </Card>

      <div className="mt-6 text-center">
        <div className="mb-2 text-xs uppercase tracking-wider text-muted">
          or try a sample
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {SAMPLES.map((s, i) => (
            <button
              key={i}
              onClick={() => setMsg(s)}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted transition hover:border-muted hover:text-text"
            >
              {LABELS[i]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
