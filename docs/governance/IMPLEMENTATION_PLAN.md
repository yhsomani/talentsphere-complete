# TalentSphere — IMPLEMENTATION_PLAN.md v6.0

## Current delivery baseline — 2026-10-21

The phases below preserve founder intent. For the evidence-based execution sequence,
read the [current audit](../reports/FEATURE_STATUS_2026-10-21.md) and
[delivery roadmap](../reports/FEATURE_PLAN_2026-10-21.md). They distinguish a proposed
restricted beta from the full PRD career-loop GA; neither scope is silently approved.
Prioritize honest assessment results, safe worker claims, recoverable erasure and
live verification evidence before expanding the portfolio. Registry scores remain
separate from P0–P3 delivery urgency. Persist only admitted user journeys, one complete
increment at a time. Existing mail adapters and durable stores must be reused.

Current memory-mode tests and non-emitting typechecks pass; formatting and missing
PostgreSQL/browser/deployment evidence remain explicit gates. Protected build files
stay read-only without explicit user authorization. See the audit for inspection
limits, moving-HEAD provenance and the remaining atomic-contract review.

## Founder execution order

### Phase 0 — Platform Trust Foundation
Repository, environments, CI/CD, Supabase, Postgres, migrations, Auth, authorization, RLS, API boundary, audit, observability, design system, PWA shell, AI policy engine.

### Phase 1 — Career Identity
Profile, goals, skills, ontology, experience, education, portfolio.

### Phase 2 — Evidence & Learning
Evidence, verification foundation, courses, progress, challenges, assessment core.

### Phase 3 — Opportunity Loop
Jobs, search, applications, recruiter pipeline, messaging, notifications.

### Phase 4 — Hiring Depth
Interview, scorecards, application feedback, references, career outcomes.

### Phase 5 — Intelligence
Talent/Evidence/Career graph, matching, recommendations, readiness, market signals.

### Phase 6 — Trust & Ecosystem
Reputation, moderation, appeals, anti-gaming, mentorship, networking.

### Phase 7 — Institutional/Enterprise
Institutions, licensing, reporting, procurement, enterprise controls.

### Phase 8 — Advanced AI
Expanded AI capabilities after gateway/policy/evaluation foundations are proven.

### Phase 9 — Expansion
Marketplace, advanced analytics, internal mobility, advanced forecasting, external ecosystem.

### Phase 10 — Scale
Only measured search extraction, cache, replicas, selective service extraction, bounded agents/automation.

## Exit gates

Every phase must prove:
- user outcome;
- architecture integrity;
- security;
- accessibility;
- tests;
- observability;
- documentation;
- rollback/recovery.

## First implementation epics

1. monorepo/tooling
2. CI
3. database/migrations
4. Auth
5. authorization/RLS
6. audit
7. API contract
8. PWA shell
9. design system
10. observability
11. profile
12. ontology
13. evidence
14. learning
15. assessment
16. jobs
17. applications
18. recruiter workflow
19. career graph
20. AI Gateway

## Rule

Do not start downstream implementation merely because a feature has high priority. All blocking dependencies must be ready or intentionally mocked with a documented exit path.
