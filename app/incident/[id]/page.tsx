"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/app/_client/api";
import { downloadReport } from "@/app/_client/report";
import type {
  Incident,
  Asset,
  MoneyResult,
  LogEvent,
  ScopeAction,
} from "@/app/_client/types";
import { Button } from "@/components/ui";
import { Stepper } from "@/components/Stepper";
import { VerdictCard } from "@/components/VerdictCard";
import { ActionFlow } from "@/components/ActionFlow";
import { ScopeBoard } from "@/components/ScopeBoard";
import { BlastRadius } from "@/components/BlastRadius";
import { IncidentLog } from "@/components/IncidentLog";
import { RecoverySummary } from "@/components/RecoverySummary";

const STEPS = ["VERDICT", "TRIAGE", "SCOPE", "MONEY", "DONE"];

export default function IncidentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [money, setMoney] = useState<MoneyResult | null>(null);
  const [log, setLog] = useState<LogEvent[]>([]);
  const [error, setError] = useState(false);
  const [step, setStep] = useState(0);

  const refresh = async () => {
    const [m, l] = await Promise.all([api.getMoney(id), api.getLog(id)]);
    setMoney(m);
    setLog(l.events);
  };

  useEffect(() => {
    (async () => {
      try {
        const inc = await api.getIncident(id);
        setIncident(inc);
        const s = await api.getScope(id);
        setAssets(s.assets);
        await refresh();
      } catch {
        setError(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onAnswer = async (action: ScopeAction) => {
    const r = await api.patchScope(id, action);
    setAssets(r.assets);
    await refresh();
  };

  const onLock = async (name: string) => {
    const r = await api.lockAsset(id, name);
    setAssets(r.assets);
    await refresh();
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  if (error) {
    return (
      <div className="border-2 border-ink bg-surface p-10 text-center">
        <div className="label text-red">Error 404</div>
        <p className="mt-3 text-3xl font-black uppercase">Incident not found</p>
        <Link href="/" className="label mt-4 inline-block text-red hover:underline">
          Start a new one →
        </Link>
      </div>
    );
  }
  if (!incident) {
    return <div className="label animate-pulse text-muted">Loading incident…</div>;
  }

  const anyCompromised = assets.some(
    (a) => a.status === "compromised" || a.status === "at_risk",
  );

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="label text-muted hover:text-red">
          ← New incident
        </Link>
        <span className="label text-muted">Case #{incident.id}</span>
      </div>

      <Stepper steps={STEPS} current={step} />

      {/* One step on screen at a time — Hick's Law, lower cognitive load. */}
      <div key={step} className="animate-rise">
      {step === 0 && (
        <div className="space-y-5">
          <VerdictCard incident={incident} />
          <Button className="w-full" onClick={next}>
            {incident.isScam ? "Start recovery →" : "Looks safe — review steps →"}
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <p className="text-sm text-muted">
            Answer honestly — this tells us exactly what&apos;s exposed. One
            question at a time.
          </p>
          <ActionFlow onAnswer={onAnswer} onDone={next} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <div className="label mb-3 flex items-center gap-2 text-red">
              <span className="inline-block h-3 w-1.5 bg-red" />
              Section C — scope of compromise
            </div>
            <h2 className="text-4xl font-black uppercase leading-none tracking-tight">
              Lock what&apos;s exposed
            </h2>
            <p className="mt-3 text-muted">
              {anyCompromised
                ? "Lock anything at risk. Do the red ones first."
                : "Nothing flagged as exposed — you can continue."}
            </p>
          </div>
          <ScopeBoard assets={assets} onLock={onLock} />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={back}>
              ← Back
            </Button>
            <Button className="flex-1" onClick={next}>
              Continue →
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div>
            <div className="label mb-3 flex items-center gap-2 text-red">
              <span className="inline-block h-3 w-1.5 bg-red" />
              Section D — blast radius
            </div>
            <h2 className="text-4xl font-black uppercase leading-none tracking-tight">
              Trace the money
            </h2>
            <p className="mt-3 text-muted">
              We flagged transactions that match the scam. Freeze if anything
              looks wrong.
            </p>
          </div>
          {money && <BlastRadius money={money} />}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={back}>
              ← Back
            </Button>
            <Button className="flex-1" onClick={next}>
              Finish →
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <RecoverySummary
            assets={assets}
            money={money}
            onExport={() => downloadReport(incident, log, money, assets)}
          />
          <details className="group">
            <summary className="label cursor-pointer list-none text-center text-muted hover:text-red">
              ▾ View full event log
            </summary>
            <div className="mt-3">
              <IncidentLog
                incident={incident}
                events={log}
                money={money}
                assets={assets}
                showExport={false}
              />
            </div>
          </details>
        </div>
      )}
      </div>
    </div>
  );
}
