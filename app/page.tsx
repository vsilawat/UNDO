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
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-black">Think you got scammed?</h1>
        <p className="mt-2 text-muted">
          Paste the message. We&apos;ll tell you what it is and help you undo the
          damage — fast.
        </p>
      </div>

      <Card>
        <label className="mb-2 block text-sm font-semibold text-muted">
          Paste the suspicious text, email, or DM
        </label>
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={6}
          placeholder="Paste here…"
          className="w-full resize-none rounded-lg border border-border bg-surface-2 p-4 text-base text-text placeholder:text-muted focus:border-brand focus:outline-none"
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-muted">
            Personal details are stripped before anything is analyzed.
          </span>
          <Button onClick={open} disabled={!msg.trim() || loading}>
            {loading ? "Opening…" : "Open incident →"}
          </Button>
        </div>
      </Card>

      <div className="mt-6">
        <div className="mb-2 text-sm text-muted">Try a sample:</div>
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((s, i) => (
            <button
              key={i}
              onClick={() => setMsg(s)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-left text-xs text-muted hover:border-brand"
            >
              {["Bank scam", "IRS scam", "Legit message"][i]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
