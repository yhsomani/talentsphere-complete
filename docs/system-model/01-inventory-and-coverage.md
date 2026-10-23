# System model 01 — Inventory and coverage

Measured on 2026-10-23 from the git tree at the commit that adds this file. Every number below came from a command run against the repository, not from documentation.

## Coverage statement (read this first)

This model does **not** claim that 100% of the repository was inspected. The terms below are used strictly.

| Term         | Meaning here                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Discovered   | The file or route exists in the git tree or in a source listing.                               |
| Inspected    | A person or agent read the relevant lines and cited them as `path:line`.                       |
| Verified     | Inspected, and a test or command run during this work exercised the behaviour.                 |

Only the areas listed in `02-flows.md` were inspected for flow modelling. `apps/api/src/server.ts` is one 13,000-line file with 278 unique routes; each route was discovered, but only the routes named in the flow documents were inspected. Everything else is "discovered, not inspected".

Not accessible from this work: the GitHub issue and PR threads beyond what the public API returned, the live Stripe and Supabase projects' contents beyond a read-only look at Supabase migrations and advisors, and any production deployment. Documentation was read selectively (see the conflict register for what was compared).

## Repository size (git-tracked files: 880)

| Top-level directory | Tracked files | Note                                                                 |
| ------------------- | ------------- | -------------------------------------------------------------------- |
| `tests`             | 201           | unit 64, integration 51, security 5, e2e 59, pg 12 (plus helpers)    |
| `.agents`           | 135           | agent skill and collaboration artifacts, not application code        |
| `graphify-out`      | 127           | generated knowledge-graph output                                     |
| `apps`              | 126           | api, web, worker                                                     |
| `packages`          | 71            | config, contracts, domain, observability, testing, ui                |
| `supabase`          | 54            | 53 migrations (`00001`-`00053`) and seed folder                      |
| `docs`              | 42            | product, engineering, quality and report documents (plus this model) |
| other               | the rest      | `.playwright-cli`, `.audit`, `scripts`, `deploy`, `.github`, ...     |

Application source (non-test `.ts`/`.tsx` under `apps` and `packages`): 147 files.

## API surface

- 281 route registrations in `apps/api/src/server.ts` and `apps/api/src/billing-stripe.ts`; 278 unique method-and-path pairs. By method: 132 GET, 123 POST, 13 PATCH, 11 DELETE, 2 PUT.
- `apps/api/src/durability.ts` lists 80 routes whose state is durable in PostgreSQL or stateless. The remaining routes keep state in process memory and answer with `x-talentsphere-durability: ephemeral`.
- Web app: 29 page components in `apps/web/src/pages`.

## Sample, mock and fabricated data removed from the running application

| Item                                                                                       | Where                                  | Action                                    |
| ------------------------------------------------------------------------------------------ | -------------------------------------- | ----------------------------------------- |
| 60 invented career transitions (28 + 22 + 10 people)                                       | `server.ts` career section             | Removed (`fb38674b`)                      |
| Invented market signals for four skills, and invented baseline signals in three routes     | `server.ts` forecast section           | Removed (`fb38674b`)                      |
| Constant retention rate (88.5) and a data source that was never collected                  | `packages/domain/src/career-trajectory.ts` | Removed (`fb38674b`)                  |
| Sample course (3 stub lessons, nil-UUID instructor)                                        | `server.ts` LMS section                | Removed                                   |
| Sample coding challenge                                                                    | `server.ts` challenges section         | Removed                                   |
| 35 invented learner outcomes (80% hire rate) shown as the sample course's measured impact  | `server.ts` learning-impact section    | Removed                                   |

Reference data kept on purpose: the canonical skills taxonomy (`seedSkills`, BR-141) and the feature-flag defaults in `scripts/seed.mjs`.

Still simulated, awaiting an owner decision (issue #49): the interview code evaluator in `packages/domain/src/technical-interview.ts` decides pass or fail from the text of the code (it fails closed in staging and production), and a second placeholder in `packages/domain/src/assessment.ts:132` handles challenge submissions (mitigated: the evidence is stored unverified with `executed:false`).
