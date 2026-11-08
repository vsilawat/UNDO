"use client";
import { useState } from "react";
import type { ScopeAction } from "@/app/_client/types";
import { Button, Card } from "./ui";

// One question per screen, big buttons, no tutorial — easy under stress.
const QUESTIONS: { action: ScopeAction; q: string }[] = [
  { action: "clicked_link", q: "Did you click a link in the message?" },
  { action: "shared_code", q: "Did you share a verification code or OTP?" },
  { action: "shared_password", q: "Did you type or share a password?" },
  { action: "sent_money", q: "Did you send money, Zelle, or buy gift cards?" },
];

export function ActionFlow({
  onAnswer,
  onDone,
}: {
  onAnswer: (action: ScopeAction) => void;
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const done = i >= QUESTIONS.length;

  if (done) {
    return (
      <Card className="text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-ok">
          ✓ Triage complete
        </p>
        <p className="mt-1 text-sm text-muted">
          Scope updated below. Lock anything compromised.
        </p>
        <Button className="mt-4" onClick={onDone}>
          Continue →
        </Button>
      </Card>
    );
  }

  const cur = QUESTIONS[i];
  const answer = (yes: boolean) => {
    if (yes) onAnswer(cur.action);
    setI((n) => n + 1);
  };

  return (
    <Card>
      <div className="mb-1 flex justify-between text-xs tracking-widest text-muted">
        <span>TRIAGE</span>
        <span>
          {String(i + 1).padStart(2, "0")}/{String(QUESTIONS.length).padStart(2, "0")}
        </span>
      </div>
      <div className="mb-4 flex gap-1">
        {QUESTIONS.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 flex-1 ${idx <= i ? "bg-warn" : "bg-surface-2"}`}
          />
        ))}
      </div>
      <p className="text-lg font-bold">{cur.q}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="danger" onClick={() => answer(true)}>
          Yes
        </Button>
        <Button variant="ghost" onClick={() => answer(false)}>
          No
        </Button>
      </div>
    </Card>
  );
}
