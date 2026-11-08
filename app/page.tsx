"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./_client/api";
import { Button } from "@/components/ui";

const SAMPLES = [
  {
    text: "URGENT: Your bank account is locked. Verify now at http://secure-bank-verify.co or call 800-555-0199. Reply with the code we texted you.",
    name: "Bank account locked",
    tag: "Bank scam",
  },
  {
    text: "IRS FINAL NOTICE: You owe $2,340 in back taxes. Pay with gift cards within 24h or a warrant will be issued.",
    name: "IRS final notice",
    tag: "Gov impersonation",
  },
  {
    text: "Your package was delivered to the front porch. Thanks for shopping with us.",
    name: "Package delivered",
    tag: "Legit message",
  },
];

export default function IntakePage() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const open = async () => {
    if (!msg.trim() || loading) return;
    setError(false);
    setLoading(true);
    try {
      const incident = await api.createIncident(msg.trim());
      router.push(`/incident/${incident.id}`);
    } catch {
      setLoading(false);
      setError(true);
    }
  };

  return (
    <div className="animate-rise">
      <div className="label mb-5 flex items-center gap-2 text-red">
        <span className="inline-block h-3 w-1.5 bg-red" />
        Incident intake — form 01
      </div>

      <h1 className="text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-7xl">
        Undo the damage in the{" "}
        <span className="inline-block bg-red px-3 pb-1 text-bg">
          first hour.
        </span>
      </h1>

      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        You&apos;re not stupid and you&apos;re not alone. Paste the message — we
        start the clock and walk you through undoing the damage, step by step.
      </p>

      <div className="mt-10">
        <div className="label dashed pb-2 text-muted">
          Section A — paste the message
        </div>

        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={5}
          placeholder="Paste the suspicious text, email, or DM…"
          className="mt-5 w-full resize-none border border-ink bg-surface p-4 font-mono text-sm leading-relaxed text-ink placeholder:text-muted focus:border-red focus:outline-none"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="label text-muted">
            Personal details stripped before analysis
          </span>
          <Button size="lg" onClick={open} disabled={!msg.trim() || loading}>
            {loading ? "Analyzing…" : "Check it →"}
          </Button>
        </div>
        {error && (
          <p className="label mt-3 text-red">
            Could not open the incident. Please try again.
          </p>
        )}
      </div>

      <div className="mt-10">
        <div className="label dashed pb-2 text-muted">
          Section B — or load a sample
        </div>
        <ul>
          {SAMPLES.map((s, i) => (
            <li key={i}>
              <button
                onClick={() => setMsg(s.text)}
                className="group flex w-full items-center gap-5 border-b border-line py-5 text-left transition hover:bg-surface-2"
              >
                <span className="label w-6 shrink-0 text-red">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-xl font-bold">{s.name}</span>
                <span className="label text-muted">{s.tag}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="label mt-10 text-muted">
        General guidance, not legal advice · US-focused reporting resources
      </p>
    </div>
  );
}
