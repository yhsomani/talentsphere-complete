# TalentSphere system model (verified current behaviour)

Written 2026-10-23. This set describes what the code does today, with `path:line` evidence. It is not a statement of intent, and it does not claim full coverage of the repository.

| File | Contents |
| ---- | -------- |
| [01-inventory-and-coverage.md](01-inventory-and-coverage.md) | Measured repository counts, the coverage statement and the sample data that was removed |
| [02-flows.md](02-flows.md) | Mermaid flowcharts F1 to F7: architecture, auth, jobs and applications, verified work history, Stripe billing, boot and background jobs, web journeys |
| [03-conflict-register.md](03-conflict-register.md) | 7 resolved and 21 open conflicts between code, documents and tests, with decision records |
| [04-conditions.md](04-conditions.md) | Condition and business-rule matrix (62 rules) |
| [06-route-authorization.md](06-route-authorization.md) | Second coverage pass: who may call each of about 170 more routes, what is durable, 4 fixes made and 15 further findings (CF-31 to CF-45) |
| [05-audit.md](05-audit.md) | Completeness audit, traceability sample, commands run and their results, limitations |

Reading order for a new engineer: 02 (F1, then the flow you work on), 04, then 03 for what to distrust.

Rules for keeping it true: change a diagram in the same commit as the code it describes; re-check a `path:line` before relying on it (lines drift); add every new contradiction to 03 instead of fixing a document silently.
