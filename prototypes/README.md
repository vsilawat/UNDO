# Backend pipeline reference

`pipeline.py` is Vasu's six-stage reference pipeline: intake, scrub, classify,
scope, money trace, and report. It records the intended order of operations and
sample rules. It is **not connected** to the running Next.js app.

The app in `app/` and `components/` is Next.js. Backend implementation belongs
in `lib/` and `app/api/`, following the response shapes and routes in
[`Agentic Web Tasks.md`](../Agentic%20Web%20Tasks.md). Keep frontend and backend
work on that shared contract.

Before using this pipeline for an API, address these prototype limitations:

- Its snake_case fields, asset object, and `"at risk"` status differ from the
  frontend's camelCase fields, asset array, and `"at_risk"` status.
- The current confidence formula never reaches the `"I'm not sure"` state.
- Scope actions can lower an asset from `compromised` to `at risk`.
- Money tracing uses fixed transactions; an empty list also falls back to them.
- It has no persistence or API routes, and it does not call Nessie.

Port the logic and correct these issues as the TypeScript backend is built.
