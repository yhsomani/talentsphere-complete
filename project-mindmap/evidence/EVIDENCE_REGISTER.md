# Evidence Register

The full register is [`EVIDENCE_REGISTER.csv`](EVIDENCE_REGISTER.csv): **2,267 rows** for 2,188 nodes (id, type, name, file, line, symbol, status, confidence, linked test files, notes). Machine-readable with full properties: [`../master/MASTER_PROJECT_GRAPH.json`](../master/MASTER_PROJECT_GRAPH.json).

## Evidence rules

1. A node exists only if a file location was found for it (route registration line, export, `CREATE TABLE`, `<Route>`, test title, workflow file).
2. A relationship exists only if a source construct implies it (call, import, SQL verb, JSX link, `parse(...)`). The edge's `file`/`line`/`note` say which.
3. Status is derived from structure, never from documentation. Confidence is `MEDIUM` where source supports the capability and `LOW` where inferred; **`HIGH` is not used because nothing was executed**.
4. Where the scan cannot tell, the node says `UNKNOWN` or the note says "not derivable" instead of a guess.

## Key findings with evidence

| #   | Finding                                                             | Evidence                                              | Confidence |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------- | ---------- |
| 1   | 85 of 282 endpoints are durable; the rest are in-memory             | `apps/api/src/durability.ts` `DURABLE_ROUTES`         | MEDIUM     |
| 2   | Worker performs real work for 2 of 45 dispatch kinds                | `apps/worker/src/index.ts` claimHandlers              | MEDIUM     |
| 3   | 78 of 112 tables have no SQL consumer in source                     | graph `DB` nodes, `NOT_IMPLEMENTED`                   | LOW        |
| 4   | Browser route guard checks token presence only                      | `apps/web/src/App.tsx` `RequireAuth`                  | MEDIUM     |
| 5   | Only application and job lifecycles have explicit transition tables | `packages/domain/src/core.ts:99`, `jobs.ts:25`        | MEDIUM     |
| 6   | Interview meeting links are a fixed-host template                   | `packages/domain/src/technical-interview.ts`          | MEDIUM     |
| 7   | Stripe and Brevo are opt-in; behaviour not verified live            | `billing-stripe.ts`, `apps/worker/src/email/brevo.ts` | MEDIUM     |
| 8   | CI on `main` red since 2026-10-26                                   | GitHub Actions run list (read-only)                   | MEDIUM     |
