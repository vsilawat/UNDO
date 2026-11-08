# UNDO: Team Task Split

Two people, one repo, minimal merge conflicts. **Person A owns the backend (`/lib`, `/app/api`, `/data`). Person B owns the frontend (`/app` pages, `/components`).** Don't edit each other's folders without a heads-up in chat.

Assumed stack: **Next.js** (frontend + API routes in one project), in-memory/JSON storage, no database. If you pick something else, the split stays the same.

## Ground rules

- `git pull --rebase` before you start, commit small, push often.
- Push straight to `main` tonight. No branches or PRs.
- Never commit keys. Use `.env.local`; keep `.env.example` up to date.
- Build against the **API contract below** so neither person is blocked. Person B starts with mock JSON, Person A swaps in real data.

## API contract (agree on this first, 10 min)

```
POST /api/incident            body: { message }
  -> { id, createdAt, scrubbedMessage, scamType, confidence, isScam,
       redFlags: [], nextSteps: [] }

PATCH /api/incident/:id/scope  body: { action: "clicked_link" | "shared_code" | "sent_money" | "shared_password" }
  -> { assets: [{ name, status: "safe" | "at_risk" | "compromised" | "locked" }] }

GET  /api/incident/:id/money   -> { transactions: [{ id, amount, payee, date, flagged, reason }],
                                     totalAtRisk, recommendation: "freeze" | "dispute" | "monitor" }

GET  /api/incident/:id/log     -> { events: [{ time, text }] }
```

## Person A: Backend

| # | Task | Notes |
|---|------|-------|
| A1 | Project scaffold + `.env.example` | Next.js app, push the skeleton first so B can start |
| A2 | PII scrubber (`/lib/scrub.ts`) | Regex for phones, emails, long digit strings |
| A3 | Scam classifier (`/lib/classify.ts`) | T-Mobile baseline classifier and/or one LLM call returning JSON. Fall back to baseline if LLM output is malformed. Abstain when confidence is low |
| A4 | `POST /api/incident` | Scrub, classify, create the incident record, write the first log event |
| A5 | Scope logic (`/lib/scope.ts`) + `PATCH .../scope` | Rules-based: each action maps to asset status changes (clicked link -> email "at risk", shared code -> phone "compromised", etc.). Every change appends to the log |
| A6 | Nessie integration (`/lib/nessie.ts`) + `GET .../money` | Pull mock accounts and transactions, flag ones matching the scam, compute total at risk |
| A7 | `GET .../log` and incident report export | Plain-text or markdown report built from the log |
| A8 | Synthetic test data | A few scam messages and one legitimate message for the demo |

## Person B: Frontend

| # | Task | Notes |
|---|------|-------|
| B1 | Layout, theme, base components | Calm, high-contrast, big buttons. "Easy under stress" is a judging criterion |
| B2 | Intake screen | Paste box, "Open incident" button, loading state |
| B3 | Verdict card | Scam type, confidence bar, red flags, "I'm not sure" state for low confidence, "looks legitimate" state |
| B4 | "What did you do?" flow | One question per screen, big buttons, no tutorial needed |
| B5 | Scope board | Asset cards with status chips: Safe / At risk / Compromised / Locked |
| B6 | Blast radius screen | Transaction list, flagged rows highlighted, total at risk, freeze/dispute recommendation |
| B7 | Incident log + Export report button | Timeline view, button downloads the report |
| B8 | Helper view (stretch) | Victim/Helper role switcher and polling. Skip if behind |

## Shared (do together)

| Task | Owner |
|------|-------|
| Devpost description, video script | Person B drafts, Person A reviews |
| Demo video recording | Both. One drives, one narrates |
| README setup instructions | Person A |
| Final submit + checklist | Both, 15 min buffer before deadline |

## Timeline

| Time | Person A | Person B |
|------|----------|----------|
| 0:00-0:30 | A1 scaffold, push. Agree on API contract | Wait for scaffold, sketch screens, B1 |
| 0:30-1:30 | A2, A3, A4 | B2, B3 using mock JSON |
| 1:30-2:30 | A5, A6 | B4, B5 |
| 2:30-3:15 | A7, A8, wire fixes | B6, B7, hook up real API |
| 3:15-4:00 | README, bug fixes | Devpost write-up, record video |
| 4:00 | **Submit.** Add stretch items after submitting | |

## Demo scenarios

1. Obvious scam text: verdict, then walk the scope flow, then show the blast radius.
2. Subtle scam: shows "not sure" and honest confidence.
3. Legitimate message: correctly not flagged.

## Tracks

- **T-Mobile:** scam detection with honest confidence, privacy by design, clear next steps
- **Winstead:** incident log, scope board, simple under stress, secure design (core logic works without external services)
- **Capital One:** Nessie money tracing
