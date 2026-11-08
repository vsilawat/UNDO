"use client";
import { useState } from "react";
import type { ScopeAction } from "@/app/_client/types";
import { Button } from "./ui";

const QUESTIONS: { action: ScopeAction; q: string; hint: string }[] = [
  { action: "clicked_link", q: "Did you click a link in the message?", hint: "Even just opening it counts." },
  { action: "shared_code", q: "Did you share a verification code or OTP?", hint: "The 6-digit code texted to you." },
  { action: "shared_password", q: "Did you type or share a password?", hint: "On their site or over the phone." },
  { action: "sent_money", q: "Did you send money, Zelle, or buy gift cards?", hint: "Any payment to them." },
];

export function ActionFlow({
  onAnswer,
  onDone,
}: {
  onAnswer: (action: ScopeAction) => Promise<void>;
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const done = i >= QUESTIONS.length;

  if (done) {
    return (
      <div className="border-2 border-ink bg-surface p-8 text-center">
        <div className="label text-red">Triage complete</div>
        <p className="mt-3 text-3xl font-black uppercase">All set</p>
        <p className="mt-2 text-muted">
          We know what&apos;s exposed. Let&apos;s lock it down.
        </p>
        <Button size="lg" className="mt-6 w-full" onClick={onDone}>
          Continue →
        </Button>
      </div>
    );
  }

  const cur = QUESTIONS[i];
  const answer = async (yes: boolean) => {
    if (saving) return;
    setError(false);
    if (!yes) {
      setI((n) => n + 1);
      return;
    }
    setSaving(true);
    try {
      await onAnswer(cur.action);
      setI((n) => n + 1);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div key={i} className="animate-rise">
      <div className="label text-muted">
        Question {String(i + 1).padStart(2, "0")} of{" "}
        {String(QUESTIONS.length).padStart(2, "0")}
      </div>
      <p className="mt-3 text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl">
        {cur.q}
      </p>
      <p className="mt-2 text-muted">{cur.hint}</p>
      <div className="mt-8 grid grid-cols-2 gap-4">
        <Button variant="danger" size="lg" onClick={() => answer(true)} disabled={saving}>
          Yes
        </Button>
        <Button variant="ghost" size="lg" onClick={() => answer(false)} disabled={saving}>
          No
        </Button>
      </div>
      {error && (
        <p className="label mt-3 text-red">
          Could not save that answer. Please try again.
        </p>
      )}
    </div>
  );
}
