import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Asset, Incident, LogEvent, MoneyResult } from "@/app/_client/types";
import { initialAssets } from "./scope";

export interface RecordData {
  incident: Incident;
  assets: Asset[];
  events: LogEvent[];
  money?: MoneyResult;
}

// Local JSON storage for the demo. Use a durable database for a hosted deployment.
const dataDir = process.env.UNDO_DATA_DIR || join(tmpdir(), "undo-incidents");
const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function pathFor(id: string): string {
  if (!validId.test(id)) throw new Error("Invalid incident ID");
  return join(dataDir, `${id}.json`);
}

export function saveRecord(record: RecordData): void {
  mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  const path = pathFor(record.incident.id);
  const temporary = `${path}.${randomUUID()}.tmp`;
  writeFileSync(temporary, JSON.stringify(record), { mode: 0o600 });
  renameSync(temporary, path);
}

export function createRecord(data: Omit<Incident, "id" | "createdAt">): RecordData {
  const createdAt = new Date().toISOString();
  const incident = { ...data, id: randomUUID(), createdAt };
  const record = {
    incident,
    assets: initialAssets(),
    events: [{ time: createdAt, text: `Incident opened — ${incident.scamType}` }],
  };
  saveRecord(record);
  return record;
}

export function getRecord(id: string): RecordData | undefined {
  if (!validId.test(id)) return undefined;
  try { return JSON.parse(readFileSync(pathFor(id), "utf8")) as RecordData; }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}
export function note(record: RecordData, text: string): void {
  record.events.push({ time: new Date().toISOString(), text });
}
