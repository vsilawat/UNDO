# UNDO
Incident command center for scam victims. Undo the damage in the first hour.

## Stack
Next.js (App Router) + Tailwind. Frontend ships with an in-browser mock backend,
so it runs with zero backend wiring.

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Backend wiring
The frontend talks to the API through `app/_client/api.ts`. Until the real API
routes are live it uses the mock in `app/_client/mock.ts`. Flip it:
```bash
# .env.local
NEXT_PUBLIC_USE_MOCK=false
```

Vasu's [backend pipeline reference](prototypes/README.md) records the intended
processing stages. It is a Python prototype, not a second app or a live backend.
The production backend should implement the shared API contract in
`Agentic Web Tasks.md` using `lib/` and `app/api/`.

## Tracks
- **T-Mobile** — scam detection with honest confidence, privacy by design, clear next steps
- **Winstead** — incident log, scope board, simple under stress
- **Capital One** — Nessie money tracing
