"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/app/_client/api";
import type {
  Incident,
  Asset,
  MoneyResult,
  LogEvent,
  ScopeAction,
} from "@/app/_client/types";
import { SectionTitle, Card } from "@/components/ui";
import { VerdictCard } from "@/components/VerdictCard";
import { ActionFlow } from "@/components/ActionFlow";
import { ScopeBoard } from "@/components/ScopeBoard";
import { BlastRadius } from "@/components/BlastRadius";
import { IncidentLog } from "@/components/IncidentLog";

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

  if (error) {
    return (
      <Card className="text-center">
        <p className="text-lg font-semibold">Incident not found.</p>
        <Link href="/" className="mt-2 inline-block text-brand underline">
          Start a new one
        </Link>
      </Card>
    );
  }

  if (!incident) {
    return <div className="animate-pulse text-muted">Loading incident…</div>;
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-brand">
          ← New incident
        </Link>
        <span className="font-mono text-xs text-muted">#{incident.id}</span>
      </div>

      <section>
        <SectionTitle n={1} title="Verdict" sub="What this message is, honestly." />
        <VerdictCard incident={incident} />
      </section>

      <section>
        <SectionTitle
          n={2}
          title="What did you do?"
          sub="Answer a few quick questions so we know what's exposed."
        />
        <ActionFlow onAnswer={onAnswer} onDone={() => {}} />
      </section>

      <section>
        <SectionTitle n={3} title="Scope of compromise" sub="Lock anything at risk." />
        <ScopeBoard assets={assets} onLock={onLock} />
      </section>

      <section>
        <SectionTitle n={4} title="Blast radius" sub="Money traced from your accounts." />
        {money && <BlastRadius money={money} />}
      </section>

      <section>
        <SectionTitle n={5} title="Record" sub="Every action, timestamped." />
        <IncidentLog
          incident={incident}
          events={log}
          money={money}
          assets={assets}
        />
      </section>
    </div>
  );
}
