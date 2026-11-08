# UNDO
Incident command center for scam victims. Undo the damage in the first hour.

## Stack
Next.js (App Router) + Tailwind. The frontend uses the incident API by default.
Set `NEXT_PUBLIC_USE_MOCK=true` to use temporary in-browser sample data instead.

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Backend wiring
The frontend talks to the API through `app/_client/api.ts`. The API routes are
connected by default. To run the isolated frontend with temporary sample data:
```bash
# .env.local
NEXT_PUBLIC_USE_MOCK=true
```

Vasu's [backend pipeline reference](prototypes/README.md) records the intended
processing stages. It is a Python prototype, not a second app or a live backend.
The TypeScript backend implements the shared API contract in `Agentic Web Tasks.md`
under `lib/` and `app/api/`. It scrubs message content before classification and
storage. The baseline classifier runs locally without an LLM call.

The backend exposes `POST /api/incident`, `GET /api/incident/:id`,
`GET/PATCH /api/incident/:id/scope`, `PATCH /api/incident/:id/lock`,
`GET /api/incident/:id/money`,
`GET /api/incident/:id/log`, and `GET /api/incident/:id/report` (plain text).
The default money data is a deterministic demo set. To use a Nessie sandbox
account, set `NESSIE_API_KEY` and `NESSIE_ACCOUNT_ID` in `.env.local`.
The backend reads that account's purchases and withdrawals. A Nessie request
failure returns an error; it does not silently present demo transactions as live.

Incident records are local JSON files in the system temp directory by default
(`UNDO_DATA_DIR` overrides this). They contain scrubbed messages only. This is
for a single-machine demo; hosted deployments need durable storage and access
control before real personal or financial information is processed.

Demo inputs are in `data/scenarios.json`.

## Tracks
- **T-Mobile** — scam detection with honest confidence, privacy by design, clear next steps
- **Winstead** — incident log, scope board, simple under stress
- **Capital One** — Nessie money tracing
