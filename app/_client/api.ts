// Single API surface for the frontend. Uses the in-browser mock until the
// backend ships /app/api, then flip NEXT_PUBLIC_USE_MOCK=false.
import type { Incident, ScopeAction, ScopeResult, MoneyResult, LogResult } from "./types";
import * as mock from "./mock";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const api = {
  createIncident(message: string): Promise<Incident> {
    return USE_MOCK
      ? mock.createIncident(message)
      : http("/api/incident", { method: "POST", body: JSON.stringify({ message }) });
  },
  getIncident(id: string): Promise<Incident> {
    // No GET in the contract yet; mock serves it. Backend can add /api/incident/:id.
    return mock.getIncident(id);
  },
  patchScope(id: string, action: ScopeAction): Promise<ScopeResult> {
    return USE_MOCK
      ? mock.patchScope(id, action)
      : http(`/api/incident/${id}/scope`, { method: "PATCH", body: JSON.stringify({ action }) });
  },
  lockAsset(id: string, name: string): Promise<ScopeResult> {
    return mock.lockAsset(id, name);
  },
  getScope(id: string): Promise<ScopeResult> {
    return mock.getScope(id);
  },
  getMoney(id: string): Promise<MoneyResult> {
    return USE_MOCK ? mock.getMoney(id) : http(`/api/incident/${id}/money`);
  },
  getLog(id: string): Promise<LogResult> {
    return USE_MOCK ? mock.getLog(id) : http(`/api/incident/${id}/log`);
  },
};
