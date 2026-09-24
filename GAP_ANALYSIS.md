# TalentSphere — GAP_ANALYSIS.md v6.0

## Important reality

No repository implementation has been verified in the current baseline. Therefore this is primarily a **design/documentation/architecture gap register**, not a code defect report.

## Resolved gaps

| Gap | Resolution |
|---|---|
| Direct table API vs domain API ambiguity | Browser uses application API for domain mutations |
| AI platform late in roadmap | Gateway/policy foundation moved to Phase 0 |
| Oversized shared kernel | Shared kernel narrowed to true cross-cutting primitives |
| 173 features treated as implementation target | Portfolio separated from GA scope |
| Consumer AI subscription assumption | Explicitly separated from API authorization |
| Free AI cost ambiguity | Hard cost policy |
| Assessment AI escape routes | Session-aware gateway enforcement |
| Candidate-level hiring prediction risk | Reframed as governed/descriptive intelligence |
| Hard-coded retention | Policy-driven |
| Low cohort threshold | Conservative configurable suppression |
| Hash commitment called ZK | Corrected terminology; stable VC 2.0 target |
| LinkedIn runtime dependency | Adapter-only |
| Realtime as correctness | Advisory only |
| Queue exactly-once confusion | Idempotent side effects |
| Production-ready documentation claims | Separate specification vs runtime readiness |

## Remaining decision-gated gaps

- legal review for interview recording;
- final licensed market-data providers;
- media provider selection;
- institution legal/controller-processor model;
- pricing validation;
- optional proctoring decision;
- AI provider support matrix;
- regional compliance mappings.

## Verification gaps

These cannot be closed by documentation:
- executable implementation;
- deployment;
- security penetration evidence;
- accessibility conformance evidence;
- performance under target load;
- backup/restore drill;
- incident-response drill;
- AI evaluation results;
- assessment anti-cheat validation.

## Gap closure rule

For each remaining gap:
```text
Owner
→ evidence required
→ decision
→ implementation impact
→ test
→ acceptance
→ closure date
```
