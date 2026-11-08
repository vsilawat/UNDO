"use client";
import { useState } from "react";
import type { ScopeAction } from "@/app/_client/types";
import { Button, Card } from "./ui";

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
  onAnswer: (action: ScopeAction) => void;
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const done = i >= QUESTIONS.length;

  if (done) {
    return (
      <Card className="text-center">
        <div className="text-4xl">✅</div>
        <p className="mt-3 text-xl font-bold">All set</p>
        <p className="mt-1 text-sm text-muted">
          We know what&apos;s exposed. Let&apos;s lock it down.
        </p>
        <Button size="lg" className="mt-5 w-full" onClick={onDone}>
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
    <Card key={i} className="animate-rise">
      <div className="text-sm text-muted">
        Question {i + 1} of {QUESTIONS.length}
      </div>
      <p className="mt-2 text-2xl font-bold leading-snug">{cur.q}</p>
      <p className="mt-1 text-sm text-muted">{cur.hint}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="danger" size="lg" onClick={() => answer(true)}>
          Yes
        </Button>
        <Button variant="ghost" size="lg" onClick={() => answer(false)}>
          No
        </Button>
      </div>
    </Card>
  );
}
